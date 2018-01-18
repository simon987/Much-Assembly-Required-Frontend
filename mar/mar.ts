// Typescript V2.4.1

let RENDERER_WIDTH = document.getElementById("game").clientWidth * window.devicePixelRatio;
let RENDERER_HEIGHT = (window.innerHeight / 1.40) * window.devicePixelRatio;

let DEBUG: boolean = true;

let config = {
    tileTint: 0xFFFFFF,
    wallTint: 0xDDDDDD,
    oreTint: 0xF3F3F3,
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
    walkDuration: 800, //walk animation duration in ms
    holoStyle: (fill) => {
        return {
            fontSize: 32,
            fill: fill ? fill : config.hologramFill,
            stroke: config.hologramStroke,
            strokeThickness: 1,
            font: "fixedsys"
        }
    },
    kbBufferX: 225, ///Position of the keyboard buffer fill on screen
    kbBufferY: 20,
    arrowTextStyle: {
        fontSize: 32,
        fill: "#ffffff",
        stroke: "#9298a8",
        strokeThickness: 1,
        font: "fixedsys"
    },
    lowEnergy: 100, //Low energy threshold to change color
    lowEnergyTint: 0xCC0000,
    bigMessageFill: "#ff803d",
    arrowTint: 0xFFFFFF,
    arrowHoverTint: 0x00FF00,
    selfUsernameColor: 0xFB4D0A, //Color of own Cubot's username.
    otherCubotAlpha: 0.6,
    defaultWorldSize: 16 //Will fallback to this when server does not provide world width

};


class Util {

    //todo: find a more elegant way of doing this. Maybe this is related: https://github.com/lewster32/phaser-plugin-isometric/issues/7
    static getIsoY(y: number) {
        return Util.getIsoX(y);
    }

    static getIsoX(x: number) {
        return (x * 71.5)
    }

    static getDeltaX(direction: Direction) {
        switch (direction) {
            case Direction.NORTH:
            case Direction.SOUTH:
                return 0;
            case Direction.EAST:
                return 1;
            case Direction.WEST:
                return -1;
        }
    }

    static getDeltaY(direction: Direction) {

        switch (direction) {
            case Direction.EAST:
            case Direction.WEST:
                return 0;
            case Direction.NORTH:
                return 1;
            case Direction.SOUTH:
                return -1;
        }

    }
}

let mar = new MarGame();

var myVarX = 0.46;
var myVarY = 0.46;