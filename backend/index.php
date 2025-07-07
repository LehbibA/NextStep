<?php

// index.php ou routes.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Si c'est une requête OPTIONS, répondre sans exécuter la logique
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Point d'entrée de l'API
header("Content-Type: application/json");
require_once __DIR__ . '/../vendor/autoload.php';
require_once 'routes.php';