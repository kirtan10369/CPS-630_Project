<?php
// Enable error reporting for debugging purposes
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if the User_Id cookie is set
if (isset($_COOKIE['User_Id'])) {
    // Retrieve the User_Id from the cookie
    $userId = $_COOKIE['User_Id'];
    // echo "Welcome, User ID: " . htmlspecialchars($userId); // Display User_Id securely
} else {
//     echo "You are not logged in. Please <a href='signin.php'>log in</a>.";
 }

// Check if 'total_price' is set
if (isset($_POST['total_price'])) {
    $total_price = $_POST['total_price'];
    $date_issued = date('Y-m-d H:i:s'); // Current date and time

    // Create a database connection
    $conn = new mysqli('localhost', 'root', '', 'OSP');

    // Check for connection errors
    if ($conn->connect_error) {
        die('Connection Failed: ' . $conn->connect_error);
    }

    // Prepare the SQL statement to insert data for Total_Price and Date_Issued
    $stmt = $conn->prepare('INSERT INTO orders (User_Id,Total_Price, Date_Issued) VALUES (?,?,?)');
    $stmt->bind_param("ids",$userId, $total_price, $date_issued); // 'd' for decimal and 's' for string

    // Execute the query and check if it's successful
    if ($stmt->execute()) {
        echo "Success!";
    } else {
        echo "Failed: " . $stmt->error;
    }

    // Close the statement and the connection
    $stmt->close();
    $conn->close();
} else {
    echo "Error: total_price not set.";
}
?>
