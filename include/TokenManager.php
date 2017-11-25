<?php

include_once "include/SqlConnection.php";

class TokenManager
{
    /**
     * @param $user string Generate an authentication token for a user
     * @return string token
     */
    public static function generateToken($user)
    {

        $token = bin2hex(openssl_random_pseudo_bytes(64));

        $conn = new SqlConnection();

        $stmt_update = $conn->prepare("UPDATE mar_user SET authToken=?, tokenTime=NOW() WHERE username=?");
        $stmt_update->bindValue(1, $token);
        $stmt_update->bindValue(2, $user);
        $stmt_update->execute();

        return $token;

    }

    public static function generateEmptyToken()
    {
        return "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    }
}