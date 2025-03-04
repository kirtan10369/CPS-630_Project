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
    echo "Success!";
    // Set loggedIn and redirect based on user
    if ($loginId === "admin") {
        echo "<script>localStorage.setItem('loggedIn', 'admin'); window.location.href = 'admin.html';</script>";
    } else {
        echo "<script>localStorage.setItem('loggedIn', '$loginId'); window.location.href = 'shopping.html';</script>";
    }
} else {
    echo "Failed!";
}

$stmt->close();
$conn->close();
?>