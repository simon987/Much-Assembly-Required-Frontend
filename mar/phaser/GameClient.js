var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Client-side keyboard buffer. It is overwritten by the server at the end of tick.
 */
var KeyboardBuffer = (function (_super) {
    __extends(KeyboardBuffer, _super);
    function KeyboardBuffer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Array of key codes. Updated on keypress
         * @type {Array}
         */
        _this.keys = [];
        return _this;
    }
    /**
     * @returns {string} Message written on the screen
     */
    KeyboardBuffer.prototype.getMessage = function () {
        var str = "KB: ";
        for (var i = 0; i < 16; i++) {
            if (this.keys[i] !== undefined) {
                str += this.keys[i].toString(16).toUpperCase() + " ";
            }
            else {
                str += "__ ";
            }
        }
        return str;
    };
    return KeyboardBuffer;
}(DebugMessage));
/**
 * Listens for object list
 */
var ObjectsListener = (function () {
    function ObjectsListener() {
    }
    ObjectsListener.prototype.getListenedMessageType = function () {
        return "object";
    };
    ObjectsListener.prototype.handle = function (message) {
        if (DEBUG) {
            console.log("[MAR] Received " + message.objects.length + " objects");
        }
        if (mar.world != undefined) {
            mar.world.handleObjectsUpdate(message.objects);
        }
    };
    return ObjectsListener;
}());
var TickListener = (function () {
    function TickListener() {
    }
    TickListener.prototype.getListenedMessageType = function () {
        return "tick";
    };
    TickListener.prototype.handle = function (message) {
        mar.client.requestObjects();
        //Update key buffer display
        if (message.keys !== undefined) {
            mar.client.keyboardBuffer.keys = message.keys;
        }
    };
    return TickListener;
}());
var UserInfoListener = (function () {
    function UserInfoListener() {
    }
    UserInfoListener.prototype.getListenedMessageType = function () {
        return "userInfo";
    };
    UserInfoListener.prototype.handle = function (message) {
        if (DEBUG) {
            console.log("[MAR] Received user info message");
        }
        mar.client.worldX = message.worldX;
        mar.client.worldY = message.worldY;
        //Maximum Universe width
        mar.client.maxWidth = message.maxWidth;
        mar.client.requestTerrain();
    };
    return UserInfoListener;
}());
var AuthListener = (function () {
    function AuthListener() {
    }
    AuthListener.prototype.getListenedMessageType = function () {
        return "auth";
    };
    AuthListener.prototype.handle = function (message) {
        if (DEBUG) {
            console.log("[MAR] Received auth response");
        }
        if (message.m === "ok") {
            console.log("[MAR] Auth successful");
            mar.client.requestUserInfo();
        }
        else {
            alert("Authentication failed. Please make sure you are logged in and reload the page.");
        }
    };
    return AuthListener;
}());
var TerrainListener = (function () {
    function TerrainListener() {
    }
    TerrainListener.prototype.getListenedMessageType = function () {
        return "terrain";
    };
    TerrainListener.prototype.handle = function (message) {
        if (DEBUG) {
            console.log("[MAR] Received terrain");
        }
        if (mar.world) {
            mar.world.removeBigMessage();
        }
        if (message.ok) {
            var worldSize = message.size;
            if (worldSize == undefined) {
                worldSize = config.defaultWorldSize;
            }
            if (DEBUG) {
                console.log("[MAR] World is available");
            }
            if (mar.world != null) {
                if (DEBUG) {
                    console.log("[MAR] Updating World terrain");
                }
                mar.world.updateTerrain(message.terrain, worldSize);
            }
            else {
                if (DEBUG) {
                    console.log("[MAR] Creating new World");
                }
                mar.world = new World(message.terrain, worldSize);
            }
        }
        else {
            if (DEBUG) {
                console.log("[MAR] World is not available");
            }
            if (mar.world != null) {
                if (DEBUG) {
                    console.log("[MAR] Updating World terrain");
                }
                mar.world.updateTerrain([], config.defaultWorldSize);
            }
            else {
                if (DEBUG) {
                    console.log("[MAR] Creating new World");
                }
                mar.world = new World([], config.defaultWorldSize);
            }
            if (mar.world) {
                mar.world.setBigMessage("[Uncharted World]");
            }
        }
    };
    return TerrainListener;
}());
var GameClient = (function () {
    function GameClient() {
        this.listeners = [];
        this.getServerInfo();
    }
    GameClient.prototype.requestUserInfo = function () {
        if (DEBUG) {
            console.log("[MAR] Requesting user info");
        }
        this.socket.send(JSON.stringify({ t: "userInfo" }));
    };
    GameClient.prototype.requestTerrain = function () {
        if (DEBUG) {
            console.log("[MAR] Requesting terrain for world (" + this.worldX + ", " + this.worldY + ")");
        }
        this.socket.send(JSON.stringify({ t: "terrain", x: this.worldX, y: this.worldY }));
        this.requestObjects();
    };
    GameClient.prototype.uploadCode = function (code) {
        if (DEBUG) {
            console.log("[MAR] Uploaded code");
        }
        this.socket.send(JSON.stringify({ t: "uploadCode", code: code }));
    };
    GameClient.prototype.reloadCode = function () {
        if (DEBUG) {
            console.log("[MAR] Reloading code");
        }
        this.socket.send(JSON.stringify({ t: "codeRequest" }));
    };
    GameClient.prototype.sendKeyPress = function (key) {
        if (DEBUG) {
            console.log("[MAR] Sent KeyPress: " + key);
        }
        if (key !== 0) {
            this.socket.send(JSON.stringify({ t: "k", k: key }));
        }
    };
    GameClient.prototype.requestFloppy = function () {
        //Start loading animation
        document.getElementById("floppyDown").innerHTML = "<i class=\"fa fa-cog fa-spin fa-fw\"></i>";
        if (DEBUG) {
            console.log("[MAR] Requesting floppy");
        }
        this.socket.send(JSON.stringify({ t: "floppyDown" }));
    };
    GameClient.prototype.notifyFloppyUp = function () {
        if (DEBUG) {
            console.log("[MAR] Notifying the game server of floppy upload");
        }
        this.socket.send(JSON.stringify({ t: "floppyUp" }));
    };
    GameClient.prototype.requestObjects = function () {
        if (DEBUG) {
            console.log("[MAR] Requesting game objects");
        }
        this.socket.send(JSON.stringify({ t: "object", x: this.worldX, y: this.worldY }));
    };
    /**
     * Get server info from game website
     */
    GameClient.prototype.getServerInfo = function () {
        var self = this;
        if (DEBUG) {
            console.log("[MAR] Getting server info... ");
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "./getServerInfo.php", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (DEBUG) {
                    console.log("[MAR] Received server info " + xhr.responseText);
                }
                setTimeout(self.connectToGameServer(JSON.parse(xhr.responseText)), 100);
            }
        };
        xhr.send(null);
    };
    /**
     * Connect to the game server
     * @param info JSON fetched from /getServerInfo.php
     */
    GameClient.prototype.connectToGameServer = function (info) {
        var self = this;
        if (DEBUG) {
            console.log("[MAR] Connecting to  " + info.address);
        }
        // info.address = "wss://muchassemblyrequired.com:443/socket";
        this.socket = new WebSocket(info.address);
        this.username = info.username;
        this.tickLength = info.tickLength;
        this.serverName = info.serverName;
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = function () {
            if (DEBUG) {
                console.log("[MAR] Connected. Sent auth request");
            }
            //Send auth request
            self.socket.send(info.token);
            //todo Setup event listeners
            self.listeners.push(new UserInfoListener());
            self.listeners.push(new AuthListener());
            self.listeners.push(new TickListener());
            self.listeners.push(new TerrainListener());
            self.listeners.push(new ObjectsListener());
            self.socket.onmessage = function (received) {
                var message;
                try {
                    message = JSON.parse(received.data);
                }
                catch (e) {
                    if (DEBUG) {
                        console.log("[MAR] " + e);
                    }
                    //todo floppyListener(received);
                }
                if (DEBUG) {
                    console.log("[MAR] Received: " + received.data);
                }
                for (var i = 0; i < self.listeners.length; i++) {
                    if (self.listeners[i].getListenedMessageType() === message.t) {
                        self.listeners[i].handle(message);
                    }
                }
            };
            //Reload code
            //todo reloadCode();
        };
        this.socket.onerror = function (e) {
            alert("Can't connect to game server at address " + info.address);
            console.log(e);
        };
        this.socket.onclose = function (e) {
            mar.world.setBigMessage("Disconnected from server :(");
            console.log(e);
        };
        this.initGame();
    };
    /**
     * Called after the connection has been made to the server
     */
    GameClient.prototype.initGame = function () {
        var self = this;
        //Setup keyboard buffer display
        //todo don't display if guest
        this.keyboardBuffer = new KeyboardBuffer(config.kbBufferX, config.kbBufferY);
        mar.addDebugMessage(this.keyboardBuffer);
        //Handle keypresses
        mar.game.input.keyboard.onDownCallback = function (event) {
            //If the game has focus
            if (document.activeElement === document.getElementById("game")) {
                if ((event.keyCode >= 37 && event.keyCode <= 40) || event.keyCode === 116 || event.keyCode === 32) {
                    event.preventDefault();
                }
                if (self.username !== "guest" && self.keyboardBuffer.keys.length <= 16) {
                    self.sendKeyPress(event.keyCode);
                    //Locally update the buffer
                    self.keyboardBuffer.keys.push(event.keyCode);
                }
            }
        };
    };
    /**
     * Requests user info, which will trigger a terrain request with the world X,Y of
     * the player's robot
     */
    GameClient.prototype.findMyRobot = function () {
        if (this.username === "guest") {
            alert("You are not logged in!");
        }
        else {
            this.requestUserInfo();
        }
    };
    return GameClient;
}());
