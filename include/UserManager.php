<?php

include_once "SqlConnection.php";
include_once "User.php";


class UserManager
{
    /**
     * Authenticate a user
     * @param $username string username
     * @param $password string plain text password
     *
     * @return User if sucess, NULL otherwise
     */
    public static function auth($username, $password)
    {

        $conn = new SqlConnection();

        $stmt_select = $conn->prepare("SELECT username, password FROM mar_user WHERE username=?");
        $stmt_select->bindValue(1, $username);
        $stmt_select->execute();

        $dbUser = $stmt_select->fetchObject();

        if ($dbUser) {
            //Existing user
            if (password_verify($password, $dbUser->password)) {

                return new User($dbUser->username);

            } else {
                return NULL;
            }

        } else {
            //Unknown user
            return NULL;
        }


    }

    /**
     * Register an user
     * @param $username string
     * @param $password string
     * @return bool sucess
     */
    public static function register($username, $password)
    {
        $conn = new SqlConnection();

        $stmt_select = $conn->prepare("SELECT username FROM mar_user WHERE username=?");
        $stmt_select->bindValue(1, $username);
        $stmt_select->execute();

        $bdUser = $stmt_select->fetchObject();

        if ($bdUser) {
            //User already exists
            return FALSE;
        } else {

            $stmt_insert = $conn->prepare("INSERT INTO mar_user (username, password) VALUES (?, ?)");

            $stmt_insert->bindValue(1, $username);
            $stmt_insert->bindValue(2, password_hash($password, PASSWORD_DEFAULT));
            $stmt_insert->execute();

            return TRUE;
        }


    }
}