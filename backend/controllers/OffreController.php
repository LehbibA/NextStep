<?php
require_once __DIR__ . '/../config/config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class OffreController
{
    private $dataFile = 'data/offres.json';

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
     * Créer une nouvelle offre d'emploi
     */
    public function create()
    {
        // Vérifier l'authentification et le rôle
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Seuls les recruteurs peuvent créer des offres']);
            return;
        }

        // Lire les données JSON envoyées
        $json = file_get_contents('php://input');
        $donnees = json_decode($json, true);

        // Vérifier les champs obligatoires
        if (!isset($donnees['titre'], $donnees['description'], $donnees['lieu'], $donnees['type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Champs requis manquants (titre, description, lieu, type)']);
            return;
        }

        // Charger les offres existantes
        $offres = [];
        if (file_exists($this->dataFile)) {
            $contenu = file_get_contents($this->dataFile);
            $offres = json_decode($contenu, true) ?? [];
        }

        // Générer un ID unique
        $id = uniqid();

        // Créer l'offre avec toutes les informations
        $offre = [
            'id' => $id,
            'titre' => $donnees['titre'],
            'entreprise' => $donnees['entreprise'] ?? 'Entreprise inconnue',
            'description' => $donnees['description'],
            'lieu' => $donnees['lieu'],
            'ville' => $donnees['ville'] ?? $donnees['lieu'], // Compatibilité
            'type' => $donnees['type'],
            'salaire' => $donnees['salaire'] ?? 'Non spécifié',
            'secteur' => $donnees['secteur'] ?? 'Non spécifié',
            'experience_requise' => $donnees['experience'] ?? 'Non spécifiée',
            'competences_requises' => $donnees['competences'] ?? '',
            'avantages' => $donnees['avantages'] ?? '',
            'status' => 'active',
            'created_by' => $decoded->user_id, // ID du recruteur qui a créé l'offre
            'date_creation' => date('Y-m-d H:i:s'),
            'date_modification' => date('Y-m-d H:i:s')
        ];

        // Ajouter l'offre à la liste
        $offres[] = $offre;

        // Sauvegarder dans le fichier JSON
        if (file_put_contents($this->dataFile, json_encode($offres, JSON_PRETTY_PRINT))) {
            echo json_encode([
                'success' => true, 
                'message' => 'Offre créée avec succès',
                'offre_id' => $id,
                'offre' => $offre
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
        }
    }

    /**
     * Récupérer toutes les offres d'emploi
     * ✅ CORRECTION : Vérifier le token mais permettre aux candidats de voir les offres
     */
    public function index()
    {
        // ✅ Vérifier le token mais permettre l'accès aux candidats ET recruteurs
        $decoded = $this->verifierToken();
        
        if (!file_exists($this->dataFile)) {
            echo json_encode([]);
            return;
        }

        $contenu = file_get_contents($this->dataFile);
        $offres = json_decode($contenu, true) ?? [];

        // ✅ Si c'est un candidat, montrer seulement les offres actives
        // ✅ Si c'est un recruteur, montrer ses propres offres
        if ($decoded->role === 'candidat') {
            // Filtrer seulement les offres actives pour les candidats
            $offresActives = array_filter($offres, function($offre) {
                return isset($offre['status']) && $offre['status'] === 'active';
            });
            $offres = array_values($offresActives);
        } elseif ($decoded->role === 'recruteur') {
            // Pour les recruteurs, montrer seulement leurs offres
            $mesOffres = array_filter($offres, function($offre) use ($decoded) {
                return isset($offre['created_by']) && $offre['created_by'] === $decoded->user_id;
            });
            $offres = array_values($mesOffres);
        }

        echo json_encode($offres);
    }

    /**
     * Récupérer une offre spécifique par ID
     */
    public function getById($offreId)
    {
        $decoded = $this->verifierToken();

        if (!file_exists($this->dataFile)) {
            http_response_code(404);
            echo json_encode(['error' => 'Offre non trouvée']);
            return;
        }

        $offres = json_decode(file_get_contents($this->dataFile), true) ?? [];

        foreach ($offres as $offre) {
            if ($offre['id'] === $offreId) {
                // Vérifier les permissions
                if ($decoded->role === 'candidat' && $offre['status'] !== 'active') {
                    http_response_code(404);
                    echo json_encode(['error' => 'Offre non trouvée']);
                    return;
                }
                
                if ($decoded->role === 'recruteur' && $offre['created_by'] !== $decoded->user_id) {
                    http_response_code(403);
                    echo json_encode(['error' => 'Accès refusé']);
                    return;
                }

                echo json_encode([
                    'success' => true,
                    'offre' => $offre
                ]);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Offre non trouvée']);
    }

    /**
     * Récupérer les offres d'un recruteur spécifique
     */
    public function getByRecruiter()
    {
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé']);
            return;
        }

        if (!file_exists($this->dataFile)) {
            echo json_encode([]);
            return;
        }

        $offres = json_decode(file_get_contents($this->dataFile), true) ?? [];
        $mesOffres = [];

        foreach ($offres as $offre) {
            if (isset($offre['created_by']) && $offre['created_by'] === $decoded->user_id) {
                $mesOffres[] = $offre;
            }
        }

        echo json_encode([
            'success' => true,
            'offres' => $mesOffres
        ]);
    }

    /**
     * Mettre à jour une offre
     */
    public function update($offreId)
    {
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Seuls les recruteurs peuvent modifier des offres']);
            return;
        }

        if (!file_exists($this->dataFile)) {
            http_response_code(404);
            echo json_encode(['error' => 'Offre non trouvée']);
            return;
        }

        $json = file_get_contents('php://input');
        $donnees = json_decode($json, true);

        $offres = json_decode(file_get_contents($this->dataFile), true) ?? [];

        foreach ($offres as $index => $offre) {
            if ($offre['id'] === $offreId && $offre['created_by'] === $decoded->user_id) {
                // Mettre à jour les champs modifiables
                $champsModifiables = [
                    'titre', 'entreprise', 'description', 'lieu', 'ville', 
                    'type', 'salaire', 'secteur', 'experience_requise', 
                    'competences_requises', 'avantages', 'status'
                ];

                foreach ($champsModifiables as $champ) {
                    if (isset($donnees[$champ])) {
                        $offres[$index][$champ] = $donnees[$champ];
                    }
                }

                $offres[$index]['date_modification'] = date('Y-m-d H:i:s');

                // Sauvegarder
                file_put_contents($this->dataFile, json_encode($offres, JSON_PRETTY_PRINT));

                echo json_encode([
                    'success' => true,
                    'message' => 'Offre mise à jour avec succès',
                    'offre' => $offres[$index]
                ]);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Offre non trouvée ou accès refusé']);
    }

    /**
     * Supprimer une offre
     */
    public function delete($offreId)
    {
        $decoded = $this->verifierToken();
        
        if ($decoded->role !== 'recruteur') {
            http_response_code(403);
            echo json_encode(['error' => 'Seuls les recruteurs peuvent supprimer des offres']);
            return;
        }

        if (!file_exists($this->dataFile)) {
            http_response_code(404);
            echo json_encode(['error' => 'Offre non trouvée']);
            return;
        }

        $offres = json_decode(file_get_contents($this->dataFile), true) ?? [];

        foreach ($offres as $index => $offre) {
            if ($offre['id'] === $offreId && $offre['created_by'] === $decoded->user_id) {
                // Supprimer l'offre
                unset($offres[$index]);
                $offres = array_values($offres); // Réindexer

                // Sauvegarder
                file_put_contents($this->dataFile, json_encode($offres, JSON_PRETTY_PRINT));

                echo json_encode([
                    'success' => true,
                    'message' => 'Offre supprimée avec succès'
                ]);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Offre non trouvée ou accès refusé']);
    }

    /**
     * Rechercher des offres avec filtres
     */
    public function search()
    {
        $decoded = $this->verifierToken();

        $searchTerm = $_GET['q'] ?? '';
        $location = $_GET['location'] ?? '';
        $type = $_GET['type'] ?? '';
        $secteur = $_GET['secteur'] ?? '';

        if (!file_exists($this->dataFile)) {
            echo json_encode([
                'success' => true,
                'results' => [],
                'count' => 0
            ]);
            return;
        }

        $offres = json_decode(file_get_contents($this->dataFile), true) ?? [];
        $resultats = [];

        foreach ($offres as $offre) {
            // Pour les candidats, vérifier que l'offre est active
            if ($decoded->role === 'candidat') {
                if (!isset($offre['status']) || $offre['status'] !== 'active') {
                    continue;
                }
            }
            // Pour les recruteurs, vérifier que c'est leur offre
            elseif ($decoded->role === 'recruteur') {
                if (!isset($offre['created_by']) || $offre['created_by'] !== $decoded->user_id) {
                    continue;
                }
            }

            $match = true;

            // Recherche textuelle
            if (!empty($searchTerm)) {
                $searchIn = strtolower($offre['titre'] . ' ' . $offre['description'] . ' ' . $offre['entreprise']);
                if (strpos($searchIn, strtolower($searchTerm)) === false) {
                    $match = false;
                }
            }

            // Filtre par localisation
            if (!empty($location) && stripos($offre['lieu'], $location) === false) {
                $match = false;
            }

            // Filtre par type
            if (!empty($type) && $offre['type'] !== $type) {
                $match = false;
            }

            // Filtre par secteur
            if (!empty($secteur) && (!isset($offre['secteur']) || $offre['secteur'] !== $secteur)) {
                $match = false;
            }

            if ($match) {
                $resultats[] = $offre;
            }
        }

        echo json_encode([
            'success' => true,
            'results' => $resultats,
            'count' => count($resultats)
        ]);
    }
}
?>