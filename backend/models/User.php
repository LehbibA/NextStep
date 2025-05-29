<?php
class User {
    public static function create($email, $password, $role) {
        $filePath = __DIR__ . '/../data/users.json';

        // Lire les utilisateurs existants
        $users = [];
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            if (!empty($content)) {
                $users = json_decode($content, true);
            }
        }

        // Générer un nouvel ID unique
        $userId = uniqid();

        // Créer le nouvel utilisateur
        $newUser = [
            'id' => $userId,
            'email' => $email,
            'password' => $password, // déjà hashé dans le controller
            'role' => $role
        ];

        // Ajouter à la liste
        $users[] = $newUser;

        // Sauvegarder dans le fichier
        file_put_contents($filePath, json_encode($users, JSON_PRETTY_PRINT));

        return $userId;
    }
}
