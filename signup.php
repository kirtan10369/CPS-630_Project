<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get POST data
$username = $_POST['username'] ?? '';
$tel = $_POST['tel'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$fname = $_POST['fname'] ?? '';
$lname = $_POST['lname'] ?? '';

$full_name = $fname . " " . $lname;

// Create a new MySQLi connection
$conn = mysqli_connect('localhost', 'root', '', 'OSP');

// Check for connection errors
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
// echo "Connected!<br>";

// Prepare the SQL query
$query = "INSERT INTO User (Full_Name, Tel_num, Email, Login_ID, Passwd) VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($query);

// Check if prepare() worked
if (!$stmt) {
    die("SQL Prepare Failed: " . $conn->error);
}

// Bind parameters
$stmt->bind_param("sssss", $full_name, $tel, $email, $username, $password);

// Execute statement and check for errors
if ($stmt->execute()) {
    echo "Success!";
} else {
    echo "Failed!";
    die("Failed! Error: " . $stmt->error);
}

?>
