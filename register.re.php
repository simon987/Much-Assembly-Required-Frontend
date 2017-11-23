<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once "include/UserManager.php";
include_once "include/MessageCookie.php";
include_once "include/SessionManager.php";
include_once "include/SqlConnection.php";

$username = filter_var($_POST['username'], FILTER_SANITIZE_STRING);
$password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);


//Validate user / pass

if (strlen($username) < 5 || strlen($username) > 20) {

    (new MessageCookie("Username must be 5-20 characters", "register"))->setCookie();
    header("Location: login.php#register");

} else if (strlen($password) < 8 || strlen($password) > 32) {

    (new MessageCookie("Password must be 8-32 characters", "register"))->setCookie();
    header("Location: login.php#register");

} else {
    //User input is valid

    if (UserManager::register($username, $password)) {

        //Register success
        //Generate session
        SessionManager::generate(new User($username, 0));
        header("Location: index.php"); //todo User page
    } else {
        //Register failed
        (new MessageCookie("Username already in use", "register"))->setCookie();
        header("Location: login.php#register");

    }
}