<?php

class MessageCookie
{

    private $msg;
    private $type;

    /**
     * MessageCookie constructor.
     * @param $msg
     * @param $type
     */
    public function __construct($msg, $type)
    {
        $this->msg = $msg;
        $this->type = $type;
    }

    public function setCookie()
    {
        setCookie($this->type, $this->msg);
    }

    /**
     * Get message
     * @param $type string
     * @return string Cookie message
     */
    public static function getMsg($type)
    {
        if (isset($_COOKIE[$type])) {

            $msg = $_COOKIE[$type];

            //Clear cookie
            setcookie($type, "", -1);

            return $msg;
        } else {
            return FALSE;
        }
    }


}