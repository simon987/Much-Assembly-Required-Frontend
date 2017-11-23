<?php
include_once "include/config.php";


class SqlConnection extends PDO
{
    public function __construct()
    {
        parent::__construct(SQL_HOST, SQL_USER, SQL_PASS);
    }
}