"use strict";


var MAR = {

    RENDERER_BG: 0x282828,
    currentLocX: 0,
    currentLocY: 0,
    effects: [],
    tiles: [],
    objects: []
};

if (fullscreen) {
    MAR.RENDERER_WIDTH = window.innerWidth - 4;
    MAR.RENDERER_HEIGHT = window.innerHeight - 4;
} else {
    MAR.RENDERER_WIDTH = document.getElementById("game").clientWidth;
    MAR.RENDERER_HEIGHT = (window.innerHeight / 1.25);
}

// --------------------------
// Load Sprites
PIXI.loader
    .add("./mar/sprites/cubot.json")
    .add("biomass", "./mar/sprites/biomass.png")
    .add("rocket", "./mar/sprites/rocket.png")
    .add("kiln", "./mar/sprites/kiln.png")
    .add("digester", "./mar/sprites/digester.png")
    .add("arrow_north", "./mar/sprites/arrow_north.png")
    .add("arrow_north_s", "./mar/sprites/arrow_north_s.png")
    .add("arrow_west", "./mar/sprites/arrow_west.png")
    .add("arrow_west_s", "./mar/sprites/arrow_west_s.png")
    .add("arrow_south", "./mar/sprites/arrow_south.png")
    .add("arrow_south_s", "./mar/sprites/arrow_south_s.png")
    .add("arrow_east", "./mar/sprites/arrow_east.png")
    .add("arrow_east_s", "./mar/sprites/arrow_east_s.png")
    .add("plain", "./mar/sprites/sample.png")
    .add("tile_iron", "./mar/sprites/tile_iron.png")
    .add("tile_copper", "./mar/sprites/tile_copper.png")
    .add("plain_s", "./mar/sprites/Tile_iso_selected.png")
    .add("wall", "./mar/sprites/Tile_iso _wall.png")
    .add("wall_s", "./mar/sprites/Tile_iso _wall_s.png")

    .add("GOURD_PLANT", "./mar/sprites/GOURD_PLANT.png")
    .add("GOURD_PLANT_s", "./mar/sprites/GOURD_PLANT_s.png")
    .add("LETTUCE_PLANT", "./mar/sprites/LETTUCE_PLANT.png")
    .add("LETTUCE_PLANT_s", "./mar/sprites/LETTUCE_PLANT_s.png")
    .add("OAK_TREE", "./mar/sprites/OAK_TREE.png")
    .add("egg", "./mar/sprites/egg.png")

    .add("plant1", "./mar/sprites/plant1.png")

    .add("err_icon", "./mar/sprites/err_icon.png")
    .add("warn_icon", "./mar/sprites/warn_icon.png")
    .add("A_icon", "./mar/sprites/A_icon.png");

PIXI.loader
    .on("progress", progressHandler)
    .load(loaderCallback);


// --------------------------
// Handle progress change event
function progressHandler(loader, resource) {
    //TODO - implement loading bar
}

// --------------------------
// Loader callback (Setup)
function loaderCallback() {
    setupRenderer();
    setupBackground();
    // setupKeyBoard();
    setupWorldLayer();
    setupAutoUpdate();
    setupDebugText();


    setupCallback();
}

function addToWorldLayer(sprite) {
    MAR.worldLayer.addChild(sprite);
    MAR.worldLayer.children.sort(depthCompare);
}

// --------------------------
// Compare depth of two sprites based on their z property
function depthCompare(a, b) {
    if (a.z < b.z) {
        return -1;
    }
    if (a.z > b.z) {
        return 1;
    }
    return 0;
}

function setupDebugText() {
    MAR.textLayer = new PIXI.Container();
    MAR.rootContainer.addChild(MAR.textLayer);

    //Debug text
    MAR.currentTileText = new PIXI.Text("", {fontSize: 12, fontFamily: "c64_mono", fill: "white"});
    MAR.currentTileText.position.x = MAR.RENDERER_WIDTH - 100;
    MAR.currentTileText.position.y = 10;
    MAR.textLayer.addChild(MAR.currentTileText);

    MAR.currentWorldText = new PIXI.Text("World 0,0", {fontSize: 12, fontFamily: "c64_mono", fill: "white"});
    MAR.currentWorldText.position.x = MAR.RENDERER_WIDTH - 150;
    MAR.currentWorldText.position.y = 100;
    MAR.textLayer.addChild(MAR.currentWorldText);

    MAR.timeText = new PIXI.Text("gameTime: 0", {fontSize: 12, fontFamily: "c64_mono", fill: "white"});
    MAR.timeText.position.x = MAR.RENDERER_WIDTH - 200;
    MAR.timeText.position.y = 70;
    MAR.textLayer.addChild(MAR.timeText);

    //  Watermark
    MAR.watermark = new PIXI.Text("Much Assembly Required V3.0", {fontSize: 20, fontFamily: "c64_mono", fill: "grey"});
    MAR.watermark.position.x = MAR.RENDERER_WIDTH - 450;
    MAR.watermark.position.y = MAR.RENDERER_HEIGHT - 30;
    MAR.textLayer.addChild(MAR.watermark)
}

function setupAutoUpdate() {
    window.setInterval(function () {
        getGameTime();

        if (MAR.timeChanged) {
            tick();
        }
    }, 334);
}

function setupWorldLayer() {
    MAR.worldLayer = new PIXI.Container();
    MAR.worldLayer.x = 736;
    MAR.worldLayer.y = -32;
    MAR.rootContainer.addChild(MAR.worldLayer);

    //NORTH
    var arrow_north = new PIXI.Sprite(PIXI.loader.resources["arrow_north"].texture);
    arrow_north.x = 528;
    arrow_north.y = 224;
    arrow_north.interactive = true;
    arrow_north.buttonMode = true;
    arrow_north.on("pointerover", function () {
        arrow_north.texture = PIXI.loader.resources["arrow_north_s"].texture;
    });
    arrow_north.on("pointerout", function () {
        arrow_north.texture = PIXI.loader.resources["arrow_north"].texture;
    });
    arrow_north.on("pointerdown", function () {
        clearWorldLayer();
        MAR.currentLocY--;
        getWorldTerrain();
        getGameObjects();
        updateCurrentWorldText();
    });
    MAR.worldLayer.addChild(arrow_north);

    //EAST
    var arrow_east = new PIXI.Sprite(PIXI.loader.resources["arrow_east"].texture);
    arrow_east.x = 528;
    arrow_east.y = 750;
    arrow_east.interactive = true;
    arrow_east.buttonMode = true;
    arrow_east.on("pointerover", function () {
        arrow_east.texture = PIXI.loader.resources["arrow_east_s"].texture;
    });
    arrow_east.on("pointerout", function () {
        arrow_east.texture = PIXI.loader.resources["arrow_east"].texture;
    });
    arrow_east.on("pointerdown", function () {
        clearWorldLayer();
        MAR.currentLocX++;
        getWorldTerrain();
        getGameObjects();
        updateCurrentWorldText();
    });
    MAR.worldLayer.addChild(arrow_east);

    //SOUTH
    var arrow_south = new PIXI.Sprite(PIXI.loader.resources["arrow_south"].texture);
    arrow_south.x = -496;
    arrow_south.y = 750;
    arrow_south.interactive = true;
    arrow_south.buttonMode = true;
    arrow_south.on("pointerover", function () {
        arrow_south.texture = PIXI.loader.resources["arrow_south_s"].texture;
    });
    arrow_south.on("pointerout", function () {
        arrow_south.texture = PIXI.loader.resources["arrow_south"].texture;
    });
    arrow_south.on("pointerdown", function () {
        clearWorldLayer();
        MAR.currentLocY++;
        getWorldTerrain();
        getGameObjects();
        updateCurrentWorldText();
    });
    MAR.worldLayer.addChild(arrow_south);

    //WEST
    var arrow_west = new PIXI.Sprite(PIXI.loader.resources["arrow_west"].texture);
    arrow_west.x = -496;
    arrow_west.y = 224;
    arrow_west.interactive = true;
    arrow_west.buttonMode = true;
    arrow_west.on("pointerover", function () {
        arrow_west.texture = PIXI.loader.resources["arrow_west_s"].texture;
    });
    arrow_west.on("pointerout", function () {
        arrow_west.texture = PIXI.loader.resources["arrow_west"].texture;
    });
    arrow_west.on("pointerdown", function () {
        clearWorldLayer();
        MAR.currentLocX--;
        getWorldTerrain();
        getGameObjects();
        updateCurrentWorldText();
    });
    MAR.worldLayer.addChild(arrow_west)
}

function clearWorldLayer() {
    for (var i = 0; i < MAR.tiles.length; i++) {
        MAR.worldLayer.removeChild(MAR.tiles[i].sprite);
    }

    for (var j = 0; j < MAR.objects.length; j++) {
        MAR.worldLayer.removeChild(MAR.objects[j].sprite);

        if (MAR.objects[j].indicator !== undefined) {
            MAR.worldLayer.removeChild(MAR.objects[j].indicator.sprite);
        }
        //todo Remove inv indicator as well
    }

    MAR.objects = [];
    MAR.tiles = [];
}

function updateCurrentWorldText() {
    MAR.currentWorldText.text = MAR.currentLocX + "," + MAR.currentLocY;
}

function setupKeyBoard() {
    //SETUP KEYBOARD LISTENERS
    // var leftArrow = keyboard(37);
    // var rightArrow = keyboard(39);
    var downArrow = keyboard(40);
    var upArrow = keyboard(38);

    downArrow.press = function () {

        MAR.worldLayer.scale.x -= 0.1;
        MAR.worldLayer.scale.y -= 0.1;

    };

    upArrow.press = function () {

        MAR.worldLayer.scale.x += 0.1;
        MAR.worldLayer.scale.y += 0.1;
    }
}

function setupBackground() {
    //SETUP BACKGROUND LAYER & PANNING
    MAR.bgLayer = new PIXI.Container();
    MAR.rootContainer.addChild(MAR.bgLayer);
    MAR.bg = new PIXI.Sprite();
    MAR.bg.interactive = true;
    MAR.bg.hitArea = new PIXI.Rectangle(0, 0, MAR.RENDERER_WIDTH, MAR.RENDERER_HEIGHT);
    MAR.bg.on("pointerover", function () {
        MAR.currentTileText.text = "-";
    });
    MAR.bg.on("pointerdown", function (e) {
        MAR.pointerdown = true;
        MAR.pointerFirstClick = e.data.getLocalPosition(MAR.rootContainer);
    });
    MAR.bg.on("pointerup", function () {
        MAR.pointerdown = false;
        MAR.pointerLastDrag = null;
    });
    MAR.bg.on("pointerupoutside", function () {
        MAR.pointerdown = false;
        MAR.pointerLastDrag = null;
    });
    MAR.bg.on("pointermove", function (e) {
        if (MAR.pointerdown === true) {

            var currentMouse = e.data.getLocalPosition(MAR.rootContainer);

            if (MAR.pointerLastDrag != null) {
                MAR.worldLayer.position.x += currentMouse.x - MAR.pointerLastDrag.x;
                MAR.worldLayer.position.y += currentMouse.y - MAR.pointerLastDrag.y;
            } else {
                MAR.worldLayer.position.x += currentMouse.x - MAR.pointerFirstClick.x;
                MAR.worldLayer.position.y += currentMouse.y - MAR.pointerFirstClick.y;
            }

            MAR.pointerLastDrag = currentMouse;
        }
    });
    MAR.bgLayer.addChild(MAR.bg);
}

function setupRenderer() {
    MAR.renderer = PIXI.autoDetectRenderer(256, 256);
    document.getElementById("game").appendChild(MAR.renderer.view);
    MAR.rootContainer = new PIXI.Container();
    MAR.renderer.backgroundColor = MAR.RENDERER_BG;
    MAR.renderer.resize(MAR.RENDERER_WIDTH, MAR.RENDERER_HEIGHT);


    window.onresize = function (event) {
        if (fullscreen) {
            MAR.RENDERER_WIDTH = window.innerWidth - 4;
            MAR.RENDERER_HEIGHT = window.innerHeight - 4;
        } else {
            MAR.RENDERER_WIDTH = document.getElementById("game").clientWidth;
            MAR.RENDERER_HEIGHT = (window.innerHeight / 1.25);
        }

        MAR.renderer.resize(MAR.RENDERER_WIDTH, MAR.RENDERER_HEIGHT);
    }

}

// --------------------------
//From https://github.com/kittykatattack/learningPixi#keyboard
function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    //The downHandler
    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The upHandler
    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}


// --------------------------
// Classes

// Particle effect
function ParticleEffect(x, y, bp) {
    this.x = x;
    this.y = y;
    this.bluePrint = bp;
    this.framesLeft = bp.framesCount;

}

ParticleEffect.prototype.graphics = new PIXI.Graphics();
ParticleEffect.prototype.particles = [];
ParticleEffect.prototype.update = function () {

    this.graphics.clear();
    this.framesLeft--;

    //Add new particles
    while (this.particles.length < this.bluePrint.particleCount && this.framesLeft > 0) {
        this.particles.push(this.bluePrint.createParticle(this.x, this.y));
    }

    //Draw & update particles
    for (var i = 0; i < this.particles.length; i++) {

        var p = this.particles[i];

        var g = this.graphics;

        g.beginFill(p.color);
        g.drawRect(p.x, p.y, p.size, p.size);
        g.endFill();

        p.y += p.dy;
        p.x += p.dx;
        p.ttl--;
    }
    //Delete dead particles
    var particles_ = this.particles.slice(); //Copy array
    for (var j = 0; j < particles_.length; j++) {

        if (particles_[j].ttl <= 0) {
            this.particles.splice(j, 1);
        }
    }
    //Delete effect
    if (this.particles.length <= 0) {
        MAR.rootContainer.removeChild(this.graphics);
    }

};

//Icon effect
function IconEffect(x, y, resourceName) {
    this.framesLeft = 55;
    this.sprite = new PIXI.Sprite(PIXI.loader.resources[resourceName].texture);

    this.sprite.alpha = 0.9;

    this.sprite.x = ((x - y) * 64) + 40;
    this.sprite.y = ((x + y) * 32) - 45;
    this.sprite.z = y + x + 0.2;

}

IconEffect.prototype.update = function () {

    if (this.framesLeft < 30) {
        this.sprite.alpha = (this.framesLeft / 40);

        //Remove itself
        if (this.framesLeft === 0) {
            MAR.rootContainer.removeChild(this.sprite);
        }
    }

    this.framesLeft--;
};

//Game object
function GameObject(objData) {

    this.objectType = objData.t;
    this.x = objData.x;
    this.y = objData.y;
    this.direction = objData.d;
    this.id = objData.i;
    this.animSpeed = 1;
    this.waitTicks = this.animSpeed;


    //Create sprite
    if (this.objectType === 1) {

        this.heldItem = objData.h;
        this.action = objData.a;

        //Tortoise
        var sprite = null;
        if (this.direction === 0) {
            //North
            sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("walk_n/0001"));
        } else if (this.direction === 1) {
            //East
            sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("walk_n/0001"));
        } else if (this.direction === 2) {
            //South
            sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("walk_n/0001"));
        } else if (this.direction === 3) {
            //West
            sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("walk_n/0001"));
        }
        sprite.y = ((this.x + this.y) * 32) - 8;
        sprite.x = (this.x - this.y) * 64;
        sprite.z = this.y + this.x + 0.1;
        this.sprite = sprite;

        //Add inventory indicator
        this.indicator = new InventoryIndicator(this);
        this.indicator.sprite = new PIXI.Text("", {fontSize: 12, fontFamily: "c64_mono", fill: "white"});//Will be replace by a texture
        this.indicator.updateIcon = function () {
            if (this.parentObj.heldItem === 1) {
                this.sprite.text = "Biomass";
            } else if (this.parentObj.heldItem === 2) {
                this.sprite.text = "CH3OH";
            } else if (this.parentObj.heldItem === 3) {
                this.sprite.text = "Fe";
            } else if (this.parentObj.heldItem === 4) {
                this.sprite.text = "Cu";
            } else if (this.parentObj.heldItem === 5) {
                this.sprite.text = "Fe pl8";
            } else if (this.parentObj.heldItem === 6) {
                this.sprite.text = "Cu pl8";
            } else {
                this.sprite.text = "";
            }

        };
        this.indicator.updateIcon();
        this.indicator.updatePos();
        addToWorldLayer(this.indicator.sprite);

    } else if (this.objectType === 2) {
        //Plant
        var sprite = new PIXI.Sprite(PIXI.loader.resources["plant1"].texture); //Todo handle different plant styles
        sprite.x = (this.x - this.y) * 64 + 32;
        sprite.y = ((this.x + this.y) * 32) - 26;
        sprite.z = this.y + this.x + 0.1;
        this.sprite = sprite;

        //todo life bar thingy indicator
    } else if (this.objectType === 3) {
        //Kiln
        this.qi = objData.qi; //Queued Iron
        this.qc = objData.qc; //Queued Copper
        this.ci = objData.ci; //Cooked Iron
        this.cc = objData.cc; //Cooked Copper
        this.f = objData.f; //fuel

        var sprite = new PIXI.Sprite(PIXI.loader.resources["kiln"].texture);
        sprite.x = ((this.x - this.y) * 64);
        sprite.y = ((this.x + this.y) * 32) - 58;
        sprite.z = this.y + this.x + 0.1;
        this.sprite = sprite;

        //Add inventory indicator
        this.indicator = new InventoryIndicator(this);
        this.indicator.sprite = new PIXI.Text("", {fontSize: 12, fontFamily: "c64_mono", fill: "white"});//Will be replace by a texture
        this.indicator.updateIcon = function () {
            this.sprite.text = this.parentObj.qc + ":" + this.parentObj.qi + "\n" +
                this.parentObj.cc + ":" + this.parentObj.ci + "\nf:" + this.parentObj.f;
        };
        this.indicator.updateIcon();
        this.indicator.updatePos();
        addToWorldLayer(this.indicator.sprite);

        //todo life bar thingy indicator
    } else if (this.objectType === 4) {
        //Digester
        var sprite = new PIXI.Sprite(PIXI.loader.resources["digester"].texture);
        sprite.x = ((this.x - this.y) * 64) - 64;
        sprite.y = ((this.x + this.y) * 32) - 64;
        sprite.z = this.y + this.x + 11.1;
        this.sprite = sprite;

        //todo life bar thingy indicator
        //todo inventory indicator
    } else if (this.objectType === 5) {
        //Rocket
        var sprite = new PIXI.Sprite(PIXI.loader.resources["rocket"].texture);
        sprite.x = (this.x - this.y) * 64;
        sprite.y = ((this.x + this.y) * 32) - 128;
        sprite.z = this.y + this.x + 0.1;
        this.sprite = sprite;

        //todo life bar thingy indicator
        //todo progress indicator
    }


}

GameObject.prototype.update = function () {


    if (this.walking === undefined) {

        this.walking = 0;
    } else if (this.walking > 0) {
        //The object has more walking frames to do
        this.sprite.x += this.dx;
        this.sprite.y += this.dy;

        this.walking--;

        if (this.walking === 0) {
            //Finished walking cycle
            if (this.recalculateZAfter) {
                this.sprite.z = this.y + this.x + 0.1;
                this.recalculateZAfter = false;
            }
        } else {
            //Play 10 first frames then loop frames 10-30
            if (this.frame === undefined) {
                this.frame = 1;
            } else if (this.frame === 30) {
                this.frame = 10;
            } else {
                if (this.waitTicks === 0) {
                    this.frame++;
                    this.waitTicks = this.animSpeed;
                } else {
                    this.waitTicks--;
                }
            }
        }
    }


    if ((this.digging === undefined || isNaN(this.digging)) && this.action === 1) {
        //Just started digging animation
        console.log("started digging");
        this.digging = 1;
        this.action = 0;
    } else {
        //Continue digging animation
        this.digging++;

        if (this.digging === 41) {
            //Reached end of animation
            this.digging = undefined;
        }
    }

    if (this.direction === 0) {
        //North
        if (this.walking !== 0) {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_n/" + ("0000" + this.frame).slice(-4));
        } else if (this.digging > 0) {
            //Digging
            this.sprite.texture = PIXI.Texture.fromFrame("dig_n/" + ("0000" + this.digging).slice(-4));

        } else {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_n/0001");
        }

    } else if (this.direction === 1) {
        //East
        if (this.walking !== 0) {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_e/" + ("0000" + this.frame).slice(-4));
        } else if (this.digging > 0) {
            //Digging
            this.sprite.texture = PIXI.Texture.fromFrame("dig_e/" + ("0000" + this.digging).slice(-4));

        } else {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_e/0001");
        }
    } else if (this.direction === 2) {
        //South
        if (this.walking !== 0) {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_s/" + ("0000" + this.frame).slice(-4));
        } else if (this.digging > 0) {
            //Digging
            this.sprite.texture = PIXI.Texture.fromFrame("dig_s/" + ("0000" + this.digging).slice(-4));

        } else {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_s/0001");
        }

    } else if (this.direction === 3) {
        //West
        if (this.walking !== 0) {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_w/" + ("0000" + this.frame).slice(-4));
        } else if (this.digging > 0) {
            //Digging
            this.sprite.texture = PIXI.Texture.fromFrame("dig_w/" + ("0000" + this.digging).slice(-4));

        } else {
            this.sprite.texture = PIXI.Texture.fromFrame("walk_w/0001");
        }
    }

    //Sync indicator icon location and z order
    this.indicator.sprite.x = this.sprite.x;
    this.indicator.sprite.y = this.sprite.y;
    this.indicator.sprite.z = this.sprite.z + 0.1;

    MAR.worldLayer.children.sort(depthCompare);
};


//Tile
function Tile(terrainType) {

    if (terrainType === 0) {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources["plain"].texture);
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.z = 0;

        this.sprite.hitArea = new PIXI.Polygon(
            new PIXI.Point(64, 0),
            new PIXI.Point(128, 32),
            new PIXI.Point(64, 64),
            new PIXI.Point(0, 32)
        );

    } else if (terrainType === 1) {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources["wall"].texture);
        this.sprite.x = 0;
        this.sprite.y = -40;
        this.sprite.z = 0;

        this.sprite.hitArea = new PIXI.Polygon(
            new PIXI.Point(64, 0),
            new PIXI.Point(128, 32),
            new PIXI.Point(128, 72),
            new PIXI.Point(64, 103),
            new PIXI.Point(0, 72),
            new PIXI.Point(0, 32)
        );

        this.wallHeight = 1;
    } else if (terrainType === 2) {

        this.sprite = new PIXI.Sprite(PIXI.loader.resources["tile_iron"].texture);
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.z = 0;

        this.sprite.hitArea = new PIXI.Polygon(
            new PIXI.Point(64, 0),
            new PIXI.Point(128, 32),
            new PIXI.Point(64, 64),
            new PIXI.Point(0, 32)
        );
    } else if (terrainType === 3) {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources["tile_copper"].texture);
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.z = 0;

        this.sprite.hitArea = new PIXI.Polygon(
            new PIXI.Point(64, 0),
            new PIXI.Point(128, 32),
            new PIXI.Point(64, 64),
            new PIXI.Point(0, 32)
        );
    }
    this.sprite.tileId = terrainType;

    //Assigning event to each tile inefficient?
    this.sprite.interactive = true;

    this.sprite.on("pointerover", function () {
        var tileName = "null";
        //Change tile texture to indicate hover state
        if (this.tileId === 0) {
            this.texture = PIXI.loader.resources["plain_s"].texture;
            tileName = "plain";
        } else if (this.tileId === 1) {
            this.texture = PIXI.loader.resources["wall_s"].texture;
            tileName = "wall";
        }//todo add other tiles

        //Change info text
        //todo make this better
        MAR.currentTileText.text = "(" + this.tileX + "," + this.tileY + "," + this.z + ")\n" + tileName;
    });

    this.sprite.on("pointerout", function () {
        //Change tile texture to indicate hover state
        if (this.tileId === 0) {
            this.texture = PIXI.loader.resources["plain"].texture;
        } else if (this.tileId === 1) {
            this.texture = PIXI.loader.resources["wall"].texture;
        }
    });
    //Behave like background when clicked
    this.sprite.on("pointerdown", pointerDown);
    this.sprite.on("pointerup", bgPointerUp);
    this.sprite.on("pointerupoutside", bgPointerUp);

}

function pointerDown(e) {
    MAR.pointerdown = true;
    MAR.pointerFirstClick = e.data.getLocalPosition(MAR.rootContainer);
}

function bgPointerUp() {
    MAR.pointerdown = false;
    MAR.pointerLastDrag = null;
}

// --------------------------
// Get an object from the current World's object list
function getObject(id) {

    for (var i = 0; i < MAR.objects.length; i++) {
        if (MAR.objects[i].id === id) {
            return MAR.objects[i];
        }
    }

    return null;

}

// --------------------------
//Integer distance between 2 tiles
function distance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

//Inventory indicator
function InventoryIndicator(parentObj, sprite) {
    this.parentObj = parentObj;
    this.sprite = sprite;
}

InventoryIndicator.prototype.updatePos = function () {
    this.sprite.x = this.parentObj.sprite.x; //todo add offSetX property
    this.sprite.y = this.parentObj.sprite.y;
    this.sprite.z = this.parentObj.sprite.z + 0.1;
};

InventoryIndicator.prototype.updateIcon = function () {
    console.log("FIXME: forgot to define updateIcon");
};
