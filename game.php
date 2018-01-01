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
    <title>Official Game Server</title>
    <meta name="description" content="Offical Much Assembly Required game server page">
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/html5shiv.js"></script><![endif]-->
    <link rel="stylesheet" href="assets/css/main.min.css"/>
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="assets/css/ie8.min.css"/><![endif]-->
    <link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css">


    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/jquery.dropotron.min.js"></script>
    <script src="assets/js/skel.min.js"></script>
    <script src="assets/js/util.min.js"></script>
    <!--[if lte IE 8]>
    <script src="assets/js/ie/respond.min.js"></script><![endif]-->
    <script src="assets/js/main.min.js"></script>

    <script src="FileSaver.min.js"></script>

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
            <li class="current"><a href="game.php">Game</a></li>
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

                    <style>
                        #tabs ul, li, a {
                            display: inline;
                        }

                        #tabs .ui-tabs-nav li.ui-tabs-active a {
                            background: #a1cd9b;
                        }

                        #editorBtns {
                            display: inline;

                        }

                        .editorBtn {
                            background: #895EC3;
                            padding: .85em 1em
                        }

                        .editorBtn:hover {
                            background: #A386CA;
                        }

                        #gameBtns {
                            display: inline;
                        }

                        #console {
                            font-family: fixedsys, monospace;
                            font-size: 24pt;
                            line-height: 21px;
                            resize: none;
                            overflow-y: scroll;
                            width: 680px;
                            height: 180px;
                        }

                        #consoleContainer {
                            margin: 20px;
                            text-align: center;
                        }


                    </style>

                    <script>
                        $(function () {
                            $("#tabs").tabs();
                        });

                        fullscreen = false;
                    </script>

                    <!-- Game box -->
                    <div id="tabs">

                        <ul>
                            <li><a class="button alt" href="#game" onclick="gameClick()">Game</a>
                            </li>
                            <li><a class="button alt" href="#editorTab" onclick="editorClick()">Editor</a>
                            </li>
                        </ul>

                        <!-- Editor buttons -->
                        <div id="editorBtns" style="display: none">
                            <a class="button editorBtn" onclick="mar.client.uploadCode(ace.edit('editor').getValue())">Upload</a>
                            <a class="button editorBtn" onclick="mar.client.reloadCode()">Reload</a>
                            <a class="button editorBtn" id="floppyDown" onclick="mar.client.requestFloppy()"><i
                                        class="fa fa-long-arrow-down" aria-hidden="true"></i> <i class="fa fa-floppy-o"
                                                                                                 aria-hidden="true"></i></a>
                            <button class="editorBtn" id="floppyUp"
                                    onclick="document.getElementById('floppyIn').click();"><i
                                        class="fa fa-long-arrow-up" aria-hidden="true"></i> <i class="fa fa-floppy-o"
                                                                                               aria-hidden="true"></i>
                            </button>
                            <!-- style the select to something more select'y -->
                            <select class="button editorBtn" id="editorTheme"></select>
                        </div>

                        <div id="gameBtns">
                            <a class="button editorBtn" onclick="findMyRobot()">Find My Robot</a>
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
                            <script src="./mar/phaser/phaser.min.js"></script>
                            <script src="./mar/phaser/phaser-plugin-isometric.min.js"></script>
                            <script src="./mar/phaser/mar.js"></script>
                        </div>

                        <!-- Editor -->
                        <div id="editorTab">
                            <div id="editor"></div>
                            <script src="./mar/ace/ace.js" type="text/javascript" charset="utf-8"></script>

                            <script src="./mar/editor.js"></script>
                            <script>
                                // check if browser supports local storage if not than bad luck, use something else than IE7
                                var editorStorage;
                                if(typeof window.localStorage !== 'undefined') {
                                    editorStorage = window.localStorage;
                                } else {
                                    editorStorage = false;
                                }

                                // default should be 'theme/tommorow.js' or loaded from local storage
                                var editorThemeOptions = {
                                    available : [
                                        "theme/ambiance", "theme/chaos", "theme/chrome",
                                        "theme/clouds", "theme/clouds_midnight", "theme/cobalt",
                                        "theme/crimson_editor", "theme/dawn", "theme/dracula",
                                        "theme/dreamweaver", "theme/eclipse", "theme/github",
                                        "theme/gob", "theme/gruvbox", "theme/idle_fingers",
                                        "theme/iplastic", "theme/katzenmilch", "theme/kr_theme",
                                        "theme/kuroir", "theme/merbivore", "theme/merbivore_soft",
                                        "theme/mono_industrial", "theme/monokai", "theme/pastel_on_dark",
                                        "theme/solarized_dark", "theme/solarized_light", "theme/sqlserver",
                                        "theme/terminal", "theme/textmate", "theme/tomorrow",
                                        "theme/tomorrow_night_blue", "theme/tomorrow_night_bright", "theme/tomorrow_night_eighties",
                                        "theme/tomorrow_night", "theme/twilight", "theme/vibrant_ink", "theme/xcode"
                                    ],
                                    default : "theme/tomorrow"
                                }

                                // get the stored default theme
                                if(editorStorage) {
                                    var storedTheme = editorStorage.getItem('editorTheme');
                                    if(storedTheme !== null && editorThemeOptions.available.indexOf(storedTheme) != -1) {
                                        editorThemeOptions.default = storedTheme;
                                    }
                                }

                                // cache element reference
                                var editorThemeSelectElement = document.getElementById("editorTheme");

                                // event handler
                                function editorOnThemeChange() {
                                    if(editorThemeSelectElement === null) {
                                        console.error("editorOnThemeChange() :: editorThemeSelectElement seems to be 'null'");
                                        return;
                                    }
                                    var select = editorThemeSelectElement;
                                    var option = select.options[select.selectedIndex];

                                    if(!editorThemeOptions.available.indexOf(option.value) == -1) {
                                        console.error("editorOnThemeChange() :: user somehow selected an invalid theme : '" + option.value  + "' for '" + option.text + "'");
                                        return;
                                    }

                                    // store locally so it gets remembered
                                    if(editorStorage) {
                                        editorStorage.setItem('editorTheme', option.value);
                                    }

                                    // set theme
                                    editor.setTheme("ace/" + option.value);
                                }

                                // add handler to listen to event
                                editorThemeSelectElement.addEventListener('change', editorOnThemeChange);

                                // populate select
                                editorThemeOptions.available.forEach(function(theme) {
                                    var option = document.createElement("option");
                                    option.value = theme;
                                    option.text = theme.substring(6); // "theme/{text}" -> extract text to set as text user sees

                                    // make sure default is also the one that is selected
                                    if(theme === editorThemeOptions.default) {
                                        option.selected = true;
                                    }

                                    editorThemeSelectElement.appendChild(option);
                                });

                                // manualy call handler once
                                editorOnThemeChange();

                                editor.getSession().setMode("ace/mode/mar");
                                editor.setFontSize(16);
                                editor.setDisplayIndentGuides(false);
                                document.getElementById('editor').style.fontFamily="fixedsys";
                            </script>

                        </div>

                        <!-- Console-->
                        <div id="consoleContainer">
                            <textarea id="console" readonly title="console"></textarea>

                            <a class="button" style="vertical-align: top"
                               onclick="document.getElementById('console').innerHTML=''">Clear</a>
                        </div>


                        <form id="floppyForm">
                            <input id="floppyIn" type="file" name="floppyIn" style="display: none;"/>
                        </form>

                        <script>
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
                </div>
            </div>
        </div>
    </div>
    <?php //include "footer.inc.html" ?>
</div>


</body>
</html>
