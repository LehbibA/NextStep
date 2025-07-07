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

        // Créer le nouvel utilisateur avec structure étendue
        $newUser = [
            'id' => $userId,
            'email' => $email,
            'password' => $password, // déjà hashé dans le controller
            'role' => $role,
            // Nouveaux champs pour le profil
            'nom' => '',
            'prenom' => '',
            'telephone' => '',
            'adresse' => '',
            'ville' => '',
            'codePostal' => '',
            'dateNaissance' => '',
            'nationalite' => '',
            'bio' => '',
            'linkedin' => '',
            'github' => '',
            'portfolio' => '',
            'dateCreation' => date('Y-m-d H:i:s'),
            'dateModification' => date('Y-m-d H:i:s')
        ];

        // Ajouter à la liste
        $users[] = $newUser;

        // Sauvegarder dans le fichier
        file_put_contents($filePath, json_encode($users, JSON_PRETTY_PRINT));

        return $userId;
    }

    // Nouvelle méthode pour trouver un utilisateur par ID
    public static function findById($userId) {
        $filePath = __DIR__ . '/../data/users.json';
        
        if (!file_exists($filePath)) {
            return null;
        }

        $users = json_decode(file_get_contents($filePath), true);
        if (!is_array($users)) {
            return null;
        }

        foreach ($users as $user) {
            if ($user['id'] === $userId) {
                return $user;
            }
        }

        return null;
    }

    // Nouvelle méthode pour mettre à jour un utilisateur
    public static function updateById($userId, $updateData) {
        $filePath = __DIR__ . '/../data/users.json';
        
        if (!file_exists($filePath)) {
            return false;
        }

        $users = json_decode(file_get_contents($filePath), true);
        if (!is_array($users)) {
            return false;
        }

        foreach ($users as $index => $user) {
            if ($user['id'] === $userId) {
                // Champs modifiables
                $allowedFields = [
                    'nom', 'prenom', 'email', 'telephone', 'adresse',
                    'ville', 'codePostal', 'dateNaissance', 'nationalite',
                    'bio', 'linkedin', 'github', 'portfolio'
                ];

                // Mettre à jour les champs autorisés
                foreach ($allowedFields as $field) {
                    if (isset($updateData[$field])) {
                        $users[$index][$field] = $updateData[$field];
                    }
                }

                // Mettre à jour la date de modification
                $users[$index]['dateModification'] = date('Y-m-d H:i:s');

                // Sauvegarder
                file_put_contents($filePath, json_encode($users, JSON_PRETTY_PRINT));
                return $users[$index];
            }
        }

        return false;
    }

    // Nouvelle méthode pour changer le mot de passe
    public static function changePassword($userId, $newPassword) {
        $filePath = __DIR__ . '/../data/users.json';
        
        if (!file_exists($filePath)) {
            return false;
        }

        $users = json_decode(file_get_contents($filePath), true);
        if (!is_array($users)) {
            return false;
        }

        foreach ($users as $index => $user) {
            if ($user['id'] === $userId) {
                $users[$index]['password'] = password_hash($newPassword, PASSWORD_DEFAULT);
                $users[$index]['dateModification'] = date('Y-m-d H:i:s');

                file_put_contents($filePath, json_encode($users, JSON_PRETTY_PRINT));
                return true;
            }
        }

        return false;
    }

    // Méthode pour vérifier si un email existe déjà (sauf pour l'utilisateur actuel)
    public static function emailExists($email, $excludeUserId = null) {
        $filePath = __DIR__ . '/../data/users.json';
        
        if (!file_exists($filePath)) {
            return false;
        }

        $users = json_decode(file_get_contents($filePath), true);
        if (!is_array($users)) {
            return false;
        }

        foreach ($users as $user) {
            if ($user['email'] === $email && $user['id'] !== $excludeUserId) {
                return true;
            }
        }

        return false;
    }
}