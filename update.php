<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = mysqli_connect("localhost", "root", "", "OSP");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$itemId = $_POST['itemId'] ?? '';
$itemName = $_POST['itemName'] ?? '';
$price = $_POST['price'] ?? '';
$madeIn = $_POST['madeIn'] ?? '';
$deptCode = $_POST['deptCode'] ?? '';

// Handle image upload
$image = "";
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imageName = basename($_FILES['image']['name']);
    $targetDir = "./"; // Store in osp-iteration1 root
    $targetFile = $targetDir . $imageName;
    if (!is_writable($targetDir)) {
        die("Error: Directory '$targetDir' is not writable.");
    }
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        $image = $imageName;
    } else {
        die("Error: Failed to move uploaded file to '$targetFile'.");
    }
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
    die("Error: Image upload failed with code " . $_FILES['image']['error']);
}

// Build dynamic query
$fields = [];
$params = [];
$types = "i"; // Item_Id is always integer
if ($itemName) {
    $fields[] = "Item_name = ?";
    $params[] = $itemName;
    $types .= "s";
}
if ($price) {
    $fields[] = "Price = ?";
    $params[] = $price;
    $types .= "i";
}
if ($image) {
    $fields[] = "Image = ?";
    $params[] = $image;
    $types .= "s";
}
if ($madeIn) {
    $fields[] = "Made_in = ?";
    $params[] = $madeIn;
    $types .= "s";
}
if ($deptCode) {
    $fields[] = "`Department Code` = ?";
    $params[] = $deptCode;
    $types .= "i";
}

if (empty($fields)) {
    echo "No fields to update.";
    exit;
}

$query = "UPDATE item SET " . implode(", ", $fields) . " WHERE Item_Id = ?";
$params[] = $itemId;

$stmt = $conn->prepare($query);
if (!$stmt) {
    die("SQL Prepare Failed: " . $conn->error);
}

$stmt->bind_param($types, ...$params);
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo "Success!";
    } else {
        echo "No item found with ID: $itemId";
    }
} else {
    echo "Failed! Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
