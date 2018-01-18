<?php


include_once "include/UserManager.php";
include_once "include/MessageCookie.php";
include_once "include/SessionManager.php";

$user = SessionManager::get();

if ($user != NULL) {

    $password = $_POST['password'];
    $newPassword = $_POST['new_password'];

    if (strlen($newPassword) < 8 || strlen($newPassword) > 96) {

        (new MessageCookie("Password must be 8-96 characters", "register"))->setCookie();
        header("Location: account.php");
    } else {

        if (UserManager::auth($user['username'], $password) != NULL) {

            UserManager::changePassword($user['username'], $newPassword);

            header("Location: index.php");

        } else {
            $msg = new MessageCookie("Invalid password", "register");
            $msg->setCookie();
            header("Location: account.php");
        }
    }


} else {
    $msg = new MessageCookie("You must be logged in to do that", "register");
    $msg->setCookie();
    header("Location: account.php");
}
