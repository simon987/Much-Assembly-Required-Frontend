<?php
include_once "include/SessionManager.php";
include_once "include/TokenManager.php";
include_once "include/TokenManager.php";
$user = SessionManager::get();


if (isset($user)) {

    $token = TokenManager::generateToken($user['username']);
}
?>

<!DOCTYPE HTML>
<html>
<head>
    <title><?php echo MAR_SERVER_NAME ?></title>
    <meta name="description" content="Official Much Assembly Required game server page">
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/html5shiv.js"></script><![endif]-->
    <link rel="stylesheet" href="assets/css/main.min.css"/>
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="assets/css/ie8.min.css"/><![endif]-->
    <link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="mar/console.min.css">


    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/jquery.dropotron.min.js"></script>
    <script src="assets/js/skel.min.js"></script>
    <script src="assets/js/util.min.js"></script>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/respond.min.js"></script><![endif]-->
    <script src="assets/js/main.min.js"></script>

    <script src="assets/js/FileSaver.min.js"></script>

    <link rel="stylesheet" type="text/css" href="./mar/game.css">
    <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

</head>
<body>
<div id="page-wrapper">

    <!-- Nav -->
    <nav id="nav">
        <ul>
            <li><a href="index.php">Home</a></li>
            <li class="current"><a href="servers.php">Play</a></li>
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

    <div id="main-wrapper">
        <div id="main" class="container">
            <div class="12u 12u(mobile) important(mobile)">
                <div class="content content-left">

                    <script>
                        $(function () {
                            $("#tabs").tabs();
                        });
                    </script>

                    <!-- Game box -->
                    <div id="tabs">

                        <ul>
                            <li><a class="button alt" href="#game" onclick="gameClick()">Game</a>
                            </li>
                            <?php if($user) { ?>
                                <li><a class="button alt" href="#editorTab" onclick="editorClick()">Editor</a>
                                </li>
                            <?php } else { ?>
                                <li><a class="button alt" onclick="window.location = 'login.php';">Editor</a>
                                </li>
                            <?php } ?>
                        </ul>

                        <!-- Editor buttons -->
                        <?php if($user) { ?>
                            <div id="editorBtns" style="display: none">
                                <a class="button editorBtn"
                                   onclick="mar.client.uploadCode(ace.edit('editor').getValue())">Upload</a>
                                <a class="button editorBtn" onclick="mar.client.reloadCode()">Reload</a>
                                <a class="button editorBtn" id="floppyDown" onclick="mar.client.requestFloppy()"><i
                                            class="fa fa-long-arrow-down" aria-hidden="true"></i> <i
                                            class="fa fa-floppy-o"
                                            aria-hidden="true"></i></a>
                                <button class="editorBtn" id="floppyUp"
                                        onclick="document.getElementById('floppyIn').click();"><i
                                            class="fa fa-long-arrow-up" aria-hidden="true"></i> <i
                                            class="fa fa-floppy-o"
                                            aria-hidden="true"></i>
                                </button>
                                <!-- Style the select to something more select'y -->
                                <select title="Select Theme" class="button editorBtn" id="editorTheme"></select>
                            </div>
                        <?php } ?>

                        <div id="gameBtns">
                            <a class="button editorBtn" onclick="mar.client.findMyRobot()">Find My Robot</a>
                        </div>

                        <!-- Docs link -->
                        <a class="button alt" id="btnDocs"
                           href="https://github.com/simon987/Much-Assembly-Required/wiki" target="_blank">
                            Docs <i class="fa fa-external-link"></i>
                        </a>
                        <a class="button alt"
                           href="https://join.slack.com/t/muchassemblyrequired/shared_invite/enQtMjY3Mjc1OTUwNjEwLTkyOTIwOTA5OGY4MDVlMGI4NzM5YzlhMWJiMGY1OWE2NjUxODQ1NWQ1YTcxMTA1NGZkYzNjYzMyM2E1ODdmNzg"
                           target="_blank">
                            Chat <i class="fa fa-commenting-o" aria-hidden="true"></i>
                        </a>

                        <!-- Game -->
                        <div id="game" tabindex="0">
                            <script src="mar/phaser.min.js"></script>
                            <script src="mar/phaser-plugin-isometric.min.js"></script>
                            <script src="mar/app.js"></script>
                        </div>
                        <?php if ($user) { ?>
                            <!-- Editor -->
                            <div id="editorTab">
                                <div id="editor"></div>
                                <script src="./mar/ace/ace.js" type="text/javascript" charset="utf-8"></script>
                                <script src="./mar/editor.min.js"></script>
                            </div>
                        <?php } ?>


                        <form id="floppyForm">
                            <input id="floppyIn" type="file" name="floppyIn" style="display: none;"/>
                        </form>

                        <script>
                            //Todo move that to file
                            document.getElementById("floppyIn").onchange = function () {

                                document.getElementById("floppyUp").innerHTML = "<i class=\"fa fa-cog fa-spin fa-fw\" aria-hidden=\"true\"></i>";

                                var formData = new FormData(document.getElementById("floppyForm"));

                                formData.append("floppyData", document.getElementById("floppyIn").files[0]);

                                var xhr = new XMLHttpRequest();
                                xhr.open('POST', 'floppyUp.php', true);
                                xhr.onload = function () {
                                    if (xhr.status === 200) {

                                        if (xhr.responseText === "ok") {
                                            //Upload ok, notify the game server
                                            mar.client.notifyFloppyUp();
                                            alert("Uploaded floppy disk to the drive!")
                                        } else {
                                            alert(xhr.responseText)
                                        }

                                    } else {
                                        alert("Couldn't upload floppy code (" + xhr.status + ")");
                                    }

                                    document.getElementById("floppyUp").innerHTML = "<i class=\"fa fa-long-arrow-up\" aria-hidden=\"true\"></i> <i class=\"fa fa-floppy-o\" aria-hidden=\"true\"></i>";
                                };
                                xhr.send(formData);
                            };
                        </script>
                    </div>

                    <!-- Console-->
                    <div id="console-wrapper">
                        <div id="shadow-wrapper">
                            <div id="console-wrapper-left" class="noisy">
                                <div class="frame">
                                    <div id="consoleText" class="piece output noclick ctr-selection ctr-text"></div>
                                    <div class="piece scanlines noclick"></div>
                                    <div class="piece glow noclick"></div>
                                </div>
                            </div><div id="console-wrapper-side">
                                <div class="sideFrame">

                                    <!-- Console Buttons -->
                                    <span class="vertical-text">COLOR</span>
                                    <img id="colorButton" src="images/pdp8ion.png" class="pdp8Button">

                                    <span class="vertical-text" style="left: 25px;">SCROLL</span>
                                    <img id="scrollButton" src="images/pdp8ioff.png" class="pdp8Button">

                                    <span class="vertical-text" style="left: 55px;">RESET</span>
                                    <img id="resetButton" src="images/pdp8ion.png" class="pdp8Button">

                                    <!-- width Dial -->
                                    <div class="dial-backPlate">
                                        <img src="images/knob-65.png" class="dial" id="widthDial">
                                        <img src="images/lines.png" class="dial-lines">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <?php //include "footer.inc.html" ?>
</div>


</body>
</html>
