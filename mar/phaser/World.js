///<reference path="GameClient.ts"/>
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
var instances = PIXI.instances;
var Direction;
(function (Direction) {
    Direction[Direction["NORTH"] = 0] = "NORTH";
    Direction[Direction["EAST"] = 1] = "EAST";
    Direction[Direction["SOUTH"] = 2] = "SOUTH";
    Direction[Direction["WEST"] = 3] = "WEST";
})(Direction || (Direction = {}));
var Tile = (function (_super) {
    __extends(Tile, _super);
    function Tile(x, y, sprite, anchorY) {
        var _this = _super.call(this, mar.game, Util.getIsoX(x), Util.getIsoY(y), 0, 'sheet', sprite) || this;
        _this.baseZ = 0; //Base height of the tile
        _this.tileX = x;
        _this.tileY = y;
        _this.anchor.set(0.5, anchorY);
        return _this;
    }
    /**
     * Factory method to create a Tile
     */
    Tile.createTile = function (type, x, y) {
        switch (type) {
            case TileType.WALL:
                return new WallTile(x, y);
            case TileType.IRON:
                return new IronTile(x, y);
            case TileType.COPPER:
                return new CopperTile(x, y);
            case TileType.PLAIN:
            default:
                return new PlainTile(x, y);
        }
    };
    Tile.prototype.onHover = function () {
        this.tint = config.tileHoverTint;
        mar.game.add.tween(this).to({ isoZ: this.baseZ + 8 }, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.tileIndicator.tileX = this.tileX;
        mar.tileIndicator.tileY = this.tileY;
        mar.tileIndicator.tileType = this.tileType;
    };
    Tile.prototype.onExit = function () {
        this.tint = this.baseTint;
        mar.game.add.tween(this).to({ isoZ: this.baseZ }, 200, Phaser.Easing.Quadratic.InOut, true);
    };
    Tile.prototype.setText = function (text, fillColor) {
        //Remove previous text
        if (this.textSprite !== undefined) {
            this.textSprite.destroy();
        }
        this.textSprite = mar.game.make.text(0, 16, text, {
            fontSize: 22,
            fill: fillColor,
            stroke: "#FFFFFF",
            strokeThickness: 1,
            font: "fixedsys"
        });
        this.textSprite.alpha = 0.6;
        this.textSprite.anchor.set(0.5, 0);
        this.addChild(this.textSprite);
    };
    return Tile;
}(Phaser.Plugin.Isometric.IsoSprite));
var PlainTile = (function (_super) {
    __extends(PlainTile, _super);
    function PlainTile(x, y) {
        var _this = _super.call(this, x, y, config.plainSprite, 0) || this;
        _this.baseTint = config.tileTint;
        _this.tint = _this.baseTint;
        _this.tileType = "plain";
        return _this;
    }
    return PlainTile;
}(Tile));
var WallTile = (function (_super) {
    __extends(WallTile, _super);
    function WallTile(x, y) {
        var _this = _super.call(this, x, y, config.wallSprite, 0.2) || this;
        _this.baseTint = config.wallTint;
        _this.tint = _this.baseTint;
        _this.tileType = "wall";
        return _this;
    }
    return WallTile;
}(Tile));
var IronTile = (function (_super) {
    __extends(IronTile, _super);
    function IronTile(x, y) {
        var _this = _super.call(this, x, y, config.plainSprite, 0) || this;
        _this.baseTint = config.oreTint;
        _this.tint = _this.baseTint;
        _this.setText("Iron", config.textIron);
        _this.tileType = "iron";
        return _this;
    }
    return IronTile;
}(Tile));
var CopperTile = (function (_super) {
    __extends(CopperTile, _super);
    function CopperTile(x, y) {
        var _this = _super.call(this, x, y, config.plainSprite, 0) || this;
        _this.baseTint = config.oreTint;
        _this.tint = _this.baseTint;
        _this.setText("Copper", config.textCopper);
        _this.tileType = "copper";
        return _this;
    }
    return CopperTile;
}(Tile));
var World = (function () {
    function World(terrain) {
        this.tiles = [];
        this.objects = [];
        //Create tilemap
        this.setTerrain(terrain);
        //Setup World Arrows
        mar.isoGroup.add(new WorldArrow(528, -10, "ui/arrow_north", Direction.NORTH));
        mar.isoGroup.add(new WorldArrow(1115, 587, "ui/arrow_east", Direction.EAST));
        mar.isoGroup.add(new WorldArrow(528, 1170, "ui/arrow_south", Direction.SOUTH));
        mar.isoGroup.add(new WorldArrow(-60, 587, "ui/arrow_west", Direction.WEST));
    }
    /**
     * Load terrain data from array and create Tiles
     * @param terrain
     */
    World.prototype.setTerrain = function (terrain) {
        if (DEBUG) {
            console.log("[MAR] Creating tilemap");
        }
        for (var x = 0; x < config.worldSize; x++) {
            for (var y = 0; y < config.worldSize; y++) {
                var tile = Tile.createTile(terrain[y * config.worldSize + x], x, y);
                this.tiles.push(tile);
                mar.isoGroup.add(tile);
            }
        }
    };
    World.prototype.setBigMessage = function (msg) {
        this.bigMessage = mar.game.add.text(908, 450, msg, {
            fontSize: 46,
            fill: config.bigMessageFill,
            stroke: config.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        }, mar.textGroup);
    };
    World.prototype.removeBigMessage = function () {
        if (this.bigMessage != undefined) {
            this.bigMessage.destroy();
            if (DEBUG) {
                console.log("[MAR] Destroyed big message");
            }
        }
    };
    /**
     * Get object by id
     */
    World.prototype.getObject = function (id) {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === id) {
                return this.objects[i];
            }
        }
        return null;
    };
    /**
     * Update, create or delete the current objects based on a list received from the server
     * @param objects json list of objects
     */
    World.prototype.handleObjectsUpdate = function (objects) {
        //Mark objects as not updated
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].updated = false;
        }
        for (var i = 0; i < objects.length; i++) {
            //Update/Create the object
            var existingObject = this.getObject(objects[i].i);
            if (existingObject !== null) {
                //Object already exists
                existingObject.updated = true;
                existingObject.updateObject(objects[i]);
            }
            else {
                //Object is new
                var newObj = GameObject.createObject(objects[i]);
                if (newObj != null) {
                    newObj.updated = true;
                    this.objects.push(newObj);
                    mar.isoGroup.add(newObj);
                }
                else {
                    if (DEBUG) {
                        console.log("Couldn't create object with objType " + objects[i].t);
                    }
                }
            }
        }
        //Delete not updated objects (see above comments)
        for (var i = 0; i < this.objects.length; i++) {
            if (!this.objects[i].updated) {
                //Check if the object we are removing is our controlledUnit, if so, follow it
                if (mar.client.username !== "guest") {
                    if (this.objects[i] instanceof Cubot && this.objects[i].username === mar.client.username) {
                        mar.client.findMyRobot();
                        if (DEBUG) {
                            console.log("[MAR] Following Cubot " + mar.client.username);
                        }
                    }
                }
                this.objects[i].destroy();
                this.objects.splice(i, 1);
            }
        }
    };
    /**
     * Delete current ojects and tiles and replace them with provided terrain
     * @param terrain
     */
    World.prototype.updateTerrain = function (terrain) {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
        }
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].destroy();
        }
        this.objects = [];
        this.tiles = [];
        this.setTerrain(terrain);
        mar.game.iso.topologicalSort(mar.isoGroup);
    };
    return World;
}());
/**
 * Represents a 'button' sprite that changes world in a direction
 */
var WorldArrow = (function (_super) {
    __extends(WorldArrow, _super);
    function WorldArrow(x, y, frame, direction) {
        var _this = _super.call(this, mar.game, x, y, 10, "sheet", frame) || this;
        var self = _this;
        _this.hoverText = mar.game.make.text(10, 10, Direction[direction], config.arrowTextStyle);
        _this.addChild(_this.hoverText);
        _this.hoverText.visible = false;
        _this.hoverText.anchor.set(0, 0);
        _this.inputEnabled = true;
        _this.events.onInputDown.add(function () {
            var newX = mar.client.worldX + Util.getDeltaX(direction);
            var newY = mar.client.worldY + Util.getDeltaY(direction);
            //Wrapping coordinates around cyclically
            mar.client.worldX = newX % mar.client.maxWidth;
            mar.client.worldY = newY % mar.client.maxWidth;
            mar.client.requestTerrain();
        });
        _this.events.onInputOver.add(function () {
            self.tint = config.arrowHoverTint;
            self.hoverText.visible = true;
            document.body.style.cursor = "pointer";
        });
        _this.events.onInputOut.add(function () {
            self.tint = config.arrowTint;
            self.hoverText.visible = false;
            document.body.style.cursor = "default";
        });
        return _this;
    }
    return WorldArrow;
}(Phaser.Plugin.Isometric.IsoSprite));
