[file name]: upload.php
[file content begin]
<?php
// Simple authentication
$password = 'xaudiXdx12@';
if (!isset($_POST['password']) || $_POST['password'] !== $password) {
    http_response_code(401);
    die('Unauthorized');
}

// Create uploads directory if it doesn't exist
if (!file_exists('uploads')) {
    mkdir('uploads', 0777, true);
}

// Handle file uploads
$uploadDir = 'uploads/';
$response = [];

try {
    // Process cover image
    if (isset($_FILES['cover'])) {
        $coverFile = $_FILES['cover'];
        $coverName = uniqid() . '_' . $coverFile['name'];
        move_uploaded_file($coverFile['tmp_name'], $uploadDir . $coverName);
        $response['cover'] = $uploadDir . $coverName;
    }

    // Process audio preview
    if (isset($_FILES['audio'])) {
        $audioFile = $_FILES['audio'];
        $audioName = uniqid() . '_' . $audioFile['name'];
        move_uploaded_file($audioFile['tmp_name'], $uploadDir . $audioName);
        $response['audio'] = $uploadDir . $audioName;
    }

    // Process product file
    if (isset($_FILES['product'])) {
        $productFile = $_FILES['product'];
        $productName = uniqid() . '_' . $productFile['name'];
        move_uploaded_file($productFile['tmp_name'], $uploadDir . $productName);
        $response['product'] = $uploadDir . $productName;
    }

    // Save product data to JSON file (simulating database)
    $productsFile = 'products.json';
    $products = file_exists($productsFile) ? json_decode(file_get_contents($productsFile), true) : [];
    
    $newProduct = [
        'id' => uniqid(),
        'title' => $_POST['title'],
        'category' => $_POST['category'],
        'price' => floatval($_POST['price']),
        'bpm' => $_POST['bpm'],
        'key' => $_POST['key'],
        'tags' => json_decode($_POST['tags'], true),
        'cover' => $response['cover'] ?? '',
        'audio' => $response['audio'] ?? '',
        'downloadLink' => $response['product'] ?? '',
        'dateAdded' => date('Y-m-d H:i:s')
    ];
    
    $products[] = $newProduct;
    file_put_contents($productsFile, json_encode($products, JSON_PRETTY_PRINT));
    
    $response['success'] = true;
    $response['message'] = 'Product uploaded successfully';
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
[file content end]