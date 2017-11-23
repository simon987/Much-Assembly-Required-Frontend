<?php

include_once "include/SqlConnection.php";
include_once "include/SessionManager.php";

$user = SessionManager::get();

if ($user != NULL) {
    if (isset($_FILES["floppyData"])) {

        if ($_FILES['floppyData']['size'] == (1024 * 1440)) {


            $tmpName = $_FILES['floppyData']['tmp_name'];
            $file = fopen($tmpName, 'rb'); //Read binary

            $conn = new SqlConnection();

            $stmt = $conn->prepare("UPDATE mar_user SET floppyData=? WHERE username=?");
            $stmt->bindValue(1, $file, PDO::PARAM_LOB);
            $stmt->bindValue(2, $user['username']);
            $stmt->execute();

            echo "ok";

        } else {
            echo "Invalid file size";
        }
    } else {
        echo "File not specified";
    }
} else {
    echo "Auth problem";
}

