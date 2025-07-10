<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, "/ \t\n\r\0\x0B"); // Nettoie bien les fins de ligne
error_log("URI reçue : $uri"); // Pour voir dans le terminal ce qu'il reçoit

switch ($uri) {
    case '/':
    case '/api/':
    case '/api/home':
        require_once 'controllers/HomeController.php';
        (new HomeController())->index();
        break;

    // ========== ROUTES AUTHENTIFICATION ==========
    case '/api/register':
        require_once 'controllers/AuthController.php';
        (new AuthController())->register();
        break;

    case '/api/login':
        require_once 'controllers/AuthController.php';
        (new AuthController())->login();
        break;

    case '/api/profile':
        require_once 'controllers/AuthController.php';
        (new AuthController())->profile();
        break;

    // ========== ROUTES OFFRES D'EMPLOI ==========
    case '/api/offres':
        require_once 'controllers/OffreController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            (new OffreController())->create();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
            (new OffreController())->index();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    // ========== ROUTES PROFIL UTILISATEUR ==========
    case '/api/user/profile':
        require_once 'controllers/UserController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            (new UserController())->getProfile();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            (new UserController())->updateProfile();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    case '/api/user/change-password':
        require_once 'controllers/UserController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            (new UserController())->changePassword();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    // ========== ROUTES CANDIDATURES ==========
    case '/api/applications/apply':
        require_once 'controllers/ApplicationController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            (new ApplicationController())->apply();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    case '/api/applications/user':
        require_once 'controllers/ApplicationController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            (new ApplicationController())->getUserApplications();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    case '/api/applications/recruiter':
        require_once 'controllers/ApplicationController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            (new ApplicationController())->getRecruiterApplications();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    case '/api/applications/status':
        require_once 'controllers/ApplicationController.php';
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            (new ApplicationController())->updateApplicationStatus();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    // ========== ROUTES PROTÉGÉES (TESTS) ==========
    case '/api/protected':
        require_once 'controllers/HomeController.php';
        require_once 'middleware/AuthMiddleware.php';

        $user = \Middleware\AuthMiddleware::verifyToken();
        if ($user) {
            (new HomeController())->protectedRoute($user);
        }
        break;

    case '/api/candidat/zone':
        require_once 'controllers/ProtectedController.php';
        require_once 'middleware/AuthMiddleware.php';

        $user = AuthMiddleware::verify('candidat');
        (new ProtectedController())->candidatAccess($user);
        break;

    case '/api/recruteur/zone':
        require_once 'controllers/ProtectedController.php';
        require_once 'middleware/AuthMiddleware.php';

        $user = AuthMiddleware::verify('recruteur');
        (new ProtectedController())->recruteurAccess($user);
        break;

    case '/api/public':
        require_once 'controllers/ProtectedController.php';
        (new ProtectedController())->accessiblePourTous();
        break;

    // ========== ROUTE 404 ==========
    default:
        // Vérifier si c'est une demande de téléchargement de CV
        if (preg_match('/^\/api\/applications\/cv\/(.+)$/', $uri, $matches)) {
            require_once 'controllers/ApplicationController.php';
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                (new ApplicationController())->downloadCV($matches[1]);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
            }
            break;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route inconnue : ' . $uri]);
        break;
}
?>