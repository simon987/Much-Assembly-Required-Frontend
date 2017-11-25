<?php

include_once "include/UserManager.php";
include_once "include/MessageCookie.php";
include_once "include/SessionManager.php";
include_once "include/SqlConnection.php";

$username = filter_var($_POST['username'], FILTER_SANITIZE_STRING);
$password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);


//Validate user / pass

if (strlen($username) < 5 || strlen($username) > 20) {

    $msg = new MessageCookie("Username must be 5-20 characters", "register");
    $msg->setCookie();
    header("Location: login.php#register");

} else if (strlen($password) < 8 || strlen($password) > 32) {

    (new MessageCookie("Password must be 8-32 characters", "register"))->setCookie();
    header("Location: login.php#register");

} else {
    //User input is valid

    if (UserManager::register($username, $password)) {

        //Register success
        //Generate session
        SessionManager::generate(new User($username));
        header("Location: index.php"); //todo User page
    } else {
        //Register failed
        $msg = new MessageCookie("Username already in use", "register");
        $msg->setCookie();
        header("Location: login.php#register");

    }
}