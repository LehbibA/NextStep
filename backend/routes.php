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

    case '/api/register':
    require_once 'controllers/AuthController.php';
    (new AuthController())->register();
    break;


    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route inconnue']);
        break;
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
    case '/api/login':
    require_once 'controllers/AuthController.php';
    (new AuthController())->login();
    break;
    
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
case '/api/profile':
    require_once 'controllers/AuthController.php';
    (new AuthController())->profile();
    break;




}

