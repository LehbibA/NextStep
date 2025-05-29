<?php
require_once 'models/User.php';
require_once __DIR__ . '/../config/config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController {

    private function verifierToken(array $rolesAutorises = [])
{
    header('Content-Type: application/json');
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Token manquant']);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);

    try {
        $decoded = JWT::decode($token, new Key('votre_cle_secrete', 'HS256'));
        if (!empty($rolesAutorises) && !in_array($decoded->role, $rolesAutorises)) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès interdit pour ce rôle']);
            exit;
        }

        return $decoded;

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Token invalide']);
        exit;
    }
}

    public function register(): void {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email'], $data['password'], $data['role'])) {
            echo json_encode(['error' => 'Champs requis manquants']);
            return;
        }

        $email = $data['email'];
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $role = $data['role'];

        $userId = User::create($email, $password, $role);
        echo json_encode(['success' => true, 'user_id' => $userId]);
    }

    public function login(): void {
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['email'], $data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Champs requis manquants']);
            return;
        }

        $filePath = __DIR__ . '/../data/users.json';

        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['error' => 'Aucun utilisateur trouvé']);
            return;
        }

        $users = json_decode(file_get_contents($filePath), true);

        if (!is_array($users)) {
            http_response_code(500);
            echo json_encode(['error' => 'Fichier JSON corrompu']);
            return;
        }

        foreach ($users as $user) {
            if ($user['email'] === $data['email']) {
                if (password_verify($data['password'], $user['password'])) {
                    $payload = [
                        'iss' => 'http://localhost',
                        'aud' => 'http://localhost',
                        'iat' => time(),
                        'exp' => time() + 3600,
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'user_id' => $user['id']
                    ];

                    $jwt = JWT::encode($payload, SECRET_KEY, 'HS256');

                    echo json_encode([
                        'success' => true,
                        'token' => $jwt,
                        'role' => $user['role']
                    ]);
                    return;
                } else {
                    error_log("password_verify a échoué !");
                }
            }
        }

        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect']);
    }
    public function profile()
{
    header('Content-Type: application/json');
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Token manquant']);
        return;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);

    try {
        $decoded = JWT::decode($token, new Key('votre_cle_secrete', 'HS256'));

        echo json_encode([
            'email' => $decoded->email,
            'role' => $decoded->role,
            'user_id' => $decoded->user_id
        ]);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Token invalide']);
    }
}

}
