<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = mysqli_connect("localhost", "root", "", "OSP");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$itemId = $_POST['itemId'] ?? '';

$query = "DELETE FROM Item WHERE Item_Id = ?";
$stmt = $conn->prepare($query);
if (!$stmt) {
    die("SQL Prepare Failed: " . $conn->error);
}

$stmt->bind_param("i", $itemId);
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
