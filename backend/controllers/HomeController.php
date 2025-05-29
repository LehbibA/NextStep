<?php

class HomeController {
    public function protectedRoute($user) {
        header('Content-Type: application/json');
        echo json_encode([
            'message' => 'Bienvenue dans la route protégée',
            'user' => $user
        ]);
    }
}
