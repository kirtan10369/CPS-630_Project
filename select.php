<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = mysqli_connect("localhost", "root", "", "OSP");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$itemName = $_POST['itemName'] ?? '';
$query = $itemName ? "SELECT * FROM Item WHERE Item_name LIKE ?" : "SELECT * FROM Items";
$stmt = $conn->prepare($query);
if (!$stmt) {
    die("SQL Prepare Failed: " . $conn->error);
}

if ($itemName) {
    $likeParam = "%$itemName%";
    $stmt->bind_param("s", $likeParam);
}

$stmt->execute();
$result = $stmt->get_result();

$output = "<table class='table table-striped'><thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Made In</th><th>Dept Code</th></tr></thead><tbody>";
while ($row = $result->fetch_assoc()) {
    $output .= "<tr><td>{$row['Item_Id']}</td><td>{$row['Item_name']}</td><td>\${$row['Price']}</td><td>{$row['Made_in']}</td><td>{$row['Department Code']}</td></tr>";
}
$output .= "</tbody></table>";

if ($result->num_rows === 0) {
    $output = "<p class='text-muted'>No items found.</p>";
}

echo $output;

$stmt->close();
$conn->close();
?>
