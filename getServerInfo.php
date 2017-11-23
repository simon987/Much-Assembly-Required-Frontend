<?php

//TODO remove in prod
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


include_once "include/config.php";
include_once "include/ServerInfo.php";
include_once "include/SessionManager.php";
include_once "include/TokenManager.php";

$user = SessionManager::get();


if (isset($user)) {

    $token = TokenManager::generateToken($user['username']);

    $info = new ServerInfo($token, $user['username']);

    echo json_encode($info);


} else {

    //Unauthenticated user
    $info = new ServerInfo(
        TokenManager::generateEmptyToken(),
        "guest");

    echo json_encode($info);
}
