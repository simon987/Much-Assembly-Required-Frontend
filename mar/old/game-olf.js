"use strict";
console.log("hello")
// --------------------------
// MAR loop
function gameLoop() {
    requestAnimationFrame(gameLoop);

    //UPDATE EFFECTS
    for (var i = 0; i < MAR.effects.length; i++) {
        MAR.effects[i].update();
    }
    //Update objects
    for (var j = 0; j < MAR.objects.length; j++) {

        if (MAR.objects[j].objectType === 1) {-
            MAR.objects[j].update();
        }
    }

    MAR.renderer.render(MAR.rootContainer);
}

var setupCallback = function () {
    getWorldTerrain();
    gameLoop();
};

function tick() {
    getGameEffects();
    getGameObjects();

    //Update indicators
    for (var i = 0; i < MAR.objects.length; i++) {
        if (MAR.objects[i].indicator !== undefined) {
            MAR.objects[i].indicator.updateIcon();
        }
    }

    //Update debug text
    MAR.timeText.text = "gameTime: " + MAR.time;
}

function getGameObjects() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./mar/objects.php?x=" + MAR.currentLocX + "&y=" + MAR.currentLocY, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var jsonResponse = JSON.parse(xhr.responseText);

            for (var i = 0; i < MAR.objects.length; i++) {
                MAR.objects[i].updated = false;
            }

            for (var i = 0; i < jsonResponse.length; i++) {
                var obj = getObject(jsonResponse[i].i);

                if (obj !== null) {
                    //OBJECT already exist, update
                    obj.updated = true;

                    if (obj.objectType === 1) {
                        //Update direction
                        obj.direction = jsonResponse[i].d;

                        //Update location
                        if (obj.x !== jsonResponse[i].x || obj.y !== jsonResponse[i].y) {
                            //location changed
                            moveObject(jsonResponse[i].x, jsonResponse[i].y, obj);
                        }

                        //update held item
                        obj.heldItem = jsonResponse[i].h;
                        //Update action
                        obj.action = jsonResponse[i].a;
                    } else if (obj.objectType === 3) {
                        //Kiln object already exists, update
                        obj.qi = jsonResponse[i].qi; //Queued Iron
                        obj.qc = jsonResponse[i].qc; //Queued Copper
                        obj.ci = jsonResponse[i].ci; //Cooked Iron
                        obj.cc = jsonResponse[i].cc; //Cooked Copper
                        obj.f = jsonResponse[i].f; //Fuel
                    }


                } else {
                    var newObj = new GameObject(jsonResponse[i]);
                    newObj.updated = true;
                    MAR.worldLayer.addChild(newObj.sprite);
                    MAR.objects.push(newObj);

                    console.log("DEBUG: added " + newObj.id);
                }
            }

            //Delete not updated objects (see above comments)
            for (var i = 0; i < MAR.objects.length; i++) {
                if (!MAR.objects[i].updated) {
                    console.log("DEBUG: removed " + MAR.objects[i].id);
                    MAR.worldLayer.removeChild(MAR.objects[i].sprite);
                    MAR.objects.splice(i, 1);
                }
            }

            MAR.worldLayer.children.sort(depthCompare);
        }
    };
    xhr.send(null);
}

// --------------------------
// Display a single effect
function displayEffect(effect) {
    if (effect.t === "ERROR") {
        var newEffect = new IconEffect(effect.x, effect.y, "err_icon");
        MAR.effects.push(newEffect);
        addToWorldLayer(newEffect.sprite);
    }
    if (effect.t === "WARNING") {
        var newEffect = new IconEffect(effect.x, effect.y, "warn_icon");
        MAR.effects.push(newEffect);
        addToWorldLayer(newEffect.sprite);
    }
    if (effect.t === "A_EMOTE") {
        var newEffect = new IconEffect(effect.x, effect.y, "A_icon");
        MAR.effects.push(newEffect);
        addToWorldLayer(newEffect.sprite);
    }
}

// --------------------------
// Query the MAR API to get the MAR effects
function getGameEffects() {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./mar/effects.php?x=" + MAR.currentLocX + "&y=" + MAR.currentLocY, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var effects = JSON.parse(xhr.responseText);

            for (var i = 0; i < effects.length; i++) {
                displayEffect(effects[i]);
            }
            MAR.worldLayer.children.sort(depthCompare);
        }
    };
    xhr.send(null);
}

function getWorldTerrain() {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./mar/terrain.php?x=" + MAR.currentLocX + "&y=" + MAR.currentLocY, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var currentTerrain = JSON.parse(xhr.responseText);

            //Calculate wall height
            //First pass, set wall height to 2 for each wall tile with 3+ adjacent wall tile (diagonals don't count)
            for (var y = 0; y < 16; y++) {
                for (var x = 0; x < 16; x++) {
                    var tile = new Tile(currentTerrain[x * 16 + y]);


                    //Calculate neighbors
                    var neighbors = 0;
                    if (currentTerrain[x * 16 + y] === 1) {
                        if (currentTerrain[x * 16 + y - 16] === 1 ||
                            (currentTerrain[x * 16 + y - 16] !== undefined && currentTerrain[x * 16 + y - 16].wallHeight >= 1)) {
                            neighbors++;
                        } else {

                        }
                        if (currentTerrain[x * 16 + y + 16] === 1 ||
                            (currentTerrain[x * 16 + y + 16] !== undefined && currentTerrain[x * 16 + y + 16].wallHeight >= 1)) {
                            neighbors++;
                        }
                        if (currentTerrain[x * 16 + y + 1] === 1 ||
                            (currentTerrain[x * 16 + y + 1] !== undefined && currentTerrain[x * 16 + y + 1].wallHeight >= 1)) {
                            neighbors++;
                        }
                        if (currentTerrain[x * 16 + y - 1] === 1 ||
                            (currentTerrain[x * 16 + y - 1] !== undefined && currentTerrain[x * 16 + y - 1].wallHeight >= 1)) {
                            neighbors++;
                        }

                        if (neighbors >= 4) {
                            tile.wallHeight++;
                        }
                    }


                    tile.sprite.tileX = x;
                    tile.sprite.tileY = y;

                    tile.sprite.x += (x - y) * 64;
                    tile.sprite.y += (x + y) * 32;
                    tile.sprite.z += y + x;

                    //A bit hacky but it'll work for now...
                    currentTerrain[x * 16 + y] = tile;
                }
            }
            //currentTerrain is no longer an array of ints but an array of Tile objects
            //Add tiles to world layer
            for (var i = 0; i < currentTerrain.length; i++) {


                if (currentTerrain[i].sprite.tileId === 1) {
                    if (currentTerrain[i].wallHeight === 1) {
                        MAR.worldLayer.addChild(currentTerrain[i].sprite);
                    } else if (currentTerrain[i].wallHeight === 2) {

                        MAR.worldLayer.addChild(currentTerrain[i].sprite);
                        //Add duplicate sprite on top (63 px up)
                        var topTile = new Tile(1);
                        topTile.sprite.tileX = currentTerrain[i].sprite.tileX;
                        topTile.sprite.tileY = currentTerrain[i].sprite.tileY;
                        topTile.sprite.tileId = 1;

                        topTile.sprite.x = currentTerrain[i].sprite.x;
                        topTile.sprite.y = currentTerrain[i].sprite.y - 40;
                        topTile.sprite.z = currentTerrain[i].sprite.z + 1.1;
                        MAR.worldLayer.addChild(topTile.sprite);
                        MAR.tiles.push(topTile);
                    }

                } else {
                    MAR.worldLayer.addChild(currentTerrain[i].sprite);
                }

                MAR.tiles.push(currentTerrain[i]);
            }


            MAR.worldLayer.children.sort(depthCompare);
        }

    };
    xhr.send(null);

}

// --------------------------
// Query the MAR API to get MAR time
function getGameTime() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./mar/time.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            if (MAR.time !== xhr.responseText) {
                MAR.timeChanged = true;
                MAR.time = xhr.responseText;
            } else {
                MAR.timeChanged = false;
            }
        }
    };
    xhr.send(null);
}

// --------------------------
// Change an object's location and initialise the move animation
function moveObject(newX, newY, gameObject) {

    //Resync object
    gameObject.sprite.x = (gameObject.x - gameObject.y) * 64;
    gameObject.sprite.y = ((gameObject.x + gameObject.y) * 32) - 16;

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

    MAR.worldLayer.children.sort(depthCompare);

}