<?php
require_once __DIR__ . '/../config/config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {

    public static function verify(string $requiredRole = null): array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['error' => 'Format de token invalide']);
            exit;
        }

        $jwt = substr($authHeader, 7); // Supprimer "Bearer "

        try {
            $decoded = JWT::decode($jwt, new Key(SECRET_KEY, 'HS256'));

            // Vérification du rôle
            if ($requiredRole !== null && $decoded->role !== $requiredRole) {
                http_response_code(403);
                echo json_encode(['error' => "Accès interdit : rôle requis = $requiredRole"]);
                exit;
            }

            // Retourner les données utiles
            return [
                'email' => $decoded->email,
                'role' => $decoded->role,
                'user_id' => $decoded->user_id
            ];

        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => "Token invalide : " . $e->getMessage()]);
            exit;
        }
    }
}
