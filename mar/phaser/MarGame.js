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
var MarGame = (function () {
    function MarGame() {
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();
        this.debugMessages = [];
        this.animationFrames = {};
        var self = this;
        this.game = new Phaser.Game(RENDERER_WIDTH, RENDERER_HEIGHT, Phaser.AUTO, 'game', null, true, false);
        this.bootState = {
            preload: function () {
                if (DEBUG) {
                    console.log("[MAR] Loading sprites.png as JSONHash");
                }
                this.game.load.atlasJSONHash("sheet", "./mar/sprites.png", "./mar/sprites.json").onLoadComplete.add(function () {
                    self.game.time.advancedTiming = true;
                    //Add and enable the isometric plug-in.
                    if (DEBUG) {
                        console.log("[MAR] Enabling isometric plugin");
                    }
                    self.game.plugins.add(new Phaser.Plugin.Isometric(self.game));
                    // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
                    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
                    self.game.iso.anchor.setTo(0.5, 0);
                    //Todo: set world size based on window size?
                    self.game.world.setBounds(0, 0, 2200, 1100);
                    //Make camera more or less centered (tested on 1080 screen)
                    self.game.camera.x = 280;
                    self.game.camera.y = 90;
                    self.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
                    self.game.scale.pageAlignHorizontally = true;
                    self.game.scale.pageAlignVertically = true;
                    self.game.stage.disableVisibilityChange = true;
                    self.client = new GameClient();
                    //Grab focus when clicked (For chrome, Opera)
                    self.game.input.onDown.add(function () {
                        document.getElementById("game").focus();
                        if (DEBUG) {
                            console.log("Grabbed focus of #game");
                        }
                    });
                    self.isoGroup = mar.game.add.group();
                    self.textGroup = mar.game.add.group();
                    self.hudGroup = mar.game.add.group();
                    self.hudGroup.fixedToCamera = true;
                });
            },
            create: function () {
                console.log("[MAR] create");
                self.initialiseAnimations();
                self.initialiseStaticHud();
            },
            update: function () {
                self.game.scale.refresh();
                // Update the cursor position.
                self.game.iso.unproject(self.game.input.activePointer.position, self.cursorPos);
                // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
                self.isoGroup.forEach(function (tile) {
                    if (tile instanceof Tile) {
                        var inBounds = tile.isoBounds.containsXY(self.cursorPos.x, self.cursorPos.y);
                        // If it does, do a little animation and tint change.
                        if (!tile.selected && inBounds) {
                            tile.selected = true;
                            tile.onHover();
                            //Dispatch tile over
                            self.isoGroup.forEach(function (obj) {
                                if (obj instanceof GameObject && obj.onTileHover != undefined && obj.isAt(tile.tileX, tile.tileY)) {
                                    obj.onTileHover();
                                }
                            }, 1);
                        }
                        else if (tile.selected && !inBounds) {
                            tile.selected = false;
                            tile.onExit();
                            //Dispatch tile exit
                            self.isoGroup.forEach(function (obj) {
                                if (obj.onTileExit != undefined && obj.isAt(tile.tileX, tile.tileY)) {
                                    obj.onTileExit();
                                }
                            }, 0);
                        }
                    }
                }, 0);
                //Enable dragging the camera
                if (this.game.input.activePointer.isDown) {
                    if (this.game.origDragPoint) {
                        // move the camera by the amount the mouse has moved since last update
                        this.game.camera.x += this.game.origDragPoint.x - this.game.input.activePointer.position.x;
                        this.game.camera.y += this.game.origDragPoint.y - this.game.input.activePointer.position.y;
                    }
                    // set new drag origin to current position
                    this.game.origDragPoint = this.game.input.activePointer.position.clone();
                }
                else {
                    this.game.origDragPoint = null;
                }
                self.game.iso.topologicalSort(self.isoGroup);
            },
            render: function () {
                for (var i = 0; i < self.debugMessages.length; i++) {
                    self.game.debug.text(self.debugMessages[i].getMessage(), self.debugMessages[i].x, self.debugMessages[i].y);
                }
            }
        };
        this.game.state.add('Boot', this.bootState);
        this.game.state.start('Boot');
    }
    MarGame.prototype.addDebugMessage = function (debugMsg) {
        this.debugMessages.push(debugMsg);
    };
    MarGame.prototype.initialiseAnimations = function () {
        //Walk =-------------------------------------------------------
        //East
        this.animationFrames.walk_e_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.walk_e_start.push("cubot/walk_e/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.walk_e = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.walk_e.push("cubot/walk_e/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_e_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.harvester_walk_e_start.push("harvester/walk_e/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_e = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.harvester_walk_e.push("harvester/walk_e/" + ("0000" + i).slice(-4));
        }
        //North
        this.animationFrames.walk_n_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.walk_n_start.push("cubot/walk_n/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.walk_n = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.walk_n.push("cubot/walk_n/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_n_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.harvester_walk_n_start.push("harvester/walk_n/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_n = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.harvester_walk_n.push("harvester/walk_n/" + ("0000" + i).slice(-4));
        }
        //South
        this.animationFrames.walk_s_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.walk_s_start.push("cubot/walk_s/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.walk_s = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.walk_s.push("cubot/walk_s/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_s_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.harvester_walk_s_start.push("harvester/walk_s/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_s = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.harvester_walk_s.push("harvester/walk_s/" + ("0000" + i).slice(-4));
        }
        //West
        this.animationFrames.walk_w_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.walk_w_start.push("cubot/walk_w/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.walk_w = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.walk_w.push("cubot/walk_w/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_w_start = [];
        for (var i = 0; i < 10; i++) {
            this.animationFrames.harvester_walk_w_start.push("harvester/walk_w/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.harvester_walk_w = [];
        for (var i = 10; i < 30; i++) {
            this.animationFrames.harvester_walk_w.push("harvester/walk_w/" + ("0000" + i).slice(-4));
        }
        //Dig =-------------------------------------------------------
        this.animationFrames.dig_e = [];
        for (var i = 1; i <= 41; i++) {
            this.animationFrames.dig_e.push("cubot/dig_e/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.dig_n = [];
        for (var i = 1; i <= 41; i++) {
            this.animationFrames.dig_n.push("cubot/dig_n/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.dig_s = [];
        for (var i = 1; i <= 41; i++) {
            this.animationFrames.dig_s.push("cubot/dig_s/" + ("0000" + i).slice(-4));
        }
        this.animationFrames.dig_w = [];
        for (var i = 1; i <= 41; i++) {
            this.animationFrames.dig_w.push("cubot/dig_w/" + ("0000" + i).slice(-4));
        }
        //Biomass =-------------------------------------------------------
        this.animationFrames.biomassIdle = [];
        for (var i = 1; i < 60; i++) {
            this.animationFrames.biomassIdle.push("objects/biomass/idle/" + ("0000" + i).slice(-4));
        }
    };
    MarGame.prototype.initialiseStaticHud = function () {
        this.game.add.sprite(0, this.game.camera.height - 150, "sheet", "ui/compass", this.hudGroup);
        this.addDebugMessage(new WorldIndicator(10, 20));
        this.tileIndicator = new TileIndicator(10, 40);
        this.addDebugMessage(this.tileIndicator);
    };
    return MarGame;
}());
var DebugMessage = (function () {
    function DebugMessage(x, y) {
        this.x = x;
        this.y = y;
    }
    return DebugMessage;
}());
var TileIndicator = (function (_super) {
    __extends(TileIndicator, _super);
    function TileIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TileIndicator.prototype.getMessage = function () {
        if (this.tileType != undefined) {
            return this.tileX + ", " + this.tileY + " : " + this.tileType;
        }
        else {
            return "";
        }
    };
    return TileIndicator;
}(DebugMessage));
var WorldIndicator = (function (_super) {
    __extends(WorldIndicator, _super);
    function WorldIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WorldIndicator.prototype.getMessage = function () {
        if (mar.world != undefined) {
            return "World: (" + Number(mar.client.worldX).toString(16).toUpperCase() + ", " +
                Number(mar.client.worldY).toString(16).toUpperCase() + ")";
        }
        else {
            return "Loading...";
        }
    };
    return WorldIndicator;
}(DebugMessage));
