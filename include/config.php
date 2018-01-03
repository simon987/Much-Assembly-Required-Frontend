<?php

define("SQL_HOST", "mysql:host=localhost;dbname=mar;charset=utf8");
define("SQL_USER", "mar");
define("SQL_PASS", "mar");

define("SESSION_NAME", "marSession");

define("MAR_ADDRESS", "ws://localhost:8887");
define("MAR_TICK_LENGTH", 1000);
define("MAR_SERVER_NAME", "Official MAR server");

//Servers displayed in the servers tab
define("SERVER_LIST", array(
    array("<b>Official MAR Server</b>", "https://muchassemblyrequired.com/game.php", "Official Game server. Should be the most up-to-date"),
    array("mlaga97's alternative server", "http://muchassemblyrequired.mlaga97.space/game.php", "<i>none</i>"),
    array("Jaggernaut's backup server", "http://jaggernaut.ca/game.php", "<i>none</i>"),
));

//Plugins
//Version
