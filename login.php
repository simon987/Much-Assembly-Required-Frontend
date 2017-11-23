<?php
include_once "include/MessageCookie.php";

$login_msg = MessageCookie::getMsg("login");
$register_msg = MessageCookie::getMsg("register");

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
    <link rel="stylesheet" href="assets/css/main.min.css"/>
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="assets/css/ie8.min.css"/><![endif]-->


    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
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

                <!-- Login -->
                <section id="login">
                    <div class="container">
                        <h3>Login</h3>

                        <?php
                        if ($login_msg) {
                            echo "<span style='color:#ff4943'>" . $login_msg . "</span></div>";
                        }
                        ?>

                        <form method="post" action="auth.re.php">
                            <div class="row uniform">
                                <div class="6u 12u(xsmall)"><input type="text" name="username" id="username"
                                                                   placeholder="Username"/></div>
                                <div class="6u 12u(xsmall)"><input type="password" name="password" id="password"
                                                                   placeholder="Password"/></div>
                            </div>
                            <div class="row uniform">
                                <div class="12u">
                                    <ul class="actions">
                                        <li><input type="submit" class="special" value="Login"/></li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

                <hr>

                <!-- Register -->
                <section id="register">
                    <div class="container">
                        <h3>Register</h3>

                        <?php
                        if ($register_msg) {
                            echo "<span style='color:#ff4943'>" . $register_msg . "</span></div>";
                        }
                        ?>


                        <form method="post" action="register.re.php">
                            <div class="row uniform">
                                <div class="9u 12u(xsmall)"><input type="email" name="email" id="email"
                                                                   placeholder="Email (Optional)"/></div>
                            </div>
                            <div class="row uniform">
                                <div class="6u 12u(xsmall)"><input type="text" name="username" id="username"
                                                                   placeholder="Username"/></div>
                                <div class="6u 12u(xsmall)"><input type="password" name="password" id="password"
                                                                   placeholder="Password"/></div>
                            </div>
                            <div class="row uniform">
                                <div class="12u">
                                    <ul class="actions">
                                        <li><input type="submit" class="special" value="Register"/></li>
                                        <li><input type="reset" value="Reset Form"/></li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

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