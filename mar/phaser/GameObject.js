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
var ObjectType;
(function (ObjectType) {
    ObjectType[ObjectType["CUBOT"] = 1] = "CUBOT";
    ObjectType[ObjectType["BIOMASS"] = 2] = "BIOMASS";
    ObjectType[ObjectType["HARVESTER_NPC"] = 10] = "HARVESTER_NPC";
    ObjectType[ObjectType["FACTORY"] = 3] = "FACTORY";
    ObjectType[ObjectType["RADIO_TOWER"] = 4] = "RADIO_TOWER";
})(ObjectType || (ObjectType = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["BIOMASS"] = 1] = "BIOMASS";
    ItemType[ItemType["IRON"] = 3] = "IRON";
    ItemType[ItemType["COPPER"] = 4] = "COPPER";
})(ItemType || (ItemType = {}));
var Action;
(function (Action) {
    Action[Action["IDLE"] = 0] = "IDLE";
    Action[Action["DIGGING"] = 1] = "DIGGING";
    Action[Action["WALKING"] = 2] = "WALKING";
    Action[Action["WITHDRAWING"] = 3] = "WITHDRAWING";
    Action[Action["DEPOSITING"] = 4] = "DEPOSITING";
    Action[Action["LISTENING"] = 5] = "LISTENING";
    Action[Action["JUMPING"] = 6] = "JUMPING";
})(Action || (Action = {}));
var GameObject = (function (_super) {
    __extends(GameObject, _super);
    function GameObject(x, y, z, key, frame) {
        return _super.call(this, mar.game, x, y, z, key, frame) || this;
    }
    /**
     * Factory method for GameObjects
     */
    GameObject.createObject = function (json) {
        switch (json.t) {
            case ObjectType.CUBOT:
                return new Cubot(json);
            case ObjectType.BIOMASS:
                return new BiomassBlob(json);
            case ObjectType.HARVESTER_NPC:
                return new HarvesterNPC(json);
            case ObjectType.FACTORY:
                return new Factory(json);
            case ObjectType.RADIO_TOWER:
                return new RadioTower(json);
            default:
                return null;
        }
    };
    /**
     * Set text that will appear on top of the object. Usually used for hover text
     */
    GameObject.prototype.setText = function (text) {
        this.text = mar.game.make.text(0, 0, text, {
            fontSize: 22,
            fill: config.textFill,
            stroke: config.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });
        this.text.anchor.set(0.5, 0);
        this.addChild(this.text);
    };
    /**
     * Tested to trigger onTileHover and onTileExit
     */
    GameObject.prototype.isAt = function (x, y) {
        return x == this.tileX && y == this.tileY;
    };
    return GameObject;
}(Phaser.Plugin.Isometric.IsoSprite));
var HologramMode;
(function (HologramMode) {
    HologramMode[HologramMode["CLEARED"] = 0] = "CLEARED";
    HologramMode[HologramMode["HEX"] = 1] = "HEX";
    HologramMode[HologramMode["STRING"] = 2] = "STRING";
    HologramMode[HologramMode["DEC"] = 3] = "DEC";
})(HologramMode || (HologramMode = {}));
var Cubot = (function (_super) {
    __extends(Cubot, _super);
    function Cubot(json) {
        var _this = _super.call(this, Util.getIsoX(json.x), Util.getIsoY(json.y), 15, "sheet", null) || this;
        /**
         * List of animation functions queued for execution.
         */
        _this.queuedAnimations = [];
        _this.hovered = false;
        if (DEBUG) {
            console.log("Creating Cubot object");
        }
        _this.anchor.set(0.5, 0);
        _this.id = json.i;
        _this.tileX = json.x;
        _this.tileY = json.y;
        _this.username = json.parent;
        _this.heldItem = json.heldItem;
        _this.direction = json.direction;
        _this.action = json.action;
        _this.energy = json.energy;
        _this.animations.add("walk_w", mar.animationFrames.walk_w);
        _this.animations.add("walk_s", mar.animationFrames.walk_s);
        _this.animations.add("walk_e", mar.animationFrames.walk_e);
        _this.animations.add("walk_n", mar.animationFrames.walk_n);
        _this.animations.add("dig_w", mar.animationFrames.dig_w);
        _this.animations.add("dig_s", mar.animationFrames.dig_s);
        _this.animations.add("dig_e", mar.animationFrames.dig_e);
        _this.animations.add("dig_n", mar.animationFrames.dig_n);
        _this.createUsername();
        _this.updateDirection();
        _this.tint = _this.getTint();
        return _this;
    }
    Cubot.prototype.onTileHover = function () {
        mar.game.add.tween(this).to({ isoZ: 45 }, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.game.add.tween(this.scale).to({ x: 1.2, y: 1.2 }, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotHoverTint;
        if (this.text !== undefined) {
            this.text.visible = true;
        }
        this.hovered = true;
    };
    Cubot.prototype.onTileExit = function () {
        mar.game.add.tween(this).to({ isoZ: 15 }, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
        if (this.text !== undefined) {
            this.text.visible = false;
        }
        this.hovered = false;
        this.tint = this.getTint();
    };
    Cubot.prototype.getTint = function () {
        if (!this.hovered) {
            if (this.energy <= config.lowEnergy) {
                return config.lowEnergyTint;
            }
            else {
                return config.cubotTint;
            }
        }
        else {
            return config.cubotHoverTint;
        }
    };
    Cubot.prototype.updateObject = function (json) {
        if (DEBUG) {
            console.log("Updating Cubot object");
        }
        this.action = json.action;
        this.energy = json.energy;
        this.direction = json.direction;
        //Update color
        this.tint = this.getTint();
        //Update Location
        if (!this.isAt(json.x, json.y)) {
            //Location changed
            if (this.action == Action.WALKING) {
                //Walking..
                this.tileX = json.x;
                this.tileY = json.y;
                this.walk();
            }
            else if (this.action == Action.JUMPING) {
                //TODO
            }
        }
        if (this.action == Action.DIGGING) {
            //TODO dig animation
        }
        this.updateDirection();
        this.updateHologram(json.holoMode, json.holoC, json.holo, json.holoStr);
    };
    Cubot.prototype.updateHologram = function (holoMode, holoColor, holoValue, holoStr) {
        //Create hologram if not exist, set style
        if (this.hologram == undefined) {
            this.hologram = mar.game.make.text(0, 32, "");
            this.hologram.anchor.set(0.5, 0);
            this.addChild(this.hologram);
            this.hologram.setStyle(config.holoStyle(holoColor));
        }
        else {
            this.hologram.setStyle(config.holoStyle(holoColor));
        }
        switch (holoMode) {
            case HologramMode.CLEARED:
                this.hologram.text = "";
                break;
            case HologramMode.DEC:
                this.hologram.text = Number(holoValue).toString();
                break;
            case HologramMode.HEX:
                this.hologram.text = "0x" + ("0000" + Number(holoValue).toString(16).toUpperCase()).slice(-4);
                break;
            case HologramMode.STRING:
                this.hologram.text = holoStr.replace(/[\n|\t]/g, '');
                break;
        }
    };
    /**
     * Set appropriate frame based on direction
     */
    Cubot.prototype.updateDirection = function () {
        switch (this.direction) {
            case Direction.NORTH:
                this.animations.frameName = "cubot/walk_n/0001";
                break;
            case Direction.EAST:
                this.animations.frameName = "cubot/walk_e/0001";
                break;
            case Direction.SOUTH:
                this.animations.frameName = "cubot/walk_s/0001";
                break;
            case Direction.WEST:
                this.animations.frameName = "cubot/walk_w/0001";
                break;
        }
    };
    /**
     * Initiate the walk animation. Handles multiple calls of this function even if the previous animations
     * were not completed
     */
    Cubot.prototype.walk = function () {
        var self = this;
        var walkAnimation = function (duration) {
            //Move the Cubot to desired tile
            var tween = mar.game.add.tween(self).to({ isoX: Util.getIsoX(self.tileX), isoY: Util.getIsoY(self.tileY) }, duration, Phaser.Easing.Linear.None, true);
            //Play appropriate animation
            switch (self.direction) {
                case Direction.NORTH:
                    self.animations.play("walk_n", 60, true);
                    break;
                case Direction.SOUTH:
                    self.animations.play("walk_s", 60, true);
                    break;
                case Direction.EAST:
                    self.animations.play("walk_e", 60, true);
                    break;
                case Direction.WEST:
                    self.animations.play("walk_w", 60, true);
                    break;
            }
            //When moved to destination,
            tween.onComplete.add(function () {
                self.animations.stop();
                self.updateDirection();
                //Resync position
                self.isoX = Util.getIsoX(self.tileX);
                self.isoY = Util.getIsoY(self.tileY);
                self.onTileExit();
                //Execute all the queued walk animations at a faster pace
                for (var i = 0; i < self.queuedAnimations.length; i++) {
                    self.queuedAnimations[i](config.walkDuration / 2);
                    self.queuedAnimations.splice(i, 1);
                }
            });
        };
        if (this.animations.currentAnim.isPlaying) {
            //Queue up the animation
            this.queuedAnimations.push(walkAnimation);
        }
        else {
            walkAnimation(config.walkDuration);
        }
    };
    /**
     * Create the username text that will appear on top of the Cubot. Text will have alternate
     * color when current username matches. This function is also responsable for setting the
     * reduced transparency of other Cubots
     */
    Cubot.prototype.createUsername = function () {
        var username = mar.game.make.text(0, -24, this.username, {
            fontSize: 22,
            fill: config.textFill,
            stroke: config.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });
        username.alpha = 0.85;
        username.anchor.set(0.5, 0);
        //Color own username
        if (this.username === mar.client.username) {
            username.tint = config.selfUsernameColor;
        }
        else {
            this.alpha = config.otherCubotAlpha;
        }
        this.addChild(username);
    };
    return Cubot;
}(GameObject));
var HarvesterNPC = (function (_super) {
    __extends(HarvesterNPC, _super);
    function HarvesterNPC(json) {
        var _this = _super.call(this, json) || this;
        _this.animations.add("walk_w", mar.animationFrames.harvester_walk_w);
        _this.animations.add("walk_s", mar.animationFrames.harvester_walk_s);
        _this.animations.add("walk_e", mar.animationFrames.harvester_walk_e);
        _this.animations.add("walk_n", mar.animationFrames.harvester_walk_n);
        _this.updateDirection();
        _this.setText("Harvester NPC");
        _this.text.visible = false;
        return _this;
    }
    /**
     * Needs to be overridden because Cubot() calls getTint() when initialised
     */
    HarvesterNPC.prototype.getTint = function () {
        return config.cubotTint;
    };
    HarvesterNPC.prototype.updateDirection = function () {
        switch (this.direction) {
            case Direction.NORTH:
                this.animations.frameName = "harvester/walk_n/0001";
                break;
            case Direction.EAST:
                this.animations.frameName = "harvester/walk_e/0001";
                break;
            case Direction.SOUTH:
                this.animations.frameName = "harvester/walk_s/0001";
                break;
            case Direction.WEST:
                this.animations.frameName = "harvester/walk_w/0001";
                break;
        }
    };
    HarvesterNPC.prototype.updateObject = function (json) {
        if (DEBUG) {
            console.log("Updating Harvester NPC object");
        }
        this.action = json.action;
        this.direction = json.direction;
        //Update Location
        if (!this.isAt(json.x, json.y)) {
            //Location changed
            if (this.action == Action.WALKING) {
                //Walking..
                this.tileX = json.x;
                this.tileY = json.y;
                this.walk();
            }
            else if (this.action == Action.JUMPING) {
                //TODO
            }
        }
        //Update Direction
        this.updateDirection();
    };
    HarvesterNPC.prototype.createUsername = function () {
        //No-op
    };
    return HarvesterNPC;
}(Cubot));
var BiomassBlob = (function (_super) {
    __extends(BiomassBlob, _super);
    function BiomassBlob(json) {
        var _this = _super.call(this, Util.getIsoX(json.x), Util.getIsoY(json.y), 10, "sheet", 1) || this;
        if (DEBUG) {
            console.log("Creating Biomass object");
        }
        _this.anchor.set(0.5, 0);
        _this.id = json.i;
        _this.tileX = json.x;
        _this.tileY = json.y;
        _this.tint = config.biomassTint;
        _this.animations.add("idle", mar.animationFrames.biomassIdle);
        _this.animations.play("idle", 45, true);
        _this.setText("Biomass");
        _this.text.visible = false;
        return _this;
    }
    BiomassBlob.prototype.onTileHover = function () {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({ isoZ: 45 }, 200, Phaser.Easing.Quadratic.InOut, true);
        this.tint = config.biomassHoverTint;
        mar.game.add.tween(this.scale).to({ x: 1.2, y: 1.2 }, 200, Phaser.Easing.Linear.None, true);
        this.text.visible = true;
    };
    BiomassBlob.prototype.onTileExit = function () {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({ isoZ: 15 }, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.biomassTint;
        this.text.visible = false;
    };
    BiomassBlob.prototype.updateObject = function (json) {
        if (DEBUG) {
            console.log("Updating Biomass object");
        }
    };
    return BiomassBlob;
}(GameObject));
var Factory = (function (_super) {
    __extends(Factory, _super);
    function Factory(json) {
        var _this = _super.call(this, Util.getIsoX(json.x), Util.getIsoY(json.y), 15, "sheet", "objects/factory") || this;
        _this.anchor.set(0.5, .25);
        _this.setText("Factory");
        _this.text.visible = false;
        _this.id = json.i;
        _this.tileX = json.x;
        _this.tileY = json.y;
        return _this;
    }
    Factory.prototype.onTileHover = function () {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({ isoZ: 25 }, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.game.add.tween(this.scale).to({ x: 1.06, y: 1.06 }, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotHoverTint;
        this.text.visible = true;
    };
    Factory.prototype.onTileExit = function () {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({ isoZ: 15 }, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotTint;
        this.text.visible = false;
    };
    Factory.prototype.updateObject = function (json) {
        //No op
    };
    Factory.prototype.isAt = function (x, y) {
        //Factory is 2x2
        return (this.tileX === x || this.tileX + 1 === x) && (this.tileY + 1 === y || this.tileY === y);
    };
    ;
    return Factory;
}(GameObject));
var RadioTower = (function (_super) {
    __extends(RadioTower, _super);
    function RadioTower(json) {
        var _this = _super.call(this, Util.getIsoX(json.x), Util.getIsoY(json.y), 15, "sheet", "objects/RadioTower") || this;
        _this.anchor.set(0.5, 0.64);
        _this.setText("Radio Tower");
        _this.text.visible = false;
        _this.id = json.i;
        _this.tileX = json.x;
        _this.tileY = json.y;
        return _this;
    }
    RadioTower.prototype.onTileHover = function () {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({ isoZ: 25 }, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.game.add.tween(this.scale).to({ x: 1.06, y: 1.06 }, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotHoverTint;
        this.text.visible = true;
    };
    RadioTower.prototype.onTileExit = function () {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({ isoZ: 15 }, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({ x: 1, y: 1 }, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotTint;
        this.text.visible = false;
    };
    RadioTower.prototype.updateObject = function (json) {
        //No op
    };
    return RadioTower;
}(GameObject));
