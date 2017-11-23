<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once "include/config.php";

class SessionManager
{

    /**
     * @param $user User
     */
    public static function generate($user)
    {

        session_name(SESSION_NAME);
        session_start();

        $_SESSION['user'] = json_encode($user);

    }

    /**
     *
     * @return User
     */
    public static function get()
    {
        session_name(SESSION_NAME);
        session_start();

        if (isset($_SESSION['user'])) {
            return json_decode($_SESSION['user'], true);
        } else {
            return NULL;
        }
    }

    public static function clear()
    {
        session_name(SESSION_NAME);
        session_start();

        unset($_SESSION['user']);
    }


}