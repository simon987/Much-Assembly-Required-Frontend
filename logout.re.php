<?php

include_once "include/SessionManager.php";

SessionManager::clear();
header("Location: index.php");