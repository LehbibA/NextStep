<?php

class ProtectedController
{
    public function recruteurZone(): void
    {
        echo json_encode([
            'success' => true,
            'message' => 'Bienvenue dans la zone protégée pour les recruteurs !'
        ]);
    }

    public function candidatZone(): void
    {
        echo json_encode([
            'success' => true,
            'message' => 'Bienvenue dans la zone protégée pour les candidats !'
        ]);
    }

    public function accessiblePourTous(): void
    {
        echo json_encode([
            'success' => true,
            'message' => 'Cette route est publique.'
        ]);
    }
}
