<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header early
header('Content-Type: application/json');

$conn = mysqli_connect("localhost", "root", "", "OSP");
if (!$conn) {
    echo json_encode(["error" => "Connection failed: " . mysqli_connect_error()]);
    exit;
}

$searchTerm = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : '';
$query = $searchTerm ? "SELECT * FROM item WHERE Item_name LIKE ?" : "SELECT * FROM item";
$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(["error" => "SQL Prepare Failed: " . $conn->error]);
    exit;
}

if ($searchTerm) {
    $likeParam = "%$searchTerm%";
    $stmt->bind_param("s", $likeParam);
}

if (!$stmt->execute()) {
    echo json_encode(["error" => "Query Execution Failed: " . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = [
        "Item_Id" => $row['Item_Id'],
        "Item_name" => $row['Item_name'],
        "Price" => $row['Price'],
        "Image" => $row['Image'],
        "Made_in" => $row['Made_in'],
        "Department Code" => $row['Department Code']
    ];
}

echo json_encode($items);

$stmt->close();
$conn->close();
?>