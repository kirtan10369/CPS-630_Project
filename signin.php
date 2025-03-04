<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = mysqli_connect("localhost", "root", "", "OSP");
if (!$conn) {
    die(mysqli_connect_error());
}

$loginId = $_GET['loginID'] ?? '';
$passwd = $_GET['passwd'] ?? '';
$sql = "SELECT Login_ID, Passwd FROM User WHERE Login_ID = ? AND Passwd = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $loginId, $passwd);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    // Fetch the user data
    $row = $res->fetch_assoc();
    
    // Check if the user is an admin (assuming there's a role column)
    if ($row['Login_ID'] === 'admin') {
        // Admin login
        echo "admin"; // Send "admin" response to client-side script
    } else {
        // Regular user login
        echo "user"; // Send "user" response to client-side script
    }
} else {
    // Failed login
    echo "Failed!";
}

$stmt->close();
$conn->close();
?>
