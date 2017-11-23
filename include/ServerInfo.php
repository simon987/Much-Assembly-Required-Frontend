<?php

class ServerInfo
{

    public $token;

    public $username;

    public $address;

    public $tickLength;

    public $serverName;

    /**
     * ServerInfo constructor.
     * @param $token
     * @param $username
     */
    public function __construct($token, $username)
    {
        $this->token = $token;
        $this->username = $username;

        $this->address = MAR_ADDRESS;
        $this->serverName = MAR_SERVER_NAME;
        $this->tickLength = MAR_TICK_LENGTH;
    }


}