<?php
require_once 'models/User.php';
require_once __DIR__ . '/../config/config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class UserController {

    private function verifierToken() {
    error_log("=== VERIFICATION TOKEN ===");
    
    header('Content-Type: application/json');
    $headers = getallheaders();
    
    error_log("Headers reçus: " . print_r($headers, true));
    
    if (!isset($headers['Authorization'])) {
        error_log("ERREUR: Pas de header Authorization");
        http_response_code(401);
        echo json_encode(['error' => 'Token manquant']);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    error_log("Token extrait: " . $token);
    error_log("SECRET_KEY: " . SECRET_KEY);

    try {
        $decoded = JWT::decode($token, new Key(SECRET_KEY, 'HS256'));
        error_log("Token décodé avec succès - User ID: " . $decoded->user_id);
        return $decoded;
    } catch (Exception $e) {
        error_log("ERREUR JWT: " . $e->getMessage());
        http_response_code(401);
        echo json_encode(['error' => 'Token invalide: ' . $e->getMessage()]);
        exit;
    }
}

    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    public function getProfile() {
        $decoded = $this->verifierToken();
        
        $user = User::findById($decoded->user_id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé']);
            return;
        }

        // Retourner les données sans le mot de passe
        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * Mettre à jour le profil de l'utilisateur
     */
    public function updateProfile() {
        $decoded = $this->verifierToken();
        
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
            return;
        }

        // Vérifier si l'email est unique (si il est modifié)
        if (isset($data['email'])) {
            if (User::emailExists($data['email'], $decoded->user_id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Cet email est déjà utilisé']);
                return;
            }
        }

        // Mettre à jour l'utilisateur
        $updatedUser = User::updateById($decoded->user_id, $data);

        if ($updatedUser) {
            // Retourner les données mises à jour sans le mot de passe
            unset($updatedUser['password']);
            
            echo json_encode([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => $updatedUser
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la mise à jour']);
        }
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword() {
    // DEBUT DEBUG
    error_log("=== DEBUT changePassword ===");
    header('Content-Type: application/json');
    
    try {
        $decoded = $this->verifierToken();
        error_log("Token vérifié - User ID: " . $decoded->user_id);
        
        $json = file_get_contents('php://input');
        error_log("Raw JSON reçu: " . $json);
        
        $data = json_decode($json, true);
        error_log("Données décodées: " . print_r($data, true));

        // Validation des données
        if (!isset($data['oldPassword'], $data['newPassword'])) {
            error_log("ERREUR: Champs manquants");
            http_response_code(400);
            echo json_encode(['error' => 'Ancien et nouveau mot de passe requis']);
            return;
        }

        if (strlen($data['newPassword']) < 6) {
            error_log("ERREUR: Mot de passe trop court");
            http_response_code(400);
            echo json_encode(['error' => 'Le nouveau mot de passe doit contenir au moins 6 caractères']);
            return;
        }

        // Récupérer l'utilisateur actuel
        $currentUser = User::findById($decoded->user_id);
        error_log("Utilisateur trouvé: " . ($currentUser ? "OUI" : "NON"));
        
        if (!$currentUser) {
            error_log("ERREUR: Utilisateur non trouvé");
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé']);
            return;
        }

        // Vérifier l'ancien mot de passe
        $passwordCheck = password_verify($data['oldPassword'], $currentUser['password']);
        error_log("Vérification ancien mot de passe: " . ($passwordCheck ? "OK" : "ECHEC"));
        
        if (!$passwordCheck) {
            error_log("ERREUR: Ancien mot de passe incorrect");
            http_response_code(400);
            echo json_encode(['error' => 'Ancien mot de passe incorrect']);
            return;
        }

        // Changer le mot de passe
        $result = User::changePassword($decoded->user_id, $data['newPassword']);
        error_log("Changement mot de passe: " . ($result ? "SUCCESS" : "ECHEC"));
        
        if ($result) {
            error_log("SUCCESS: Mot de passe changé");
            echo json_encode([
                'success' => true,
                'message' => 'Mot de passe modifié avec succès'
            ]);
        } else {
            error_log("ERREUR: Échec sauvegarde");
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la modification du mot de passe']);
        }
        
    } catch (Exception $e) {
        error_log("EXCEPTION: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
    }
    
    error_log("=== FIN changePassword ===");
}
}