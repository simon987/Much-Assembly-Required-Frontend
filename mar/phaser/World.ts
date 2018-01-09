///<reference path="GameClient.ts"/>

import instances = PIXI.instances;

enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST
}


class Tile extends Phaser.Plugin.Isometric.IsoSprite {

    /**
     * Text displayed on the tile
     */
    textSprite: Phaser.Text;
    baseTint: number;
    tileX: number;
    tileY: number;

    /**
     * Displayed on the screen
     */
    tileType: string;

    /**
     * Based z coordinate of the tile
     */
    private baseZ: number;

    public selected: boolean;

    protected constructor(x: number, y: number, sprite: string, anchorY: number) {

        super(mar.game, Util.getIsoX(x), Util.getIsoY(y), 0, 'sheet', sprite);

        this.baseZ = 0; //Base height of the tile

        this.tileX = x;
        this.tileY = y;

        this.anchor.set(0.5, anchorY);
    }

    /**
     * Factory method to create a Tile
     */
    public static createTile(type: TileType, x: number, y: number) {
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
    }

    public onHover() {
        this.tint = config.tileHoverTint;
        mar.game.add.tween(this).to({isoZ: this.baseZ + 8}, 200, Phaser.Easing.Quadratic.InOut, true);

        mar.tileIndicator.tileX = this.tileX;
        mar.tileIndicator.tileY = this.tileY;
        mar.tileIndicator.tileType = this.tileType;
    }

    public onExit() {
        this.tint = this.baseTint;
        mar.game.add.tween(this).to({isoZ: this.baseZ}, 200, Phaser.Easing.Quadratic.InOut, true);
    }

    public setText(text: string, fillColor: string): void {

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
    }
}

class PlainTile extends Tile {


    constructor(x: number, y: number) {
        super(x, y, config.plainSprite, 0);

        this.baseTint = config.tileTint;
        this.tint = this.baseTint;
        this.tileType = "plain";
    }
}

class WallTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, config.wallSprite, 0.2);

        this.baseTint = config.wallTint;
        this.tint = this.baseTint;
        this.tileType = "wall";

    }
}

class IronTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, config.plainSprite, 0);

        this.baseTint = config.oreTint;
        this.tint = this.baseTint;

        this.setText("Iron", config.textIron);
        this.tileType = "iron";
    }
}


class CopperTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, config.plainSprite, 0);

        this.baseTint = config.oreTint;
        this.tint = this.baseTint;

        this.setText("Copper", config.textCopper);
        this.tileType = "copper";
    }
}

class World {

    private tiles: Tile[] = [];
    private objects: GameObject[] = [];

    /**
     * Message displayed in the middle of the World
     */
    private bigMessage: Phaser.Text;

    constructor(terrain) {

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
    private setTerrain(terrain: number[]) {
        if (DEBUG) {
            console.log("[MAR] Creating tilemap");
        }

        for (let x = 0; x < config.worldSize; x++) {
            for (let y = 0; y < config.worldSize; y++) {

                let tile: Tile = Tile.createTile(terrain[y * config.worldSize + x], x, y);

                this.tiles.push(tile);
                mar.isoGroup.add(tile);

            }
        }
    }

    public setBigMessage(msg: string) {
        this.bigMessage = mar.game.add.text(908, 450, msg, {
            fontSize: 46,
            fill: config.bigMessageFill,
            stroke: config.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        }, mar.textGroup);
    }

    public removeBigMessage() {
        if (this.bigMessage != undefined) {
            this.bigMessage.destroy();

            if (DEBUG) {
                console.log("[MAR] Destroyed big message")
            }
        }
    }

    /**
     * Get object by id
     */
    private getObject(id: number): GameObject {

        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === id) {
                return this.objects[i];
            }
        }

        return null;
    }

    /**
     * Update, create or delete the current objects based on a list received from the server
     * @param objects json list of objects
     */
    public handleObjectsUpdate(objects: any) {

        //Mark objects as not updated
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].updated = false;
        }

        for (let i = 0; i < objects.length; i++) {

            //Update/Create the object
            let existingObject = this.getObject(objects[i].i);

            if (existingObject !== null) {
                //Object already exists
                existingObject.updated = true;
                existingObject.updateObject(objects[i]);

            } else {

                //Object is new
                let newObj = GameObject.createObject(objects[i]);
                if (newObj != null) {
                    newObj.updated = true;
                    this.objects.push(newObj);

                    mar.isoGroup.add(newObj);
                } else {
                    if (DEBUG) {
                        console.log("Couldn't create object with objType " + objects[i].t)
                    }
                }

            }
        }

        //Delete not updated objects (see above comments)
        for (let i = 0; i < this.objects.length; i++) {
            if (!this.objects[i].updated) {

                //Check if the object we are removing is our controlledUnit, if so, follow it
                if (mar.client.username !== "guest") {
                    if (this.objects[i] instanceof Cubot && (this.objects[i] as Cubot).username === mar.client.username) {
                        mar.client.findMyRobot();
                        if (DEBUG) {
                            console.log("[MAR] Following Cubot " + mar.client.username)
                        }
                    }
                }

                this.objects[i].destroy();
                this.objects.splice(i, 1);
            }
        }

    }

    /**
     * Delete current ojects and tiles and replace them with provided terrain
     * @param terrain
     */
    public updateTerrain(terrain: number[]) {

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
        }

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].destroy();
        }
        this.objects = [];
        this.tiles = [];

        this.setTerrain(terrain);
        mar.game.iso.topologicalSort(mar.isoGroup);
    }
}

/**
 * Represents a 'button' sprite that changes world in a direction
 */
class WorldArrow extends Phaser.Plugin.Isometric.IsoSprite {

    private hoverText: Phaser.Text;

    constructor(x: number, y: number, frame: string, direction: Direction) {
        super(mar.game, x, y, 10, "sheet", frame);

        let self = this;

        this.hoverText = mar.game.make.text(10, 10, Direction[direction], config.arrowTextStyle);
        this.addChild(this.hoverText);
        this.hoverText.visible = false;
        this.hoverText.anchor.set(0, 0);

        this.inputEnabled = true;
        this.events.onInputDown.add(function () {

            let newX = mar.client.worldX + Util.getDeltaX(direction);
            let newY = mar.client.worldY + Util.getDeltaY(direction);

            //Wrapping coordinates around cyclically
            mar.client.worldX = newX % mar.client.maxWidth;
            mar.client.worldY = newY % mar.client.maxWidth;

            mar.client.requestTerrain();
        });

        this.events.onInputOver.add(function () {
            self.tint = config.arrowHoverTint;
            self.hoverText.visible = true;
            document.body.style.cursor = "pointer";
        });

        this.events.onInputOut.add(function () {
            self.tint = config.arrowTint;
            self.hoverText.visible = false;
            document.body.style.cursor = "default";
        });
    }

}