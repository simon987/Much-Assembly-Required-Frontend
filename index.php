<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once "include/SessionManager.php";

$user = SessionManager::get();
?>

<!DOCTYPE HTML>
<html>
<head>
    <title>Home - Much Assembly Required</title>
    <meta charset="utf-8"/>
    <meta name="description"
          content="Much Assembly Required is a game where you can program your robot's microprocessor in x86-like assembly language in a procedurally generated universe">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/html5shiv.js"></script><![endif]-->
    <link rel="stylesheet" href="assets/css/main.min.css"/>
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="assets/css/ie8.min.css"/><![endif]-->

    <style>

        @font-face {
            font-family: 'fixedsys';
            src: url("assets/fonts/FSEX301-L2.ttf");
        }

    </style>

</head>
<body class="homepage">

<!-- Nav -->
<nav id="nav">
    <ul>
        <li class="current"><a href="index.php">Home</a></li>
        <li><a href="servers.php">Play</a></li>
        <li>
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

<div id="page-wrapper">

    <?php include "header.inc.html" ?>

    <!-- Main -->
    <div id="main-wrapper">
        <div id="main" class="container">
            <div class="row 200%">
                <div class="12u">

                    <!-- Features -->
                    <section class="box features">
                        <div>
                            <div class="row">
                                <div class="3u 12u(mobile)">

                                    <!-- Feature -->
                                    <section class="box feature">
                                        <span class="image featured"><img src="images/code.png"
                                                                          alt="online code editor"/></span>
                                        <h3>Online Code Editor</h3>
                                        <p>
                                            Program an 8086-like virtual microprocessor in the online code editor with
                                            real-time
                                            syntax check and highlighting.
                                        </p>
                                    </section>

                                </div>
                                <div class="3u 12u(mobile)">

                                    <!-- Feature -->
                                    <section class="box feature">
                                        <span class="image featured"><img src="images/cubot.png"
                                                                          alt="game robot"/></span>
                                        <h3>Program your robot</h3>
                                        <p>
                                            Reprogram your robot's microprocessor to make it navigate the game universe,
                                            gather resources and build structures.
                                        </p>
                                    </section>

                                </div>
                                <div class="3u 12u(mobile)">

                                    <!-- Feature -->
                                    <section class="box feature">
                                        <span class="image featured"><img src="images/world.png"
                                                                          alt="isometric game universe"/></span>
                                        <h3>Large Isometric Game Universe</h3>
                                        <p>
                                            The persistent game universe holds up to 4,294,967,296 procedurally
                                            generated
                                            16x16 Worlds.
                                        </p>
                                    </section>

                                </div>
                                <div class="3u 12u(mobile)">

                                    <!-- Feature -->
                                    <section class="box feature">
                                        <a href="https://github.com/simon987/Much-Assembly-Required"
                                           class="image featured"><img src="images/github-logo.png" alt=""/></a>
                                        <h3><a href="https://github.com/simon987/Much-Assembly-Required">Free and Open
                                                Source</a></h3>
                                        <p>
                                            The project's source code and the game's documentation are available on
                                            GitHub.
                                        </p>
                                    </section>

                                </div>
                            </div>

                            <div class="row">
                                <div class="12u">
                                    <ul class="actions">
                                        <li><a href="./game.php" class="button big">Live demo</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    </div>

    <?php include "footer.inc.html" ?>

</div>

<!-- Scripts -->
<script src="assets/js/jquery.min.js"></script>
<script src="assets/js/jquery.dropotron.min.js"></script>
<script src="assets/js/skel.min.js"></script>
<script src="assets/js/util.min.js"></script>
<!--[if lte IE 8]>
<script src="assets/js/ie/respond.min.js"></script><![endif]-->
<script src="assets/js/main.min.js"></script>

</body>
</html>