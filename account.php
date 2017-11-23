<?php

include_once "include/SessionManager.php";

$user = SessionManager::get();
?>

<!DOCTYPE HTML>
<html>
<head>
    <title>Home - Much Assembly Required</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/html5shiv.js"></script><![endif]-->
    <link rel="stylesheet" href="assets/css/main.css"/>
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="assets/css/ie8.css"/><![endif]-->
</head>
<body>
<div id="page-wrapper">

    <!-- Nav -->
    <nav id="nav">
        <ul>
            <li><a href="index.php">Home</a></li>
            <li><a href="game.php">Game</a></li>
            <li class="current">
                <a href="#">Account</a>
                <ul>
                    <?php if ($user) { ?>
                        <li><a href="account.php"><?php echo $user["username"] ?></a></li>
                        <li><a href="logout.re.php">Logout</a></li>
                    <?php } else { ?>
                        <li><a href="login.php">login</a></li>
                    <?php } ?>
                </ul>
            </li>
        </ul>
    </nav>

    <div id="main" class="container">
        <div class="row 200%">
            <div class="12u">

                <!-- Account information -->
                <section id="login">
                    <p>You are logged in as <span style="font-style: italic"><?php echo $user["username"] ?></span></p>

                    <p>Account page is under construction</p>
                </section>

            </div>
        </div>

        <?php include "footer.inc.html" ?>


    </div>

    <!-- Scripts -->
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/jquery.dropotron.min.js"></script>
    <script src="assets/js/skel.min.js"></script>
    <script src="assets/js/util.js"></script>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/respond.min.js"></script><![endif]-->
    <script src="assets/js/main.js"></script>

</body>
</html>