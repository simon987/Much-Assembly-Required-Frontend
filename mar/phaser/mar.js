///<reference path="phaser.plugin.isometric.d.ts"/>
///<reference path="phaser.d.ts"/>
// Typescript V2.4.1
var RENDERER_WIDTH = document.getElementById("game").clientWidth * window.devicePixelRatio;
var RENDERER_HEIGHT = (window.innerHeight / 1.40) * window.devicePixelRatio;
var DEBUG = true;
var config = {
    tileTint: 0xFFFFFF,
    wallTint: 0xDDDDDD,
    oreTint: 0xF3F3F3,
    worldSize: 16,
    cubotHoverTint: 0x00FF00,
    cubotTint: 0xFFFFFF,
    textFill: "#FFFFFF",
    textStroke: "#9298a8",
    biomassTint: 0x63B85F,
    biomassHoverTint: 0x00FF00,
    tileHoverTint: 0x00FF00,
    itemIron: 0x434341,
    textIron: "#434341",
    itemCopper: 0xC87D38,
    textCopper: "#C87D38",
    hologramFill: "#0aced6",
    hologramStroke: "#12FFB0",
    copperFill: "#C87D38",
    plainSprite: "tiles/tile",
    wallSprite: "tiles/bigTile",
    walkDuration: 800,
    holoStyle: function (fill) {
        return {
            fontSize: 32,
            fill: fill ? fill : config.hologramFill,
            stroke: config.hologramStroke,
            strokeThickness: 1,
            font: "fixedsys"
        };
    },
    kbBufferX: 225,
    kbBufferY: 20,
    arrowTextStyle: {
        fontSize: 32,
        fill: "#ffffff",
        stroke: "#9298a8",
        strokeThickness: 1,
        font: "fixedsys"
    },
    lowEnergy: 100,
    lowEnergyTint: 0xCC0000,
    bigMessageFill: "#ff803d",
    arrowTint: 0xFFFFFF,
    arrowHoverTint: 0x00FF00,
    selfUsernameColor: 0xFB4D0A,
    otherCubotAlpha: 0.6,
    defaultWorldSize: 16
};
var TileType;
(function (TileType) {
    TileType[TileType["PLAIN"] = 0] = "PLAIN";
    TileType[TileType["WALL"] = 1] = "WALL";
    TileType[TileType["IRON"] = 2] = "IRON";
    TileType[TileType["COPPER"] = 3] = "COPPER";
})(TileType || (TileType = {}));
var Util = (function () {
    function Util() {
    }
    //todo: find a more elegant way of doing this. Maybe this is related: https://github.com/lewster32/phaser-plugin-isometric/issues/7
    Util.getIsoY = function (y) {
        return Util.getIsoX(y);
    };
    Util.getIsoX = function (x) {
        return (x * 71.5);
    };
    Util.getDeltaX = function (direction) {
        switch (direction) {
            case Direction.NORTH:
            case Direction.SOUTH:
                return 0;
            case Direction.EAST:
                return 1;
            case Direction.WEST:
                return -1;
        }
    };
    Util.getDeltaY = function (direction) {
        switch (direction) {
            case Direction.EAST:
            case Direction.WEST:
                return 0;
            case Direction.NORTH:
                return 1;
            case Direction.SOUTH:
                return -1;
        }
    };
    return Util;
}());
var mar = new MarGame();
