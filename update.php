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

$query = "UPDATE Item SET " . implode(", ", $fields) . " WHERE Item_Id = ?";
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
