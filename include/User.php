<?php

class User implements JsonSerializable
{
    public $username;
    public $status;

    /**
     * User constructor.
     * @param $username
     */
    public function __construct($username)
    {
        $this->username = $username;
    }


    public function jsonSerialize()
    {
        return [
            "username" => $this->username
        ];
    }


}