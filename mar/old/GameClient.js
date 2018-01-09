/**
 * Listens for authentications responses from the server
 */
function authListener(message){

    if(message.t === "auth"){

        if(message.m === "ok"){
            console.log("Auth successful");
            client.requestUserInfo();

        } else {
            console.log("Auth failed");
        }
    }
}

/**
 * Listens for user info responses from the server
 */
function userInfoListener(message){
    if(message.t === "userInfo"){

        game = new Game();
        game.worldX = message.worldX;
        game.worldY = message.worldY;

        client.requestTerrain();
    }
}

function formattedKeyBuffer(kbBuffer) {

    var str  = "Keyboard: ";

    for(var i = 0; i < 16; i++){

        if(kbBuffer[i] !== undefined) {

            str += "0x" + kbBuffer[i].toString(16) + " ";

        } else {

            str += "____ ";
        }

    }

    return str;
}

function terrainListener(message){
    if(message.t === "terrain"){

        if(game.world !== undefined){

            game.world.update(message.terrain);

        } else {
            game.world = new Word(message.terrain);

            //Setup keyboard buffer display
            game.textLayer = new PIXI.Container();
            game.rootContainer.addChild(game.textLayer);
            game.kbBuffer = [];

            game.keyboardBuffer = new PIXI.Text(formattedKeyBuffer([]), {fontSize: 16, fontFamily: "fixedsys", fill: "white"});
            game.textLayer.addChild(game.keyboardBuffer);


            //Handle keypresses
            window.addEventListener('keydown', function(event) {

                if(game.kbBuffer.length <= 16) {

                    client.sendKeypress(event.keyCode);

                    //Locally update the buffer
                    game.kbBuffer.push(event.keyCode);
                    game.keyboardBuffer.text = formattedKeyBuffer(game.kbBuffer);

                    if(event.keyCode >= 37 && event.keyCode <= 40){
                        event.preventDefault();
                    }
                }

            });
            console.log("Gameloop started");
            gameLoop();
        }


    }
}

function tickListener(message){
    if(message.t === "tick"){
        //Request objects
        client.socket.send(JSON.stringify({t: "object", x: game.worldX, y: game.worldY}));

        //Update key buffer display
        if(game.textLayer){
            if(message.keys !== undefined){
                console.log(message.keys);

                game.kbBuffer = message.keys;
                game.keyboardBuffer.text = formattedKeyBuffer(game.kbBuffer);
            }
        }
    }
}

function objectListener(message){

    if(message.t === "object"){

        game.world.updateObjects(message.objects);

    }
}

function codeListener(message){

    if(message.t === "code"){

        ace.edit("editor").setValue(message.code);

    }
}



function GameClient(callback) {

    var self = this;

    var listeners = [];
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "./getServerInfo.php", true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            console.log("Received server info " + xhr.responseText);

            setTimeout(function(){
                var info = JSON.parse(xhr.responseText);

                self.socket = new WebSocket(info.address);
                self.username = info.username;
                self.tickLength = info.tickLength;
                self.serverName = info.serverName;


                self.socket.onopen = function () {

                    //Send auth request
                    self.socket.send(info.token);


                    //Setup event managers
                    listeners.push(authListener);
                    listeners.push(userInfoListener);
                    listeners.push(terrainListener);
                    listeners.push(tickListener);
                    listeners.push(objectListener);
                    listeners.push(codeListener);

                    client.socket.onmessage = function(e){

                        //console.log("Received " + e.data);
                        var message = JSON.parse(e.data);

                        for(var i = 0; i < listeners.length ; i++){
                            listeners[i](message);
                        }
                    };

                    self.reloadCode();


                    if(callback !== undefined){
                        callback();
                    }
                }
            }, 100);
        }
    };
    xhr.send(null);


    this.requestUserInfo = function(){
        this.socket.send(JSON.stringify({t: "userInfo"}));
    };

    this.requestTerrain = function(){
        this.socket.send(JSON.stringify({t: "terrain", x: game.worldX, y: game.worldY}));
    };

    this.uploadCode = function(code){
        console.log("Uploaded code");
        this.socket.send(JSON.stringify({t: "uploadCode", code: code}))
    };

    this.reloadCode = function(){
        this.socket.send(JSON.stringify({t: "codeRequest"}))
    };

    this.sendKeypress = function(key){
        if(key !== 0){
            this.socket.send(JSON.stringify({t:"k", k:key}));
        }
    };


}


// Change an object's location and initialise the move animation
function moveObject(newX, newY, gameObject) {

    //Resync object

    for(clip in gameObject.clips){
        gameObject.clips[clip].x = (gameObject.x - gameObject.y) * 64;
        gameObject.clips[clip].y = ((gameObject.x + gameObject.y) * 32) - 16;
    }

    var tiledx = newX - gameObject.x;
    var tiledy = newY - gameObject.y;

    gameObject.dx = 0;
    gameObject.dy = 0;

    //Recalculate position
    gameObject.x = newX;
    gameObject.y = newY;

    if (tiledx === 1) {
        //We need to move 128px to the right and the minimum tick length is 1s.
        //This means that we have maximum 60 frames to do the animation
        gameObject.dx = 64 / 58;
        gameObject.dy = 32 / 58;
        gameObject.walking = 58;
        //Recalculate Z order immediately
        gameObject.sprite.z = gameObject.y + gameObject.x + 0.1;
    } else if (tiledx === -1) {
        gameObject.dx = -64 / 58;
        gameObject.dy = -32 / 58;
        gameObject.walking = 58;

        //The Z order needs to be recalculated when the movement ends
        gameObject.recalculateZAfter = true;
    } else if (tiledy === 1) {
        gameObject.dx = -64 / 58;
        gameObject.dy = 32 / 58;
        gameObject.walking = 58;
        //Recalculate Z order immediately
        gameObject.sprite.z = gameObject.y + gameObject.x + 0.1;
    } else if (tiledy === -1) {
        gameObject.dx = 64 / 58;
        gameObject.dy = -32 / 58;
        gameObject.walking = 58;
        //The Z order needs to be recalculated when the movement ends
        gameObject.recalculateZAfter = true;
    }

    game.worldLayer.children.sort(depthCompare);

}


