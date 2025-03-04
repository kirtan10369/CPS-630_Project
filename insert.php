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

// Handle image upload
$image = "";
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imageName = basename($_FILES['image']['name']);
    $targetDir = "./"; // Store in osp-iteration1 root
    $targetFile = $targetDir . $imageName;
    if (!is_writable($targetDir)) {
        die("Error: Directory '$targetDir' is not writable.");
    }
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        $image = $imageName;
    } else {
        die("Error: Failed to move uploaded file to '$targetFile'.");
    }
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
    die("Error: Image upload failed with code " . $_FILES['image']['error']);
}

$query = "INSERT INTO item (Item_Id, Item_name, Price, Image, Made_in, `Department Code`) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($query);
if (!$stmt) {
    die("SQL Prepare Failed: " . $conn->error);
}

$stmt->bind_param("isisss", $itemId, $itemName, $price, $image, $madeIn, $deptCode);
if ($stmt->execute()) {
    echo "Success!";
} else {
    echo "Failed! Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
