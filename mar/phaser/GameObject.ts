enum ObjectType {
    CUBOT = 1,
    BIOMASS = 2,
    HARVESTER_NPC = 10,
    FACTORY = 3,
    RADIO_TOWER = 4
}

enum ItemType {
    BIOMASS = 1,
    IRON = 3,
    COPPER = 4
}

enum Action {
    IDLE,
    DIGGING,
    WALKING,
    WITHDRAWING,
    DEPOSITING,
    LISTENING,
    JUMPING
}

abstract class GameObject extends Phaser.Plugin.Isometric.IsoSprite {

    public tileX: number;
    public tileY: number;

    id: number;
    protected direction: Direction;
    protected action: Action;

    public updated: boolean;

    protected text: Phaser.Text;


    constructor(x: number, y: number, z: number, key: any, frame: any) {
        super(mar.game, x, y, z, key, frame);
    }

    public abstract updateObject(json): void;

    public abstract onTileHover(): void;

    public abstract onTileExit(): void;

    /**
     * Factory method for GameObjects
     */
    public static createObject(json): GameObject {
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
    }

    /**
     * Set text that will appear on top of the object. Usually used for hover text
     */
    protected setText(text: string): void {
        this.text = mar.game.make.text(0, 0, text, {
            fontSize: 22,
            fill: config.textFill,
            stroke: config.textStroke,
            strokeThickness: 2,
            font: "fixedsys"
        });

        this.text.anchor.set(0.5, 0);
        this.addChild(this.text);

    }

    /**
     * Tested to trigger onTileHover and onTileExit
     */
    public isAt(x: number, y: number): boolean {
        return x == this.tileX && y == this.tileY;
    }

}

enum HologramMode {
    CLEARED,
    HEX,
    STRING,
    DEC
}

class Cubot extends GameObject {

    username: string;
    heldItem: ItemType;
    energy: number;

    private hologram: Phaser.Text;

    /**
     * List of animation functions queued for execution.
     */
    queuedAnimations = [];

    private hovered: boolean = false;

    constructor(json) {
        super(Util.getIsoX(json.x), Util.getIsoY(json.y), 15, "sheet", null);

        if (DEBUG) {
            console.log("Creating Cubot object");
        }

        this.anchor.set(0.5, 0);
        this.id = json.i;
        this.tileX = json.x;
        this.tileY = json.y;

        this.username = json.parent;
        this.heldItem = json.heldItem;
        this.direction = json.direction;
        this.action = json.action;
        this.energy = json.energy;

        this.animations.add("walk_w", mar.animationFrames.walk_w);
        this.animations.add("walk_s", mar.animationFrames.walk_s,);
        this.animations.add("walk_e", mar.animationFrames.walk_e);
        this.animations.add("walk_n", mar.animationFrames.walk_n);
        this.animations.add("dig_w", mar.animationFrames.dig_w);
        this.animations.add("dig_s", mar.animationFrames.dig_s);
        this.animations.add("dig_e", mar.animationFrames.dig_e);
        this.animations.add("dig_n", mar.animationFrames.dig_n);

        this.createUsername();
        this.updateDirection();

        this.tint = this.getTint();
    }

    onTileHover(): void {

        mar.game.add.tween(this).to({isoZ: 45}, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 200, Phaser.Easing.Linear.None, true);

        this.tint = config.cubotHoverTint;

        if (this.text !== undefined) {
            this.text.visible = true;
        }

        this.hovered = true;
    }


    onTileExit(): void {
        mar.game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);


        if (this.text !== undefined) {
            this.text.visible = false;
        }
        this.hovered = false;
        this.tint = this.getTint();

    }

    public getTint(): number {
        if (!this.hovered) {
            if (this.energy <= config.lowEnergy) {
                return config.lowEnergyTint;
            } else {
                return config.cubotTint;
            }
        } else {
            return config.cubotHoverTint;
        }
    }

    updateObject(json): void {

        if (DEBUG) {
            console.log("Updating Cubot object")
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

            } else if (this.action == Action.JUMPING) {
                //TODO
            }
        }

        if (this.action == Action.DIGGING) {
            //TODO dig animation
        }

        this.updateDirection();
        this.updateHologram(json.holoMode, json.holoC, json.holo, json.holoStr);
    }

    private updateHologram(holoMode: HologramMode, holoColor: number, holoValue: number, holoStr: string): void {

        //Create hologram if not exist, set style
        if (this.hologram == undefined) {
            this.hologram = mar.game.make.text(0, 32, "");
            this.hologram.anchor.set(0.5, 0);
            this.addChild(this.hologram);
            this.hologram.setStyle(config.holoStyle(holoColor));
        } else {
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
    }

    /**
     * Set appropriate frame based on direction
     */
    public updateDirection() {
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
    }

    /**
     * Initiate the walk animation. Handles multiple calls of this function even if the previous animations
     * were not completed
     */
    public walk() {

        let self = this;
        let walkAnimation = function (duration) {
            //Move the Cubot to desired tile
            let tween = mar.game.add.tween(self).to({isoX: Util.getIsoX(self.tileX), isoY: Util.getIsoY(self.tileY)},
                duration, Phaser.Easing.Linear.None, true);

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
                for (let i = 0; i < self.queuedAnimations.length; i++) {
                    self.queuedAnimations[i](config.walkDuration / 2);
                    self.queuedAnimations.splice(i, 1)
                }
            });

        };

        if (this.animations.currentAnim.isPlaying) {
            //Queue up the animation
            this.queuedAnimations.push(walkAnimation);

        } else {
            walkAnimation(config.walkDuration);
        }


    }

    /**
     * Create the username text that will appear on top of the Cubot. Text will have alternate
     * color when current username matches. This function is also responsable for setting the
     * reduced transparency of other Cubots
     */
    public createUsername() {
        let username = mar.game.make.text(0, -24, this.username, {
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
        } else {
            this.alpha = config.otherCubotAlpha;
        }
        this.addChild(username);
    }
}

class HarvesterNPC extends Cubot {

    constructor(json) {
        super(json);

        this.animations.add("walk_w", mar.animationFrames.harvester_walk_w);
        this.animations.add("walk_s", mar.animationFrames.harvester_walk_s);
        this.animations.add("walk_e", mar.animationFrames.harvester_walk_e);
        this.animations.add("walk_n", mar.animationFrames.harvester_walk_n);

        this.updateDirection();
        this.setText("Harvester NPC");
        this.text.visible = false;

    }

    /**
     * Needs to be overridden because Cubot() calls getTint() when initialised
     */
    public getTint() {
        return config.cubotTint;
    }

    public updateDirection() {
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
    }

    updateObject(json) {
        if (DEBUG) {
            console.log("Updating Harvester NPC object")
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

            } else if (this.action == Action.JUMPING) {
                //TODO
            }
        }

        //Update Direction
        this.updateDirection();
    }

    public createUsername() {
        //No-op
    }

}


class BiomassBlob extends GameObject {

    onTileHover() {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({isoZ: 45}, 200, Phaser.Easing.Quadratic.InOut, true);
        this.tint = config.biomassHoverTint;
        mar.game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 200, Phaser.Easing.Linear.None, true);

        this.text.visible = true;
    }


    onTileExit() {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.biomassTint;

        this.text.visible = false;
    }

    updateObject(json) {
        if (DEBUG) {
            console.log("Updating Biomass object")
        }
    }


    constructor(json) {
        super(Util.getIsoX(json.x), Util.getIsoY(json.y), 10, "sheet", 1);

        if (DEBUG) {
            console.log("Creating Biomass object")
        }

        this.anchor.set(0.5, 0);
        this.id = json.i;
        this.tileX = json.x;
        this.tileY = json.y;

        this.tint = config.biomassTint;

        this.animations.add("idle", mar.animationFrames.biomassIdle);
        this.animations.play("idle", 45, true);

        this.setText("Biomass");
        this.text.visible = false;

    }
}

class Factory extends GameObject {


    public onTileHover() {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({isoZ: 25}, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.game.add.tween(this.scale).to({x: 1.06, y: 1.06}, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotHoverTint;

        this.text.visible = true;
    }

    public onTileExit() {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotTint;

        this.text.visible = false;
    }

    public updateObject(json) {
        //No op
    }

    public isAt(x: number, y: number) {
        //Factory is 2x2
        return (this.tileX === x || this.tileX + 1 === x) && (this.tileY + 1 === y || this.tileY === y);
    };


    constructor(json) {
        super(Util.getIsoX(json.x), Util.getIsoY(json.y), 15, "sheet", "objects/factory");

        this.anchor.set(0.5, .25);
        this.setText("Factory");
        this.text.visible = false;

        this.id = json.i;
        this.tileX = json.x;
        this.tileY = json.y;
    }
}

class RadioTower extends GameObject {


    public onTileHover() {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({isoZ: 25}, 200, Phaser.Easing.Quadratic.InOut, true);
        mar.game.add.tween(this.scale).to({x: 1.06, y: 1.06}, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotHoverTint;

        this.text.visible = true;
    }

    public onTileExit() {
        mar.game.tweens.removeFrom(this);
        mar.game.add.tween(this).to({isoZ: 15}, 400, Phaser.Easing.Bounce.Out, true);
        mar.game.add.tween(this.scale).to({x: 1, y: 1}, 200, Phaser.Easing.Linear.None, true);
        this.tint = config.cubotTint;

        this.text.visible = false;
    }

    public updateObject(json) {
        //No op
    }

    constructor(json) {
        super(Util.getIsoX(json.x), Util.getIsoY(json.y), 15, "sheet", "objects/RadioTower");

        this.anchor.set(0.5, 0.64);
        this.setText("Radio Tower");
        this.text.visible = false;

        this.id = json.i;
        this.tileX = json.x;
        this.tileY = json.y;
    }
}