<?php


include_once "include/UserManager.php";
include_once "include/MessageCookie.php";
include_once "include/SessionManager.php";

$username = filter_var($_POST['username'], FILTER_SANITIZE_STRING);
$password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);


$user = UserManager::auth($username, $password);

if ($user != NULL) {

    SessionManager::generate($user);
    header("Location: index.php"); //todo user page

} else {

    $msg = new MessageCookie("Username or password incorrect", "login");
    $msg->setCookie();

    header("Location: login.php#login");

}