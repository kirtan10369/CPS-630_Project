<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn=mysqli_connect("localhost","root","","OSP");
if ($conn->connect_error){
  die("Connection failed: ".$conn->connect_error);
}

// Prepare the SQL query
$sql = "SELECT Login_ID, Passwd, User_Id FROM User WHERE Login_ID=? AND Passwd=?";
$stmt = $conn->prepare($sql);

// Bind parameters (assuming the data is passed via GET)
$stmt->bind_param("ss", $_GET['loginID'], $_GET['passwd']);
$stmt->execute();
$res = $stmt->get_result();

// Check if any results were returned
if ($res->num_rows > 0) {
    // If credentials are correct, fetch the User_Id
    $row = $res->fetch_assoc();
    $userId = $row['User_Id'];

    // Set the User_Id cookie for 1 day (86400 seconds)
    setcookie("User_Id", $userId, time() + 86400, "/");

    // Respond with success
    $response = "Success!";
} else {
    // If credentials are incorrect
    $response = "Failed!";
}

// Echo the response back to the client
echo $response;
?>
