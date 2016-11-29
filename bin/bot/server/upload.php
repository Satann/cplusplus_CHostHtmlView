<?php
// In PHP versions earlier than 4.1.0, $HTTP_POST_FILES should be used instead
// of $_FILES.

// if not exist, create it first.
$uploaddir = '/var/www/uploads/';

// use md5 hash as the filename to save.
$md5sum = md5_file($_FILES['imagelogo']['tmp_name']);

// Try to get file externsion, file type
$ext = pathinfo(basename($_FILES['imagelogo']['name']), PATHINFO_EXTENSION);

// contact them together
$uploadfile = $uploaddir . $md5sum . "." . $ext;

// Debug: echo $uploadfile;

if (move_uploaded_file($_FILES['imagelogo']['tmp_name'], $uploadfile)) {
    //echo "File is valid, and was successfully uploaded.\n";
} else {
   $md5sum = "0";
   // echo "Possible file upload attack!\n";
}

echo "{ \"imageid\": \"" . $md5sum . "\"}";
//print_r($_FILES);


?>

