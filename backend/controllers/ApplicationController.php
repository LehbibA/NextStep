<?php
require_once __DIR__ . '/../config/config.php';
require_once 'models/User.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class ApplicationController {
    private $dataFile = 'data/applications.json';
    private $uploadsDir = 'uploads/cv/';

    public function __construct() {
        // Créer le dossier uploads/cv s'il n'existe pas
        if (!file_exists($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
        }
    }

    private function verifierToken() {
        header('Content-Type: application/json');
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Token manquant']);
            exit;
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);

        try {
            $decoded = JWT::decode($token, new Key(SECRET_KEY, 'HS256'));
            return $decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Token invalide']);
            exit;
        }
    }

    /**
     * Postuler à une offre d'emploi avec CV
     */
    public function apply() {
        $decoded = $this->verifierToken();
        
        // Seuls les candidats peuvent postuler
        if ($decoded->role !== 'candidat') {
            http_response_code(403);
            echo json_encode(['error' => 'Seuls les candidats peuvent postuler']);
            return;
        }

        // Récupérer les données POST et fichiers
        $jobId = $_POST['job_id'] ?? null;
        $coverLetter = $_POST['cover_letter'] ?? '';
        $cvType = $_POST['cv_type'] ?? 'generated';

        // Validation des données
        if (!$jobId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de l\'offre manquant']);
            return;
        }

        // Vérifier si l'offre existe
        if (!$this->jobExists($jobId)) {
            http_response_code(404);
            echo json_encode(['error' => 'Offre non trouvée']);
            return;
        }

        // Vérifier si l'utilisateur a déjà postulé
        if ($this->hasAlreadyApplied($decoded->user_id, $jobId)) {
            http_response_code(409);
            echo json_encode(['error' => 'Vous avez déjà postulé à cette offre']);
            return;
        }

        $cvPath = null;
        
        // Gérer le téléchargement de CV si cvType = 'upload'
        if ($cvType === 'upload' && isset($_FILES['cv'])) {
            $cvPath = $this->handleCVUpload($_FILES['cv'], $decoded->user_id, $jobId);
            if (!$cvPath) {
                http_response_code(400);
                echo json_encode(['error' => 'Erreur lors du téléchargement du CV']);
                return;
            }
        }

        // Créer la candidature
        $applicationId = $this->createApplication($decoded->user_id, $jobId, $coverLetter, $cvType, $cvPath);

        if ($applicationId) {
            echo json_encode([
                'success' => true,
                'message' => 'Candidature envoyée avec succès',
                'application_id' => $applicationId
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de l\'envoi de la candidature']);
        }
    }

    /**
     * Gérer le téléchargement de CV
     */
    private function handleCVUpload($file, $userId, $jobId) {
        // Vérifier les erreurs de téléchargement
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }

        // Vérifier la taille du fichier (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            return false;
        }

        // Vérifier le type de fichier
        $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        $fileType = $file['type'];
        
        if (!in_array($fileType, $allowedTypes)) {
            return false;
        }

        // Générer un nom de fichier unique
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'cv_' . $userId . '_' . $jobId . '_' . time() . '.' . $extension;
        $filePath = $this->uploadsDir . $fileName;

        // Déplacer le fichier téléchargé
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            return $fileName; // Retourner seulement le nom du fichier
        }

        return false;
    }

    /**
     * Récupérer les candidatures d'un candidat
     */
    public function getUserApplications() {
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'candidat') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé']);
            return;
        }

        $applications = $this->getApplicationsByUser($decoded->user_id);
        
        echo json_encode([
            'success' => true,
            'applications' => $applications
        ]);
    }

    /**
     * Récupérer les candidatures reçues par un recruteur
     */
    public function getRecruiterApplications() {
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé']);
            return;
        }

        $applications = $this->getApplicationsForRecruiter($decoded->user_id);
        
        echo json_encode([
            'success' => true,
            'applications' => $applications
        ]);
    }

    /**
     * Télécharger un CV
     */
    public function downloadCV($fileName) {
        $decoded = $this->verifierToken();
        
        // Seuls les recruteurs peuvent télécharger des CV
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé']);
            return;
        }

        $filePath = $this->uploadsDir . $fileName;
        
        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['error' => 'Fichier non trouvé']);
            return;
        }

        // Vérifier que le recruteur a le droit de voir ce CV
        if (!$this->canAccessCV($decoded->user_id, $fileName)) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé à ce fichier']);
            return;
        }

        // Télécharger le fichier
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    /**
     * Vérifier si un recruteur peut accéder à un CV
     */
    private function canAccessCV($recruiterId, $fileName) {
        if (!file_exists($this->dataFile)) {
            return false;
        }

        $applications = json_decode(file_get_contents($this->dataFile), true);
        if (!is_array($applications)) {
            return false;
        }

        // Récupérer les offres du recruteur
        $offersFile = 'data/offres.json';
        $recruiterJobIds = [];
        
        if (file_exists($offersFile)) {
            $offers = json_decode(file_get_contents($offersFile), true) ?? [];
            foreach ($offers as $offer) {
                if (isset($offer['created_by']) && $offer['created_by'] === $recruiterId) {
                    $recruiterJobIds[] = $offer['id'];
                }
            }
        }

        // Vérifier si ce CV correspond à une candidature pour les offres du recruteur
        foreach ($applications as $app) {
            if (in_array($app['job_id'], $recruiterJobIds) && 
                isset($app['cv_path']) && 
                $app['cv_path'] === $fileName) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mettre à jour le statut d'une candidature (pour recruteurs)
     */
    public function updateApplicationStatus() {
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé']);
            return;
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['application_id'], $data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID candidature et statut requis']);
            return;
        }

        $applicationId = $data['application_id'];
        $newStatus = $data['status'];
        $feedback = $data['feedback'] ?? '';

        // Vérifier que le statut est valide
        $validStatuses = ['pending', 'accepted', 'rejected'];
        if (!in_array($newStatus, $validStatuses)) {
            http_response_code(400);
            echo json_encode(['error' => 'Statut invalide']);
            return;
        }

        // Mettre à jour le statut
        if ($this->updateStatus($applicationId, $newStatus, $feedback, $decoded->user_id)) {
            echo json_encode([
                'success' => true,
                'message' => 'Statut mis à jour avec succès'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Candidature non trouvée ou accès refusé']);
        }
    }

    // ============= MÉTHODES PRIVÉES =============

    private function jobExists($jobId) {
        $offersFile = 'data/offres.json';
        if (!file_exists($offersFile)) {
            return false;
        }

        $offers = json_decode(file_get_contents($offersFile), true);
        if (!is_array($offers)) {
            return false;
        }

        foreach ($offers as $offer) {
            if ($offer['id'] === $jobId) {
                return true;
            }
        }
        return false;
    }

    private function hasAlreadyApplied($userId, $jobId) {
        if (!file_exists($this->dataFile)) {
            return false;
        }

        $applications = json_decode(file_get_contents($this->dataFile), true);
        if (!is_array($applications)) {
            return false;
        }

        foreach ($applications as $app) {
            if ($app['user_id'] === $userId && $app['job_id'] === $jobId) {
                return true;
            }
        }
        return false;
    }

    private function createApplication($userId, $jobId, $coverLetter, $cvType, $cvPath = null) {
        // Charger les candidatures existantes
        $applications = [];
        if (file_exists($this->dataFile)) {
            $content = file_get_contents($this->dataFile);
            if (!empty($content)) {
                $applications = json_decode($content, true) ?? [];
            }
        }

        // Créer la nouvelle candidature
        $applicationId = uniqid();
        $newApplication = [
            'id' => $applicationId,
            'user_id' => $userId,
            'job_id' => $jobId,
            'cover_letter' => $coverLetter,
            'cv_type' => $cvType,
            'cv_path' => $cvPath, // Chemin du fichier CV téléchargé
            'status' => 'pending',
            'feedback' => '',
            'applied_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        // Ajouter à la liste
        $applications[] = $newApplication;

        // Sauvegarder
        if (file_put_contents($this->dataFile, json_encode($applications, JSON_PRETTY_PRINT))) {
            return $applicationId;
        }
        return false;
    }

    private function getApplicationsByUser($userId) {
        if (!file_exists($this->dataFile)) {
            return [];
        }

        $applications = json_decode(file_get_contents($this->dataFile), true);
        if (!is_array($applications)) {
            return [];
        }

        $userApplications = [];
        $offersFile = 'data/offres.json';
        $offers = [];
        
        if (file_exists($offersFile)) {
            $offers = json_decode(file_get_contents($offersFile), true) ?? [];
        }

        foreach ($applications as $app) {
            if ($app['user_id'] === $userId) {
                // Enrichir avec les détails de l'offre
                foreach ($offers as $offer) {
                    if ($offer['id'] === $app['job_id']) {
                        $app['job_title'] = $offer['titre'];
                        $app['company'] = $offer['entreprise'] ?? 'Entreprise inconnue';
                        $app['location'] = $offer['lieu'];
                        $app['salary'] = $offer['salaire'];
                        $app['job_type'] = $offer['type'];
                        break;
                    }
                }
                $userApplications[] = $app;
            }
        }

        return $userApplications;
    }

    private function getApplicationsForRecruiter($recruiterId) {
        if (!file_exists($this->dataFile)) {
            return [];
        }

        $applications = json_decode(file_get_contents($this->dataFile), true);
        if (!is_array($applications)) {
            return [];
        }

        // Récupérer les offres du recruteur
        $offersFile = 'data/offres.json';
        $recruiterJobIds = [];
        
        if (file_exists($offersFile)) {
            $offers = json_decode(file_get_contents($offersFile), true) ?? [];
            foreach ($offers as $offer) {
                if (isset($offer['created_by']) && $offer['created_by'] === $recruiterId) {
                    $recruiterJobIds[] = $offer['id'];
                }
            }
        }

        $recruiterApplications = [];
        $usersFile = 'data/users.json';
        $users = [];
        
        if (file_exists($usersFile)) {
            $users = json_decode(file_get_contents($usersFile), true) ?? [];
        }

        foreach ($applications as $app) {
            if (in_array($app['job_id'], $recruiterJobIds)) {
                // Enrichir avec les détails du candidat et de l'offre
                foreach ($users as $user) {
                    if ($user['id'] === $app['user_id']) {
                        $app['candidate_name'] = trim(($user['prenom'] ?? '') . ' ' . ($user['nom'] ?? ''));
                        $app['candidate_email'] = $user['email'];
                        break;
                    }
                }
                
                // Ajouter les détails de l'offre
                foreach ($offers as $offer) {
                    if ($offer['id'] === $app['job_id']) {
                        $app['job_title'] = $offer['titre'];
                        break;
                    }
                }
                
                $recruiterApplications[] = $app;
            }
        }

        return $recruiterApplications;
    }

    private function updateStatus($applicationId, $newStatus, $feedback, $recruiterId) {
        if (!file_exists($this->dataFile)) {
            return false;
        }

        $applications = json_decode(file_get_contents($this->dataFile), true);
        if (!is_array($applications)) {
            return false;
        }

        // Vérifier que l'application appartient au recruteur
        $offersFile = 'data/offres.json';
        $recruiterJobIds = [];
        
        if (file_exists($offersFile)) {
            $offers = json_decode(file_get_contents($offersFile), true) ?? [];
            foreach ($offers as $offer) {
                if (isset($offer['created_by']) && $offer['created_by'] === $recruiterId) {
                    $recruiterJobIds[] = $offer['id'];
                }
            }
        }

        foreach ($applications as $index => $app) {
            if ($app['id'] === $applicationId && in_array($app['job_id'], $recruiterJobIds)) {
                $applications[$index]['status'] = $newStatus;
                $applications[$index]['feedback'] = $feedback;
                $applications[$index]['updated_at'] = date('Y-m-d H:i:s');

                file_put_contents($this->dataFile, json_encode($applications, JSON_PRETTY_PRINT));
                return true;
            }
        }

        return false;
    }
}
?>