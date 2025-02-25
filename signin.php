<?php

$conn=mysqli_connect("localhost","root","","OSP");
if(!$conn){
  
    die(mysqli_connect_error());
}
else{
    
}
$sql="Select Login_ID,Password from User where Login_ID=? and Password=?";;
$stmt=$conn->prepare(($sql));
$stmt->bind_param("ss",$_GET['loginID'],$_GET['passwd']);
$stmt->execute();
$res=$stmt->get_result();

if ($res->num_rows>0){
  $response="Success!";
}
else{
   $response="Failed!";
}
echo $response;

?>
