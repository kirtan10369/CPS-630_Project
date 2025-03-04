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

$query = "INSERT INTO Item (Item_Id, Item_name, Price, Made_in, `Department Code`) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($query);
if (!$stmt) {
    die("SQL Prepare Failed: " . $conn->error);
}

$stmt->bind_param("isisi", $itemId, $itemName, $price, $madeIn, $deptCode);
if ($stmt->execute()) {
    echo "Success!";
} else {
    echo "Failed! Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
