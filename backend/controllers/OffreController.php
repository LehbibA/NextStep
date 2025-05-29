<?php
require_once 'middleware/AuthMiddleware.php';
$decoded = AuthMiddleware::verifierToken(); // 🛡️ Si le token est valide, on continue

// Exemple : accès autorisé
echo json_encode([
    'message' => 'Route protégée. Bienvenue ' . $decoded->email
]);
class OffreController
{
    private $dataFile = 'data/offres.json';

    public function create()
    {
        header('Content-Type: application/json');

        // Lire les données JSON envoyées
        $json = file_get_contents('php://input');
        $donnees = json_decode($json, true);

        // Vérifier les champs obligatoires
        if (!isset($donnees['titre'], $donnees['description'], $donnees['lieu'], $donnees['type'], $donnees['salaire'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Champs requis manquants']);
            return;
        }

        // Charger les offres existantes
        $offres = [];
        if (file_exists($this->dataFile)) {
            $contenu = file_get_contents($this->dataFile);
            $offres = json_decode($contenu, true) ?? [];
        }

        // Générer un ID unique
        $id = uniqid();

        // Créer l'offre
        $offre = [
            'id' => $id,
            'titre' => $donnees['titre'],
            'description' => $donnees['description'],
            'lieu' => $donnees['lieu'],
            'type' => $donnees['type'],
            'salaire' => $donnees['salaire'],
            'date_creation' => date('Y-m-d H:i:s')
        ];

        // Ajouter l'offre à la liste
        $offres[] = $offre;

        // Sauvegarder dans le fichier JSON
        file_put_contents($this->dataFile, json_encode($offres, JSON_PRETTY_PRINT));

        echo json_encode(['success' => true, 'offre_id' => $id]);
    }
    public function index()
{
    header('Content-Type: application/json');

    if (!file_exists($this->dataFile)) {
        echo json_encode([]);
        return;
    }

    $contenu = file_get_contents($this->dataFile);
    $offres = json_decode($contenu, true);

    echo json_encode($offres);
}




}
