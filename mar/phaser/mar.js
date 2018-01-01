DIR_NORTH = 0;
DIR_EAST = 1;
DIR_SOUTH = 2;
DIR_WEST = 3;

WORLD_HEIGHT = WORLD_WIDTH = 16;


var colorScheme = {
    tileTint: 0xFFFFFF,
    wallTint: 0xDDDDDD,
    cubotHoverTint: 0x00FF00,
    cubotTint: 0xFFFFFF,
    textFill: "#FFFFFF",
    textStroke: "#9298a8",
    biomassTint: 0x63B85F,
    biomassHoverTint: 0x00FF00,
    tileHoverTint: 0x00FF00,
    itemIron: 0x434341,
    itemCopper: 0xC87D38,
    hologramFill: "#0aced6",
    hologramStroke: "#12FFB0",
    hologramAlpha: 0.9
};

var mar = {};
mar.kbBuffer = [];
mar.kbBufferText = "";
mar.animationFrames = {};
mar.controlledUnitVisible = false;
mar.lastLines = "";

CUBOT_WALK_FRAMES = {
    south: 240,
    north: 194,
    west: 254,
    east: 164
};

HARVESTER_WALK_FRAMES = {
    south: 347,
    north: 317,
    west: 377,
    east: 287
};

LOW_ENERGY = 100;


if (fullscreen) {
    RENDERER_WIDTH = window.innerWidth - 4;
    RENDERER_HEIGHT = window.innerHeight - 4;
} else {
    RENDERER_WIDTH = document.getElementById("game").clientWidth;
    RENDERER_HEIGHT = (window.innerHeight / 1.25);
}

var game = new Phaser.Game(RENDERER_WIDTH, RENDERER_HEIGHT, Phaser.AUTO, 'game', null, true, false);

function dispatchTileLeave(x, y) {

    for (var i = 0; i < mar.world.tiles.length; i++) {

        var tX = mar.world.tiles[i].tileX;
        var tY = mar.world.tiles[i].tileY;


        if (mar.world.tiles[i].isWall && ((tX === x && tY - 1 === y ) || (tX - 1 === x && tY - 1 === y) || (tX - 1 === x && tY === y ))
            && mar.world.tiles[i].alpha !== 1) {

            game.add.tween(mar.world.tiles[i]).to({alpha: 1}, 175, Phaser.Easing.Quadratic.In, true);
        }
    }

}

function dispatchTileEnter(x, y) {

    /*
     *   X X X
     *   X C T
     *   X T T
     *
     *   Transparent, X: Normal, C: Cubot
     */

    for (var i = 0; i < mar.world.tiles.length; i++) {

        var tX = mar.world.tiles[i].tileX;
        var tY = mar.world.tiles[i].tileY;


        if (mar.world.tiles[i].isWall && ((tX === x && tY - 1 === y ) || (tX - 1 === x && tY - 1 === y) || (tX - 1 === x && tY === y ))) {
            game.add.tween(mar.world.tiles[i]).to({alpha: 0.6}, 300, Phaser.Easing.Quadratic.In, true);
        }
    }

}

function Word(terrain) {

    var self = this;

    self.tiles = [];
    self.objects = [];

    setupWorldArrows();

    this.setTerrain = function (terrain) {
        for (var x = 0; x < WORLD_HEIGHT; x++) {
            for (var y = 0; y < WORLD_HEIGHT; y++) {

                var terrainType = terrain[y * WORLD_WIDTH + x];
                if (terrainType === 1) {
                    var tile = game.add.isoSprite(getIsoX(x), getIsoY(y), 0, 'sheet', "tiles/bigTile", isoGroup);
                    tile.baseZ = 0;
                    tile.baseTint = colorScheme.wallTint;
                    tile.anchor.set(0.5, 0.2);
                    tile.isWall = true;

                } else if (terrainType === 2) {

                    tile = game.add.isoSprite(getIsoX(x), getIsoY(y), 0, 'sheet', "tiles/tile", isoGroup);
                    text = game.make.text(0, 16, "Iron", {
                        fontSize: 22,
                        fill: "#434341",
                        stroke: "#FFFFFF",
                        strokeThickness: 1,
                        font: "fixedsys"
                    });
                    text.alpha = 0.6;
                    text.anchor.set(0.5, 0);
                    tile.addChild(text);
                    tile.baseZ = 0;
                    // tile.baseTint = 0x434341;
                    tile.baseTint = 0xF3F3F3;
                    tile.anchor.set(0.5, 0);
                } else if (terrainType === 3) {
                    tile = game.add.isoSprite(getIsoX(x), getIsoY(y), 0, 'sheet', "tiles/tile", isoGroup);
                    var text = game.make.text(0, 16, "Copper", {
                        fontSize: 22,
                        fill: "#C87D38",
                        stroke: "#FFFFFF",
                        strokeThickness: 1,
                        font: "fixedsys"
                    });
                    text.alpha = 0.6;
                    text.anchor.set(0.5, 0);
                    tile.addChild(text);
                    tile.baseZ = 0;
                    tile.baseTint = 0xF3F3F3;
                    tile.anchor.set(0.5, 0);
                } else {
                    tile = game.add.isoSprite(getIsoX(x), getIsoY(y), 0, 'sheet', "tiles/tile", isoGroup);
                    tile.baseZ = 0;
                    tile.baseTint = colorScheme.tileTint;
                    tile.anchor.set(0.5, 0);
                }

                tile.isTile = true;

                tile.tileX = x;
                tile.tileY = y;

                tile.tint = tile.baseTint;

                self.tiles.push(tile);
            }
        }
    };

    this.setTerrain(terrain);

    this.update = function (terrain) {


        for (var i = 0; i < mar.world.objects.length; i++) {
            mar.world.objects[i].destroy();
        }

        for (var i = 0; i < mar.world.tiles.length; i++) {
            mar.world.tiles[i].destroy();
        }

        mar.world.objects = [];
        mar.world.tiles = [];

        this.setTerrain(terrain);
        game.iso.topologicalSort(isoGroup);


    };

    /**
     * Get object from the list of 'current' objects (Objects shown on the screen)
     * @param id objectId of the object
     */
    this.getObject = function (id) {

        for (var i = 0; i < self.objects.length; i++) {
            if (self.objects[i].id === id) {
                return self.objects[i];
            }
        }

        return null;
    };

    /**
     * Update object from parsed JSON string sent from the server
     * @param response parsed JSON string sent from the server
     */
    this.updateObjects = function (response) {

        //Mark objects as not updated
        for (i = 0; i < self.objects.length; i++) {
            self.objects[i].updated = false;
        }

        for (var i = 0; i < response.length; i++) {

            //Update/Create the object
            var existingObject = self.getObject(response[i].i);

            if (existingObject !== null) {
                //Object already exists
                existingObject.updated = true;

                // console.log("Update " + existingObject.id);
                existingObject = updateGameObject(existingObject, response[i]);

            } else {

                //Object is new
                var newObj = createGameObject(response[i]);
                newObj.updated = true;
                self.objects.push(newObj);
            }
        }

        //Delete not updated objects (see above comments)
        for (var i = 0; i < self.objects.length; i++) {
            if (!self.objects[i].updated) {


                //Check if the object we are removing is our controlledUnit, if so, follow it
                if (mar.client.username !== "guest") {
                    if (self.objects[i].type === 1 && self.objects[i].username === mar.client.username) {
                        findMyRobot();
                        console.log("Following Cubot " + mar.client.username)
                    }
                }

                self.objects[i].destroy();

                dispatchTileLeave(self.objects[i].tileX, self.objects[i].tileY);
                self.objects.splice(i, 1);
            }
        }
    };

}

function updateGameObject(object, responseObj) {

    object.direction = responseObj.direction;


    if (object.type === 1) {

        object.action = responseObj.action;
        object.energy = responseObj.energy;

        //Update location
        if ((object.tileX !== responseObj.x || object.tileY !== responseObj.y)) {
            //location changed
            dispatchTileLeave(object.tileX, object.tileY);

            object.tileX = responseObj.x;
            object.tileY = responseObj.y;
            cubotWalk(object, object.direction, undefined, CUBOT_WALK_FRAMES);
        }

        //Update Inventory
        if (object.heldItem !== responseObj.heldItem) {

            if (object.inventory !== undefined) {
                object.inventory.destroy();
            }

            object.inventory = createInventory([responseObj.heldItem]);
            object.addChild(object.inventory);
            object.heldItem = responseObj.heldItem;

        }

        //Battery indication
        if (object.tint !== colorScheme.cubotHoverTint) {
            if (object.energy <= LOW_ENERGY) {
                object.tint = 0xFF0000;
            } else {
                object.tint = 0xFFFFFF;
            }
        }


        //Update direction
        switch (object.direction) {
            case DIR_NORTH:
                object.animations.frame = 194;
                break;
            case DIR_EAST:
                object.animations.frame = 164;
                break;
            case DIR_SOUTH:
                object.animations.frame = 240;
                break;
            case DIR_WEST:
                object.animations.frame = 254;
                break;
        }

        //Update hologram
        if (object.hologram !== undefined) {
            object.hologram.destroy();
        }

        var color = false;
        if (responseObj.holoC) {
            color = "#" + Number(responseObj.holoC & 0xFFFFFF).toString(16)
        }

        if (responseObj.holoMode === 1) {
            //Hex
            object.hologram = game.make.text(0, 32, "0x" + ("0000" + Number(responseObj.holo).toString(16).toUpperCase()).slice(-4), {
                fontSize: 32,
                fill: color ? color : colorScheme.hologramFill,
                stroke: colorScheme.hologramStroke,
                strokeThickness: 1,
                font: "fixedsys"
            });

            console.log(Number(color).toString(16))

        } else if (responseObj.holoMode === 2) {
            //String
            object.hologram = game.make.text(0, 32, responseObj.holoStr, {
                fontSize: 27,
                fill: color ? color : colorScheme.hologramFill,
                stroke: colorScheme.hologramStroke,
                strokeThickness: 1,
                font: "fixedsys"
            });

        } else if (responseObj.holoMode === 3) {
            //Decimal
            object.hologram = game.make.text(0, 32, Number(responseObj.holo).toString(), {
                fontSize: 32,
                fill: color ? color : colorScheme.hologramFill,
                stroke: colorScheme.hologramStroke,
                strokeThickness: 1,
                font: "fixedsys"
            });
        }

        if (object.hologram !== undefined) {
            object.hologram.alpha = colorScheme.hologramAlpha;
            object.hologram.anchor.set(0.5, 0);
            object.addChild(object.hologram);

            game.add.tween(object.hologram).to({tint: 0xFFFFF0, alpha: colorScheme.hologramAlpha - 0.1},
                mar.client.tickLength, Phaser.Easing.Bounce.In, true);
        }


        if (object.action === 1) {
            //Dig
            cubotDig(object, object.direction);
        }
    } else if (object.type === 10) {
        object.action = responseObj.action;

        //Update location
        if ((object.tileX !== responseObj.x || object.tileY !== responseObj.y)) {
            //location changed
            dispatchTileLeave(object.tileX, object.tileY);

            object.tileX = responseObj.x;
            object.tileY = responseObj.y;
            cubotWalk(object, object.direction, undefined, HARVESTER_WALK_FRAMES);
        }

        //Update direction
        switch (object.direction) {
            case DIR_NORTH:
                object.animations.frame = HARVESTER_WALK_FRAMES.north;
                break;
            case DIR_EAST:
                object.animations.frame = HARVESTER_WALK_FRAMES.east;
                break;
            case DIR_SOUTH:
                object.animations.frame = HARVESTER_WALK_FRAMES.south;
                break;
            case DIR_WEST:
                object.animations.frame = HARVESTER_WALK_FRAMES.west;
                break;
        }
    }


}

function itemColor(item) {

    switch (item) {

        case 1:
            return colorScheme.biomassTint;

        case 3:
            return colorScheme.itemIron;
        case 4:
            return colorScheme.itemCopper;

    }

}

function createInventory(items) {

    var inventory = game.make.group();
    switch (items.length) {
        case 0:
            return inventory;
        case 1:
            if (items[0] !== 0) {
                var shadow = game.make.sprite(0, 0, "sheet", "inventory/inv1x1");
                shadow.anchor.set(0.5, 0.1);
                shadow.alpha = 0.5;
                var item = game.make.sprite(0, 0, "sheet", "inventory/item");
                item.anchor.set(0.5, 0.1);
                item.tint = itemColor(items[0]);


                inventory.addChild(shadow);
                inventory.addChild(item);

            }
            return inventory;


    }

    for (var i = 0; i < items.length; i++) {

    }

}

function createGameObject(objData) {

    if (objData.t === 1) {
        var cubot = game.add.isoSprite(getIsoX(objData.x), getIsoY(objData.y), 15, "sheet", null, isoGroup);
        cubot.anchor.set(0.5, 0);

        cubot.inputEnabled = true;
        cubot.events.onInputDown.add(function () {
            debugObj = "Cubot: " + cubot.tileX + ", " + cubot.tileY;
        });

        cubot.events.onInputOver.add(function () {
            document.body.style.cursor = 'pointer';
        });
        cubot.events.onInputOut.add(function () {
            document.body.style.cursor = 'default';
        });

        cubot.id = objData.i;
        cubot.type = 1;
        cubot.tileX = objData.x;
        cubot.tileY = objData.y;
        cubot.username = objData.parent;
        cubot.heldItem = objData.heldItem;
        cubot.direction = objData.direction;
        cubot.action = objData.action;
        cubot.energy = objData.energy;

        cubot.inventory = createInventory([cubot.heldItem]);
        cubot.addChild(cubot.inventory);

        dispatchTileEnter(objData.x, objData.y);

        cubot.isAt = function (x, y) {
            return this.tileX === x && this.tileY === y;
        };

        cubot.onTileHover = function () {
            game.add.tween(this).to({isoZ: 45}, 200, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 200, Phaser.Easing.Linear.None, true);

            this.tint = colorScheme.cubotHoverTint;

        };
        cubot.onTileOut = function () {
            document.body.style.cursor = 'default';

            game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
            game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);

            this.tint = 0xFFFFFF;

        };

        //Battery indication
        if (cubot.energy <= LOW_ENERGY) {
            cubot.tint = 0xCC0000;
        }

        cubot.animations.add("walk_w", mar.animationFrames.walk_w, true);
        cubot.animations.add("walk_s", mar.animationFrames.walk_s, true);
        cubot.animations.add("walk_e", mar.animationFrames.walk_e, true);
        cubot.animations.add("walk_n", mar.animationFrames.walk_n, true);
        cubot.animations.add("dig_w", mar.animationFrames.dig_w, false);
        cubot.animations.add("dig_s", mar.animationFrames.dig_s, false);
        cubot.animations.add("dig_e", mar.animationFrames.dig_e, false);
        cubot.animations.add("dig_n", mar.animationFrames.dig_n, false);

        cubot.queuedAnims = [];

        switch (cubot.direction) {
            case DIR_NORTH:
                cubot.animations.frame = 194;
                break;
            case DIR_EAST:
                cubot.animations.frame = 164;
                break;
            case DIR_SOUTH:
                cubot.animations.frame = 240;
                break;
            case DIR_WEST:
                cubot.animations.frame = 254;
                break;
        }




        var username = game.make.text(0, -24, cubot.username, {
            fontSize: 22,
            fill: colorScheme.textFill,
            stroke: colorScheme.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });
        username.alpha = 0.85;
        username.anchor.set(0.5, 0);
        if (cubot.username === mar.client.username) {
            username.tint = 0xFB4D0A;
        } else {
            cubot.alpha = 0.6;
        }
        cubot.addChild(username);


        return cubot;

    } else if (objData.t === 2) {

        var biomass = game.add.isoSprite(getIsoX(objData.x), getIsoY(objData.y), 10, "sheet", 1, isoGroup);
        biomass.animations.add("idle", mar.animationFrames.biomassIdle, true);
        biomass.anchor.set(0.5, 0);

        biomass.type = 2;
        biomass.tileX = objData.x;
        biomass.tileY = objData.y;
        biomass.id = objData.i;

        biomass.tint = colorScheme.biomassTint;// "#3BB886"

        biomass.hoverText = game.make.text(0, 0, "Biomass", {
            fontSize: 22,
            fill: colorScheme.textFill,
            stroke: colorScheme.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });
        biomass.hoverText.alpha = 0;
        biomass.hoverText.anchor.set(0.5, 0);
        biomass.addChild(biomass.hoverText);

        biomass.isAt = function (x, y) {
            return this.tileX === x && this.tileY === y;
        };

        biomass.isAt = function (x, y) {
            return this.tileX === x && this.tileY === y;
        };

        biomass.onTileHover = function () {
            game.tweens.removeFrom(this);
            document.body.style.cursor = 'pointer';
            game.add.tween(this).to({isoZ: 45}, 200, Phaser.Easing.Quadratic.InOut, true);
            this.tint = colorScheme.biomassHoverTint;
            game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 200, Phaser.Easing.Linear.None, true);
            game.add.tween(this.hoverText).to({alpha: 0.9}, 200, Phaser.Easing.Quadratic.In, true);
            biomass.hoverText.visible = true;


        };
        biomass.onTileOut = function () {
            game.tweens.removeFrom(this);
            document.body.style.cursor = 'default';

            game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
            game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.biomassTint;
            game.add.tween(this.hoverText).to({alpha: 0}, 200, Phaser.Easing.Quadratic.Out, true);
        };

        biomass.animations.play("idle", 45, true);

        return biomass;

    } else if (objData.t === 10) {

        var harvester = game.add.isoSprite(getIsoX(objData.x), getIsoY(objData.y), 15, "sheet", null, isoGroup);
        harvester.anchor.set(0.5, 0);

        harvester.id = objData.i;
        harvester.type = 10;
        harvester.tileX = objData.x;
        harvester.tileY = objData.y;
        harvester.direction = objData.direction;
        harvester.action = objData.action;

        dispatchTileEnter(objData.x, objData.y);

        harvester.isAt = function (x, y) {
            return this.tileX === x && this.tileY === y;
        };

        harvester.onTileHover = function () {
            game.add.tween(this).to({isoZ: 45}, 200, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.cubotHoverTint;
        };
        harvester.onTileOut = function () {
            game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
            game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.cubotTint;
        };

        harvester.animations.add("walk_w", mar.animationFrames.harvester_walk_w, true);
        harvester.animations.add("walk_s", mar.animationFrames.harvester_walk_s, true);
        harvester.animations.add("walk_e", mar.animationFrames.harvester_walk_e, true);
        harvester.animations.add("walk_n", mar.animationFrames.harvester_walk_n, true);

        harvester.queuedAnims = [];

        switch (harvester.direction) {
            case DIR_NORTH:
                harvester.animations.frame = HARVESTER_WALK_FRAMES.north;
                break;
            case DIR_EAST:
                harvester.animations.frame = HARVESTER_WALK_FRAMES.east;
                break;
            case DIR_SOUTH:
                harvester.animations.frame = HARVESTER_WALK_FRAMES.south;
                break;
            case DIR_WEST:
                harvester.animations.frame = HARVESTER_WALK_FRAMES.west;
                break;
        }


        return harvester;
    } else if (objData.t === 3) {
        //Factory
        var factory = game.add.isoSprite(getIsoX(objData.x), getIsoY(objData.y), 15, "sheet", "objects/factory", isoGroup);
        factory.anchor.set(0.5, .25);

        factory.id = objData.i;
        factory.type = 3;
        factory.tileX = objData.x;
        factory.tileY = objData.y;


        factory.hoverText = game.make.text(0, 0, "Factory", {
            fontSize: 22,
            fill: colorScheme.textFill,
            stroke: colorScheme.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });
        factory.hoverText.alpha = 0;
        factory.hoverText.anchor.set(0.5, 0);
        factory.addChild(factory.hoverText);

        factory.isAt = function (x, y) {
            return (this.tileX === x || this.tileX + 1 === x) && (this.tileY + 1 === y || this.tileY === y);
        };

        factory.onTileHover = function () {
            game.tweens.removeFrom(this);
            game.add.tween(this).to({isoZ: 25}, 200, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(this.scale).to({x: 1.06, y: 1.06}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.cubotHoverTint;

            game.add.tween(this.hoverText).to({alpha: 0.9}, 200, Phaser.Easing.Quadratic.In, true);
            factory.hoverText.visible = true;
        };
        factory.onTileOut = function () {
            game.tweens.removeFrom(this);
            game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
            game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.cubotTint;

            game.add.tween(this.hoverText).to({alpha: 0}, 200, Phaser.Easing.Quadratic.Out, true);
        };

        return factory;
    } else if (objData.t === 4) {
        //Radio tower
        var radioTower = game.add.isoSprite(getIsoX(objData.x), getIsoY(objData.y), 15, "sheet", "objects/RadioTower", isoGroup);
        radioTower.anchor.set(0.5, 0.64);

        radioTower.id = objData.i;
        radioTower.type = 4;
        radioTower.tileX = objData.x;
        radioTower.tileY = objData.y;


        radioTower.hoverText = game.make.text(0, 0, "Radio Tower", {
            fontSize: 22,
            fill: colorScheme.textFill,
            stroke: colorScheme.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });
        radioTower.hoverText.alpha = 0;
        radioTower.hoverText.anchor.set(0.5, 0);
        radioTower.addChild(radioTower.hoverText);

        radioTower.isAt = function (x, y) {
            return this.tileX === x && this.tileY === y;
        };

        radioTower.onTileHover = function () {
            game.tweens.removeFrom(this);
            game.add.tween(this).to({isoZ: 45}, 200, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(this.scale).to({x: 1.15, y: 1.15}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.cubotHoverTint;

            game.add.tween(this.hoverText).to({alpha: 0.9}, 200, Phaser.Easing.Quadratic.In, true);
            radioTower.hoverText.visible = true;
        };
        radioTower.onTileOut = function () {
            game.tweens.removeFrom(this);
            game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
            game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
            this.tint = colorScheme.cubotTint;

            game.add.tween(this.hoverText).to({alpha: 0}, 200, Phaser.Easing.Quadratic.Out, true);
        };

        return radioTower;

    }
}

// --------------------------
//Integer distance between 2 tiles
function manhanttanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function codeListener(message) {

    if (message.t === "code") {

        ace.edit("editor").setValue(message.code);

    }
}

/**
 * Listens for authentications responses from the server
 */
function authListener(message) {

    if (message.t === "auth") {

        if (message.m === "ok") {
            console.log("Auth successful");
            mar.client.requestUserInfo();

        } else {
            alert("Authentication failed. Please make sure you are logged in and reload the page.");
        }
    }
}


function codeResponseListener(message) {
    if (message.t === "codeResponse") {
        alert("Uploaded and assembled " + message.bytes + " bytes")
    }
}

/**
 * Listens for user info responses from the server
 */
function userInfoListener(message) {


    if (message.t === "userInfo") {

        //Create new world / Find my robot
        console.log(message);

        mar.worldX = message.worldX;
        mar.worldY = message.worldY;

        mar.maxWidth = message.maxWidth;

        mar.client.requestTerrain();
    }
}

function terrainListener(message) {
    if (message.t === "terrain") {

        if (mar.world !== undefined) {
            mar.client.socket.send(JSON.stringify({t: "object", x: mar.worldX, y: mar.worldY}));
            mar.world.update(message.terrain);

        } else {
            mar.world = new Word(message.terrain);
            console.log("Gameloop started");

            //Handle keypresses
            game.input.keyboard.onDownCallback = function (event) {

                //If the game has focus
                if (document.activeElement === document.getElementById("game")) {
                    if ((event.keyCode >= 37 && event.keyCode <= 40) || event.keyCode === 116 || event.keyCode === 32) {
                        event.preventDefault();
                    }

                    if (mar.client.username !== "guest" && mar.kbBuffer.length <= 16) {
                        mar.client.sendKeypress(event.keyCode);

                        //Locally update the buffer
                        mar.kbBuffer.push(event.keyCode);
                        mar.kbBufferText = formattedKeyBuffer(mar.kbBuffer);
                    }
                }
            };

            //Grab focus when clicked (For chrome, Opera)
            game.input.onDown.add(function () {
                document.getElementById("game").focus();
            })
        }
    }
}

function objectListener(message) {

    if (message.t === "object") {
        mar.world.updateObjects(message.objects);
    }
}

function floppyListener(message) {
    document.getElementById("floppyDown").innerHTML = "<i class=\"fa fa-long-arrow-down\" aria-hidden=\"true\"></i> <i class=\"fa fa-floppy-o\" aria-hidden=\"true\"></i>";
    var blob = new Blob([message.data], {type: "application/octet-stream"});
    saveAs(blob, "floppy.bin");
}

var terminal = {}
terminal.autoscroll = true;
terminal.scroll = 0;
terminal.lines = 0;
terminal.length = 80;
terminal.height = 8;
terminal.fontsize = 10; // In tenths of em

terminal.scroll_update = function() {
    var old = terminal.scroll;
    terminal.scroll = Math.max(Math.min(
        Math.max(terminal.scroll, 0),
        terminal.elem.childElementCount - terminal.height
    ), 0);
    terminal.elem.style.marginTop = (terminal.scroll * -1.1) + "em";
    return terminal.scroll - old; // Actually it is always 0 on successful scroll. On edges it's +-1
}

terminal.scroll_handler = function(wheel_event) {
    terminal.scroll += (Math.abs(wheel_event.deltaY) / wheel_event.deltaY);
    if (terminal.scroll_update() == 0) {
        wheel_event.preventDefault();
    }
}

terminal.add_line = function(text) {
    var child = document.createElement("div");
    child.id = "line_" + (terminal.lines + 1);
    child.className = "console_line";
    if (text === undefined) {
        text = "";
    }
    child.textContent = text;

    terminal.elem.appendChild(child);
    terminal.lines += 1;
    terminal.last_line = child;
    if (terminal.autoscroll && terminal.lines > terminal.height) {
        terminal.scroll += 1;
        terminal.scroll_update();
    }
}

function split_by_length(array, length) {
    var new_array = [];
    
    for (var i = 0; i < array.length; i++) {
        // Adjust 80 to desired terminal width!
        // Because making it atuomatically follow the terminal.width is too
        //   much work. Seriously, look at "variables in js regexp" in Google.
        var m = array[i].match(/.{1,80}/g);
        new_array = new_array.concat(m);
    }

    delete(array);
    return new_array;
}

terminal.add_text = function(text) {
    if (text.indexOf("\0") != -1) {
        text = text.substring(0, text.indexOf("\0"));
    }
    // Console just got cleaned or it's freshly started
    if (terminal.lines == 0) {
        terminal.add_line();
    }

    var lines = text.split("\n");
    lines[0] = terminal.last_line.textContent + lines[0];
    lines = split_by_length(lines, 80);
    
    terminal.last_line.textContent = lines[0];

    // Handle further lines IF they exist
    if (lines.length > 1) {
        for (var i = 1; i < lines.length; i++) {
            terminal.add_line(lines[i]);
        }
    }
}

terminal.clear = function() {
    var new_elem = terminal.elem.cloneNode(false);
    terminal.holder.replaceChild(new_elem, terminal.elem);
    terminal.elem = new_elem;
    terminal.lines = 0;
    terminal.scroll = 0;
    terminal.scroll_update();
}

window.addEventListener("load", function(){
    terminal.ui = document.getElementById("console_ui");
    terminal.holder = document.getElementById("console_holder");
    terminal.elem = document.getElementById("console_scrollable");
    terminal.lines = terminal.elem.childElementCount;
    terminal.holder.addEventListener("wheel", terminal.scroll_handler);
    
    terminal.autoscroll_checkbox = document.getElementById("console_autoscroll");
    terminal.autoscroll_checkbox.addEventListener("change", function() {
        terminal.autoscroll = terminal.autoscroll_checkbox.checked;
    });

    document.getElementById("console_clear").addEventListener("click", terminal.clear);
    document.getElementById("console_font_plus").addEventListener("click", function() {
        terminal.ui.style.fontSize = (++terminal.fontsize)/10 + "em";
    });
    document.getElementById("console_font_minus").addEventListener("click", function() {
        terminal.ui.style.fontSize = (--terminal.fontsize)/10 + "em";
    });
});

function tickListener(message) {
    if (message.t === "tick") {
        //Request objects
        mar.client.socket.send(JSON.stringify({t: "object", x: mar.worldX, y: mar.worldY}));

        //Update key buffer display
        if (message.keys !== undefined) {
            mar.kbBuffer = message.keys;
            mar.kbBufferText = formattedKeyBuffer(mar.kbBuffer);
        }

        var myConsole = document.getElementById('console');

        if (message.cm === 0) {
            terminal.clear();
        }

        //Update console
        if (message.c !== undefined) {
            for (var i = 0; i < message.c.length; i++) {
                terminal.add_text(message.c[i]);
            }
        }
    }
}

var GameClient = function (callback) {

    var self = this;

    var listeners = [];
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "./getServerInfo.php", true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            console.log("Received server info " + xhr.responseText);

            setTimeout(function () {
                    var info = JSON.parse(xhr.responseText);

                    console.log(info.address);
                    self.socket = new WebSocket(info.address);
                    self.username = info.username;
                    self.tickLength = info.tickLength;
                    self.serverName = info.serverName;

                    mar.client.socket.binaryType = 'arraybuffer';
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
                        listeners.push(codeResponseListener);

                        mar.client.socket.onmessage = function (received) {

                            try {
                                var message = JSON.parse(received.data);

                            } catch (e) {
                                console.log(e)
                                floppyListener(received);
                            }

                            for (var i = 0; i < listeners.length; i++) {
                                listeners[i](message);
                            }


                        };

                        self.reloadCode();


                        if (callback !== undefined) {
                            callback();
                        }
                    };

                    self.socket.onerror = function (e) {

                        alert("Can't connect to game server at address " + info.address);

                        console.log(e);
                    };

                    self.socket.onclose = function (e) {

                        alert("Disconnected from server");
                        console.log(e);
                    }
                }

                , 100);
        }
    };
    xhr.send(null);


    this.requestUserInfo = function () {
        this.socket.send(JSON.stringify({t: "userInfo"}));
    };

    this.requestTerrain = function () {
        this.socket.send(JSON.stringify({t: "terrain", x: mar.worldX, y: mar.worldY}));
    };

    this.uploadCode = function (code) {
        console.log("Uploaded code");
        this.socket.send(JSON.stringify({t: "uploadCode", code: code}))
    };

    this.reloadCode = function () {
        this.socket.send(JSON.stringify({t: "codeRequest"}))
    };

    this.sendKeypress = function (key) {
        if (key !== 0) {
            this.socket.send(JSON.stringify({t: "k", k: key}));
        }
    };

    this.requestFloppy = function () {
        document.getElementById("floppyDown").innerHTML = "<i class=\"fa fa-cog fa-spin fa-fw\"></i>";
        this.socket.send(JSON.stringify({t: "floppyDown"}));
    };

    this.notifyFloppyUp = function () {
        this.socket.send(JSON.stringify({t: "floppyUp"}));
    }

};

function dispatchTileHover(x, y) {

    for (var i in mar.world.objects) {

        var object = mar.world.objects[i];

        if (object.isAt(x, y)) {
            object.onTileHover();
        }
    }
}

function dispatchTileOut(x, y) {
    for (var i in mar.world.objects) {

        var object = mar.world.objects[i];

        if (object.isAt(x, y)) {
            object.onTileOut();
        }
    }
}

var count = 0;
var BasicGame = function (game) {
};

BasicGame.Boot = function (game) {
};

var isoGroup, cursorPos, cursor;
var debugTile;
var debugObj;
var objectsGroup;
var cursors;
var tmpLine;

BasicGame.Boot.prototype = {
    preload: function () {
        game.load.atlasJSONHash("sheet", "./mar/sprites.png", "./mar/sprites.json");

        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game));

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        game.iso.anchor.setTo(0.5, 0);
        game.world.setBounds(0, 0, 2200, 1100);
        //Make camera more or less centered (tested on 1080 screen)
        game.camera.x = 280;
        game.camera.y = 90;
        game.stage.disableVisibilityChange = true;


    },
    create: function () {

        // Create a group for our tiles.
        isoGroup = game.add.group();
        objectsGroup = game.add.group();

        //Initialise Cubot Animations Frames lists
        initialiseAnimations();

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        // Provide a 3D position for the cursor
        cursorPos = new Phaser.Plugin.Isometric.Point3();

        cursors = game.input.keyboard.createCursorKeys();

    },
    update: function () {
        // Update the cursor position.
        // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
        // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
        game.iso.unproject(game.input.activePointer.position, cursorPos);

        // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
        isoGroup.forEach(function (tile) {

            if (tile.isTile) {
                var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
                // If it does, do a little animation and tint change.
                if (!tile.selected && inBounds) {
                    tile.selected = true;
                    tile.tint = colorScheme.tileHoverTint;

                    debugTile = tile.tileX + ", " + tile.tileY;

                    dispatchTileHover(tile.tileX, tile.tileY);

                    game.add.tween(tile).to({isoZ: tile.baseZ + 8}, 200, Phaser.Easing.Quadratic.InOut, true);
                }
                // If not, revert back to how it was.
                else if (tile.selected && !inBounds) {
                    dispatchTileOut(tile.tileX, tile.tileY);
                    tile.selected = false;
                    tile.tint = tile.baseTint;
                    game.add.tween(tile).to({isoZ: tile.baseZ}, 200, Phaser.Easing.Quadratic.InOut, true);
                }
            }
        });

        if (this.game.input.activePointer.isDown) {
            if (this.game.origDragPoint) {
                // move the camera by the amount the mouse has moved since last update
                this.game.camera.x += this.game.origDragPoint.x - this.game.input.activePointer.position.x;
                this.game.camera.y += this.game.origDragPoint.y - this.game.input.activePointer.position.y;
            }
            // set new drag origin to current position
            this.game.origDragPoint = this.game.input.activePointer.position.clone();

        } else {
            this.game.origDragPoint = null;
        }

        count++;

        if (count % 10 === 0) {
            game.iso.topologicalSort(isoGroup);
        }


        // if(mar.world){
        //     for(var i = 0; i < mar.world.objects.length; i++){
        //         if(mar.world.objects[i].animations){
        //             console.log(mar.world.objects[i].animations.currentFrame)
        //
        //         }
        //     }
        // }

    },


    render: function () {
        if (mar.worldX !== undefined) {
            game.debug.text("World: (" + Number(mar.worldX).toString(16) + ", " + Number(mar.worldY).toString(16) + ")", 10, 20);
        } else {
            game.debug.text("World: (?,?)", 10, 20);
        }
        if (debugTile) {
            game.debug.text(debugTile, 10, 40);
        }

        if (mar.client.username !== "guest") {
            game.debug.text(mar.kbBufferText, 210, 20);
        }
        // game.debug.text(debugObj, 32, 190);

        // game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");

        // game.debug.cameraInfo(game.camera, 32, 32);


        if (tmpLine !== undefined) {
            game.debug.geom(tmpLine);
            game.debug.lineInfo(tmpLine, 32, 32);
        }



    },
    spawnTiles: function () {
        mar.client = new GameClient();
    }
};

function setupWorldArrows() {

    var northArrow = game.make.isoSprite(528, -10, 10, "sheet", "ui/arrow_north", isoGroup);
    northArrow.inputEnabled = true;
    northArrow.events.onInputDown.add(function () {

        if (mar.worldY === 0) {
            mar.worldY = mar.maxWidth;
        } else {
            mar.worldY--;
        }
        mar.client.requestTerrain();
    });
    northArrow.events.onInputOver.add(function () {
        northArrow.tint = 0x00ff00;
        document.body.style.cursor = "pointer";
    });
    northArrow.events.onInputOut.add(function () {
        northArrow.tint = 0xFFFFFF;
        document.body.style.cursor = "default";
    });
    isoGroup.addChild(northArrow);

    var eastArrow = game.make.isoSprite(1115, 587, 10, "sheet", "ui/arrow_east", isoGroup);
    eastArrow.inputEnabled = true;
    eastArrow.events.onInputDown.add(function () {
        if (mar.worldX === mar.maxWidth) {
            mar.worldX = 0;
        } else {
            mar.worldX++;
        }
        mar.client.requestTerrain();
    });
    eastArrow.events.onInputOver.add(function () {
        eastArrow.tint = 0x00ff00;
        document.body.style.cursor = "pointer";
    });
    eastArrow.events.onInputOut.add(function () {
        eastArrow.tint = 0xFFFFFF;
        document.body.style.cursor = "default";
    });
    isoGroup.addChild(eastArrow);

    var southArrow = game.make.isoSprite(528, 1170, 10, "sheet", "ui/arrow_south", isoGroup);
    southArrow.inputEnabled = true;
    southArrow.events.onInputDown.add(function () {
        if (mar.worldY === mar.maxWidth) {
            mar.worldY = 0;
        } else {
            mar.worldY++;
        }
        mar.client.requestTerrain();
    });
    southArrow.events.onInputOver.add(function () {
        southArrow.tint = 0x00ff00;
        document.body.style.cursor = "pointer";
    });
    southArrow.events.onInputOut.add(function () {
        southArrow.tint = 0xFFFFFF;
        document.body.style.cursor = "default";
    });
    isoGroup.addChild(southArrow);

    var westArrow = game.make.isoSprite(-60, 587, 10, "sheet", "ui/arrow_west", isoGroup);
    westArrow.inputEnabled = true;
    westArrow.events.onInputDown.add(function () {
        if (mar.worldX === 0) {
            mar.worldX = mar.maxWidth;
        } else {
            mar.worldX--;
        }
        mar.client.requestTerrain();
    });
    westArrow.events.onInputOver.add(function () {
        westArrow.tint = 0x00ff00;
        document.body.style.cursor = "pointer";
    });
    westArrow.events.onInputOut.add(function () {
        westArrow.tint = 0xFFFFFF;
        document.body.style.cursor = "default";
    });
    isoGroup.addChild(westArrow);

}

function cubotDig(cubot, direction, callback) {
    if (direction === DIR_NORTH) {
        cubot.animations.play("dig_n", 45);
    } else if (direction === DIR_EAST) {
        cubot.animations.play("dig_e", 45);
    } else if (direction === DIR_SOUTH) {
        cubot.animations.play("dig_s", 45);
    } else if (direction === DIR_WEST) {
        cubot.animations.play("dig_w", 45);
    }
}

function cubotWalk(cubot, direction, callback, walkFrames) {

    var tween;

    if (direction === DIR_SOUTH) {

        var walk = function (duration) {

            cubot.animations.play("walk_s", 60, true);
            tween = game.add.tween(cubot).to({isoX: getIsoX(cubot.tileX), isoY: getIsoY(cubot.tileY)},
                duration, Phaser.Easing.Linear.None, true);

            dispatchTileEnter(cubot.tileX, cubot.tileY);

            tween.onComplete.add(function () {
                cubot.animations.stop();
                cubot.animations.frame = walkFrames.south;
                // cubot.tileY++;
                cubot.onTileOut();
                //Resync position
                cubot.isoX = getIsoX(cubot.tileX);
                cubot.isoY = getIsoY(cubot.tileY);

                if (callback !== undefined) {
                    callback();
                }

                for (var i = 0; i < cubot.queuedAnims.length; i++) {
                    cubot.queuedAnims[i](500);
                    cubot.queuedAnims.splice(i, 1)
                }
            })
        }

    } else if (direction === DIR_NORTH) {

        walk = function (duration) {

            cubot.animations.play("walk_n", 60, true);
            tween = game.add.tween(cubot).to({isoX: getIsoX(cubot.tileX), isoY: getIsoY(cubot.tileY)},
                duration, Phaser.Easing.Linear.None, true);
            dispatchTileEnter(cubot.tileX, cubot.tileY);

            tween.onComplete.add(function () {
                cubot.animations.stop();
                cubot.animations.frame = walkFrames.north;
                // cubot.tileY--;
                cubot.onTileOut();
                //Resync position
                cubot.isoX = getIsoX(cubot.tileX);
                cubot.isoY = getIsoY(cubot.tileY);

                if (callback !== undefined) {
                    callback();
                }

                for (var i = 0; i < cubot.queuedAnims.length; i++) {
                    cubot.queuedAnims[i](500);
                    cubot.queuedAnims.splice(i, 1)
                }
            })
        }

    } else if (direction === DIR_WEST) {
        walk = function (duration) {


            cubot.animations.play("walk_w", 60, true);
            tween = game.add.tween(cubot).to({isoX: getIsoX(cubot.tileX), isoY: getIsoY(cubot.tileY)},
                duration, Phaser.Easing.Linear.None, true);

            dispatchTileEnter(cubot.tileX, cubot.tileY);


            tween.onComplete.add(function () {
                cubot.animations.stop();
                cubot.animations.frame = walkFrames.west;
                // cubot.tileX--;
                cubot.onTileOut();
                //Resync position
                cubot.isoX = getIsoX(cubot.tileX);
                cubot.isoY = getIsoY(cubot.tileY);

                if (callback !== undefined) {
                    callback();
                }

                for (var i = 0; i < cubot.queuedAnims.length; i++) {
                    cubot.queuedAnims[i](500);
                    cubot.queuedAnims.splice(i, 1)
                }
            })
        }

    } else if (direction === DIR_EAST) {
        walk = function (duration) {

            cubot.animations.play("walk_e", 60, true);
            tween = game.add.tween(cubot).to({isoX: getIsoX(cubot.tileX), isoY: getIsoY(cubot.tileY)},
                duration, Phaser.Easing.Linear.None, true);

            dispatchTileEnter(cubot.tileX, cubot.tileY);


            tween.onComplete.add(function () {
                cubot.animations.stop();
                cubot.animations.frame = walkFrames.east;
                // cubot.tileX++;

                cubot.onTileOut();
                //Resync position
                cubot.isoX = getIsoX(cubot.tileX);
                cubot.isoY = getIsoY(cubot.tileY);

                if (callback !== undefined) {
                    callback();
                }

                for (var i = 0; i < cubot.queuedAnims.length; i++) {
                    cubot.queuedAnims[i](500);
                    cubot.queuedAnims.splice(i, 1)
                }
            })
        }
    }

    if (cubot.animations.currentAnim.isPlaying) {
        //Queue up the animation
        cubot.queuedAnims.push(walk);

        console.log("Queued Animation");

    } else {
        walk(800);
    }
}


function initialiseAnimations() {
    //Walk =-------------------------------------------------------
    //East
    mar.animationFrames.walk_e_start = [];
    for (var i = 0; i < 10; i++) {
        mar.animationFrames.walk_e_start.push("cubot/walk_e/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.walk_e = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.walk_e.push("cubot/walk_e/" + ("0000" + i).slice(-4));
    }

    mar.animationFrames.harvester_walk_e_start = [];
    for (var i = 0; i < 10; i++) {
        mar.animationFrames.harvester_walk_e_start.push("harvester/walk_e/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.harvester_walk_e = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.harvester_walk_e.push("harvester/walk_e/" + ("0000" + i).slice(-4));
    }
    //North
    mar.animationFrames.walk_n_start = [];
    for (i = 0; i < 10; i++) {
        mar.animationFrames.walk_n_start.push("cubot/walk_n/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.walk_n = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.walk_n.push("cubot/walk_n/" + ("0000" + i).slice(-4));
    }

    mar.animationFrames.harvester_walk_n_start = [];
    for (i = 0; i < 10; i++) {
        mar.animationFrames.harvester_walk_n_start.push("harvester/walk_n/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.harvester_walk_n = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.harvester_walk_n.push("harvester/walk_n/" + ("0000" + i).slice(-4));
    }
    //South
    mar.animationFrames.walk_s_start = [];
    for (i = 0; i < 10; i++) {
        mar.animationFrames.walk_s_start.push("cubot/walk_s/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.walk_s = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.walk_s.push("cubot/walk_s/" + ("0000" + i).slice(-4));
    }

    mar.animationFrames.harvester_walk_s_start = [];
    for (i = 0; i < 10; i++) {
        mar.animationFrames.harvester_walk_s_start.push("harvester/walk_s/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.harvester_walk_s = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.harvester_walk_s.push("harvester/walk_s/" + ("0000" + i).slice(-4));
    }
    //West
    mar.animationFrames.walk_w_start = [];
    for (i = 0; i < 10; i++) {
        mar.animationFrames.walk_w_start.push("cubot/walk_w/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.walk_w = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.walk_w.push("cubot/walk_w/" + ("0000" + i).slice(-4));
    }

    mar.animationFrames.harvester_walk_w_start = [];
    for (i = 0; i < 10; i++) {
        mar.animationFrames.harvester_walk_w_start.push("harvester/walk_w/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.harvester_walk_w = [];
    for (i = 10; i < 30; i++) {
        mar.animationFrames.harvester_walk_w.push("harvester/walk_w/" + ("0000" + i).slice(-4));
    }

    //Dig =-------------------------------------------------------
    mar.animationFrames.dig_e = [];
    for (i = 1; i <= 41; i++) {
        mar.animationFrames.dig_e.push("cubot/dig_e/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.dig_n = [];
    for (i = 1; i <= 41; i++) {
        mar.animationFrames.dig_n.push("cubot/dig_n/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.dig_s = [];
    for (i = 1; i <= 41; i++) {
        mar.animationFrames.dig_s.push("cubot/dig_s/" + ("0000" + i).slice(-4));
    }
    mar.animationFrames.dig_w = [];
    for (i = 1; i <= 41; i++) {
        mar.animationFrames.dig_w.push("cubot/dig_w/" + ("0000" + i).slice(-4));
    }

    //Biomass =-------------------------------------------------------
    mar.animationFrames.biomassIdle = [];
    for (i = 1; i < 60; i++) {
        mar.animationFrames.biomassIdle.push("objects/biomass/idle/" + ("0000" + i).slice(-4));
    }
}

function getIsoX(tileX) {
    return (tileX * 71.5)
}

function getIsoY(tileY) {
    return (tileY * 71.5)
}

function findMyRobot() {

    if (mar.client.username === "guest") {
        alert("You are not logged in!");
    } else {
        mar.client.requestUserInfo()
    }

}

function formattedKeyBuffer(kbBuffer) {

    var str = "KB: ";

    for (var i = 0; i < 16; i++) {

        if (kbBuffer[i] !== undefined) {

            str += kbBuffer[i].toString(16) + " ";

        } else {

            str += "__ ";
        }

    }

    return str;
}



game.state.add('Boot', BasicGame.Boot);

game.state.start('Boot');
