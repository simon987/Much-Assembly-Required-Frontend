

TILE_PLAIN = 0;
TILE_WALL = 1;
TILE_IRON = 2;
TILE_COPPER = 3;

getTileYOffset = function(terrainType) {

    if (terrainType === TILE_WALL) {
        return -40;

    } else {
        return 0;
    }

};
getTileXOffset = function(terrainType) {
    return 0;
};

getTileHitBox = function(terrainType) {
    if (terrainType === TILE_PLAIN) {
        return new PIXI.Polygon(
            new PIXI.Point(64, 0),
            new PIXI.Point(128, 32),
            new PIXI.Point(64, 64),
            new PIXI.Point(0, 32)
        )
    } else if(terrainType === TILE_WALL) {
        return new PIXI.Polygon(
            new PIXI.Point(64, 0),
            new PIXI.Point(128, 32),
            new PIXI.Point(128, 72),
            new PIXI.Point(64, 103),
            new PIXI.Point(0, 72),
            new PIXI.Point(0, 32)
        );
    }
};

TILE_TEXTURE = function(terrainType, selected) {

    switch (terrainType){
        case TILE_PLAIN:
            return selected ? PIXI.Texture.fromFrame("tiles/plain_s") : PIXI.Texture.fromFrame("tiles/plain");
        case TILE_WALL:
            return selected ? PIXI.Texture.fromFrame("tiles/wall_s") : PIXI.Texture.fromFrame("tiles/wall");
        case TILE_IRON:
            return selected ? PIXI.Texture.fromFrame("tiles/iron") : PIXI.Texture.fromFrame("tiles/iron");
        case TILE_COPPER:
            return selected ? PIXI.Texture.fromFrame("tiles/copper") : PIXI.Texture.fromFrame("tiles/copper");
    }
};

function Tile(terrainType) {


    this.sprite = new PIXI.Sprite(TILE_TEXTURE(terrainType, false));
    this.sprite.hitArea = getTileHitBox(terrainType);
    this.sprite.terrainType = terrainType;

    //Setup Events
    //todo: We are assigning an event to each tile (256), is it efficient?
    this.sprite.interactive = true;

    this.sprite.on("pointerover", function() {
        this.texture = TILE_TEXTURE(this.terrainType, true);

        //TODO Show tooltip / debug info here
    });

    this.sprite.on("pointerout", function() {
       this.texture =  TILE_TEXTURE(this.terrainType, false);
    });

    //Behave like background when clicked
    this.sprite.on("pointerdown", pointerDown);
    this.sprite.on("pointerup", bgPointerUp);
    this.sprite.on("pointerupoutside", bgPointerUp);

}

function pointerDown(e) {
    game.pointerdown = true;
    game.pointerFirstClick = e.data.getLocalPosition(game.rootContainer);
}

function bgPointerUp() {
    game.pointerdown = false;
    game.pointerLastDrag = null;
}
