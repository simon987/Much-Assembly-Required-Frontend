

WORLD_WIDTH = 16;
WORLD_HEIGHT = 16;


/**
 *
 * @param terrain
 * @constructor
 */
function Word(terrain) {

    setupWorldLayer(this);
   // game.worldLayer = new PIXI.Container();

    this.tiles = {};
    this.objects = [];

    var self = this;

    for (var x = 0; x < WORLD_HEIGHT; x++) {
        for (var y = 0; y < WORLD_HEIGHT; y++) {

            var terrainType = terrain[y * WORLD_WIDTH + x];

            var tile = new Tile(terrainType);

            tile.sprite.x = (x - y) * 64 + getTileXOffset(terrainType);
            tile.sprite.y = (x + y) * 32 + getTileYOffset(terrainType);
            tile.sprite.z = y + x;

            this.tiles[x + ',' + y] = tile;

            game.worldLayer.addChild(tile.sprite);
            game.rootContainer.addChild(game.worldLayer);

        }
    }

    game.worldLayer.children.sort(depthCompare);

    /**
     * Update object from parsed JSON string sent from the server
     * @param response parsed JSON string sent from the server
     */
    this.updateObjects = function(response) {


        //Mark objects as not updated
        for(var i = 0; i < self.objects.length ; i++){
            self.objects[i].updated = false;
        }


        for(var i = 0; i < response.length ; i++){

            response[i].updated = true;

            //Update/Create the object

            var existingObject = self.getObject(response[i].id);
            if(existingObject !== null){
                //Object already exists
                existingObject = updateGameObject(existingObject, response[i]);

            } else {

                //Object is new
                var newObj = createGameObject(response[i]);
                self.addObject(newObj);
            }
        }

        //Delete not updated objects (see above comments)
        for (var i = 0; i < self.objects.length; i++) {
            if (!self.objects[i].updated) {
                console.log("DEBUG: removed " + self.objects[i].id);
                game.worldLayer.removeChild(self.objects[i].sprite);
                self.objects.splice(i, 1);
            }
        }

        game.worldLayer.children.sort(depthCompare);
    };


    /**
     * Add an object the the 'current' objects
     * @param object
     */
    this.addObject = function(object) {

        self.objects.push(object);
    };

    /**
     * Get object from the list of 'current' objects (Objects shown on the screen)
     * @param id objectId of the object
     */
    this.getObject = function(id) {

        for(var i = 0; i < self.objects.length; i++) {
            if (self.objects[i].id === id) {
                return self.objects[i];
            }
        }

        return null;
    };

    this.update = function(terrain){

        for (key in this.tiles) {
            game.worldLayer.removeChild(this.tiles[key].sprite);
        }

        for (var j = 0; j < this.objects.length; j++) {
            game.worldLayer.removeChild(this.objects[j].sprite);
        }

        this.tiles = {};
        this.objects = [];

        for (var x = 0; x < WORLD_HEIGHT; x++) {
            for (var y = 0; y < WORLD_HEIGHT; y++) {

                var terrainType = terrain[y * WORLD_WIDTH + x];

                var tile = new Tile(terrainType);

                tile.sprite.x = (x - y) * 64 + getTileXOffset(terrainType);
                tile.sprite.y = (x + y) * 32 + getTileYOffset(terrainType);
                tile.sprite.z = y + x;

                this.tiles[x + ',' + y] = tile;

                game.worldLayer.addChild(tile.sprite);
                game.rootContainer.addChild(game.worldLayer);

            }
        }

        game.worldLayer.children.sort(depthCompare);
    }

}

function setupWorldLayer(world) {
    game.worldLayer = new PIXI.Container();
    game.worldLayer.x = 736;
    game.worldLayer.y = -32;
    game.rootContainer.addChild(game.worldLayer);

    //NORTH
    var arrow_north = new PIXI.Sprite(PIXI.Texture.fromFrame("ui/arrow_north"));
    arrow_north.x = 528;
    arrow_north.y = 224;
    arrow_north.interactive = true;
    arrow_north.buttonMode = true;
    arrow_north.on("pointerover", function () {
        arrow_north.texture = PIXI.Texture.fromFrame("ui/arrow_north_s");
    });
    arrow_north.on("pointerout", function () {
        arrow_north.texture = PIXI.Texture.fromFrame("ui/arrow_north");
    });
    arrow_north.on("pointerdown", function () {
        game.worldY--;
        client.requestTerrain()
    });
    game.worldLayer.addChild(arrow_north);

    //EAST
    var arrow_east = new PIXI.Sprite(PIXI.Texture.fromFrame("ui/arrow_east"));
    arrow_east.x = 528;
    arrow_east.y = 750;
    arrow_east.interactive = true;
    arrow_east.buttonMode = true;
    arrow_east.on("pointerover", function () {
        arrow_east.texture = PIXI.Texture.fromFrame("ui/arrow_east_s");
    });
    arrow_east.on("pointerout", function () {
        arrow_east.texture = PIXI.Texture.fromFrame("ui/arrow_east");
    });
    arrow_east.on("pointerdown", function () {
        game.worldX++;
        client.requestTerrain();
    });
    game.worldLayer.addChild(arrow_east);

    //SOUTH
    var arrow_south = new PIXI.Sprite(PIXI.Texture.fromFrame("ui/arrow_south"));
    arrow_south.x = -496;
    arrow_south.y = 750;
    arrow_south.interactive = true;
    arrow_south.buttonMode = true;
    arrow_south.on("pointerover", function () {
        arrow_south.texture = PIXI.Texture.fromFrame("ui/arrow_south_s");
    });
    arrow_south.on("pointerout", function () {
        arrow_south.texture = PIXI.Texture.fromFrame("ui/arrow_south");
    });
    arrow_south.on("pointerdown", function () {
        game.worldY++;
        client.requestTerrain();
    });
    game.worldLayer.addChild(arrow_south);

    //WEST
    var arrow_west = new PIXI.Sprite(PIXI.Texture.fromFrame("ui/arrow_west"));
    arrow_west.x = -496;
    arrow_west.y = 224;
    arrow_west.interactive = true;
    arrow_west.buttonMode = true;
    arrow_west.on("pointerover", function () {
        arrow_west.texture = PIXI.Texture.fromFrame("ui/arrow_west_s");
    });
    arrow_west.on("pointerout", function () {
        arrow_west.texture = PIXI.Texture.fromFrame("ui/arrow_west");
    });
    arrow_west.on("pointerdown", function () {
        game.worldX--;
        client.requestTerrain();
    });
    game.worldLayer.addChild(arrow_west)
}

/**
 * Compare depth of two sprites based on their z property
 */
function depthCompare(a, b) {
    if (a.z < b.z) {
        return -1;
    }
    if (a.z > b.z) {
        return 1;
    }
    return 0;
}

