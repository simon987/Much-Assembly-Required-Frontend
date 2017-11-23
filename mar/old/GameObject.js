
OBJ_CUBOT = 1;
OBJ_PLANT = 2;
OBJ_KILN = 3;
OBJ_DIGESTER  = 4;
OBJ_ROCKET = 5;

DIR_NORTH = 0;
DIR_EAST = 1;
DIR_SOUTH = 2;
DIR_WEST = 3;

ACTION_WALK =2;



function getItemTexture(item){

    return PIXI.Texture.fromFrame("objects/plant1_s");

}

function getCubotAnimatedSprites(){

    var walk_e = [];
    var walk_n = [];
    var walk_s = [];
    var walk_w = [];
    var i;

    for(i = 1; i <= 30; i++){
        walk_e.push(PIXI.Texture.fromFrame("cubot/walk_e/" + ("0000" + i).slice(-4)))
    }
    for(i = 1; i <= 30; i++){
        walk_n.push(PIXI.Texture.fromFrame("cubot/walk_n/" + ("0000" + i).slice(-4)))
    }
    for(i = 1; i <= 30; i++){
        walk_s.push(PIXI.Texture.fromFrame("cubot/walk_s/" + ("0000" + i).slice(-4)))
    }
    for(i = 1; i <= 30; i++){
        walk_w.push(PIXI.Texture.fromFrame("cubot/walk_w/" + ("0000" + i).slice(-4)))
    }

    var clip_wal_e = new PIXI.extras.AnimatedSprite(walk_e);
    clip_wal_e.animationSpeed = 0.5;
    clip_wal_e.onFrameChange = function(){
        if(this.currentFrame === 29){
            this.gotoAndPlay(10);
        }
    };

    var clip_wal_n = new PIXI.extras.AnimatedSprite(walk_n);
    clip_wal_n.animationSpeed = 0.5;
    clip_wal_n.onFrameChange = function(){
        if(this.currentFrame === 29){
            this.gotoAndPlay(10);
        }
    };
    var clip_wal_s = new PIXI.extras.AnimatedSprite(walk_s);
    clip_wal_s.animationSpeed = 0.5;
    clip_wal_s.onFrameChange = function(){
        if(this.currentFrame === 29){
            this.gotoAndPlay(10);
        }
    };
    var clip_wal_w = new PIXI.extras.AnimatedSprite(walk_w);
    clip_wal_w.animationSpeed = 0.5;
    clip_wal_w.onFrameChange = function(){
        if(this.currentFrame === 29){
            this.gotoAndPlay(10);
        }
    };

    var clips = {"walk_e": clip_wal_e,
        "walk_n":clip_wal_n,
        "walk_s":clip_wal_s,
        "walk_w":clip_wal_w};

    return clips;



}

function getObjectTexture(obj, selected){

    switch(obj.type){

        case OBJ_CUBOT:
            //Tortoise
            if(selected){

                return PIXI.Texture.fromFrame("cubot/walk_w/0001");

            } else {

                switch (obj.direction){
                    case DIR_NORTH:
                        return PIXI.Texture.fromFrame("cubot/walk_n/0001");
                    case DIR_EAST:
                        return PIXI.Texture.fromFrame("cubot/walk_e/0001");
                    case DIR_SOUTH:
                        return PIXI.Texture.fromFrame("cubot/walk_s/0001");
                    case DIR_WEST:
                        return PIXI.Texture.fromFrame("cubot/walk_w/0001");
                }
            }

            break;
        case OBJ_PLANT:
            //Plant
            if(selected){
                return PIXI.Texture.fromFrame("objects/plant1_s");
            } else {
                return PIXI.Texture.fromFrame("objects/plant1");
            }
        case OBJ_KILN:
            //Kiln
            if(selected){
                return PIXI.Texture.fromFrame("objects/kiln_s");
            } else {
                return PIXI.Texture.fromFrame("objects/kiln");
            }
        case OBJ_DIGESTER:
            //Digester
            return PIXI.Texture.fromFrame("objects/digester");
        case OBJ_ROCKET:
            //Rocket
            return PIXI.Texture.fromFrame("objects/rocket");

    }
}

function getZPosition(type, x, y) {

    switch (type){
        case 1:
        case 2:
        case 3:
        case 4:
            return x + y + 0.1;
        case 5:
            return x + y + + 11.1;
    }
}

function getXPosition(type, x, y) {

    switch (type){
        case OBJ_CUBOT:
            return (x - y) * 64;
        case OBJ_PLANT:
            return (x - y) * 64 + 32;
        case OBJ_KILN:
            return (x - y) * 64;
        case OBJ_DIGESTER:
            return ((x - y) * 64) - 64;
        case OBJ_ROCKET:
            return (x - y) * 64;
    }
}

function getYPosition(type, x, y) {

    switch (type){
        case OBJ_CUBOT:
            return ((x + y) * 32) - 8;
        case OBJ_PLANT:
            return ((x + y) * 32) - 26;
        case OBJ_KILN:
            return ((x + y) * 32) - 58;
        case OBJ_DIGESTER:
            return ((x + y) * 32) - 64;
        case OBJ_ROCKET:
            return ((x + y) * 32) - 128;
    }
}


/**
 * Object an object with the new instance from the server
 * @param object
 * @param responseObj
 */
function updateGameObject(object, responseObj){

    //Update location
    if (object.x !== responseObj.x || object.y !== responseObj.y) {
        //location changed
        moveObject(responseObj.x, responseObj.y, object);
    }

    //Overwrite object fields
    for(var key in responseObj){
        object[key] = responseObj[key];
    }

    if(object.type === OBJ_CUBOT){

        // object.sprite.x = getXPosition(object.type, object.x, object.y);
        // object.sprite.y = getYPosition(object.type, object.x, object.y);
        // object.sprite.z = getZPosition(object.type, object.x, object.y);

        if(object.action === ACTION_WALK){

            //Walking
            switch (object.direction){
                case DIR_NORTH:

                    object.clips.walk_n.x = object.sprite.x;
                    object.clips.walk_n.y = object.sprite.y;
                    object.clips.walk_n.z = object.sprite.z;

                    if(!object.clips.walk_n.visible) {

                        object.clips.walk_n.visible = true;
                        object.clips.walk_n.play();
                        object.clips.walk_e.visible = false;
                        object.clips.walk_s.visible = false;
                        object.clips.walk_w.visible = false;
                    }



                    break;

                case DIR_EAST:

                    object.clips.walk_e.x = object.sprite.x;
                    object.clips.walk_e.y = object.sprite.y;
                    object.clips.walk_e.z = object.sprite.z;

                    if(!object.clips.walk_e.visible){

                        object.clips.walk_n.visible = false;
                        object.clips.walk_e.visible = true;
                        object.clips.walk_e.play();
                        object.clips.walk_s.visible = false;
                        object.clips.walk_w.visible = false;
                    }

                    break;

                case DIR_SOUTH:

                    object.clips.walk_s.x = object.sprite.x;
                    object.clips.walk_s.y = object.sprite.y;
                    object.clips.walk_s.z = object.sprite.z;

                    if(!object.clips.walk_s.visible){

                        object.clips.walk_n.visible = false;
                        object.clips.walk_e.visible = false;
                        object.clips.walk_s.visible = true;
                        object.clips.walk_s.play();
                        object.clips.walk_w.visible = false;
                    }

                    break;

                case DIR_WEST:
                    object.clips.walk_w.x = object.sprite.x;
                    object.clips.walk_w.y = object.sprite.y;
                    object.clips.walk_w.z = object.sprite.z;

                    if(!object.clips.walk_s.visible){

                        object.clips.walk_n.visible = false;
                        object.clips.walk_e.visible = false;
                        object.clips.walk_s.visible = false;
                        object.clips.walk_w.visible = true;
                        object.clips.walk_w.play();
                    }

                    break;
            }


        }

    }

    return object;
}

/**
 * Called each frame
 */
function update(){

    if (this.walking === undefined) {

        this.walking = 0;
    } else if (this.walking > 0) {
        //The object has more walking frames to do
        for(clip in this.clips){
            this.clips[clip].x += this.dx;
            this.clips[clip].y += this.dy;
        }

        this.walking--;

        if (this.walking === 0 && this.recalculateZAfter) {
            //Finished walking cycle
            for(clip in this.clips){
                this.clips[clip].z = this.y + this.x + 0.1;
            }
            this.recalculateZAfter = false;
        }
    }


}

function createGameObject(objData){

    console.log(objData);

    objData.sprite = new PIXI.Sprite(getObjectTexture(objData));
    objData.sprite.x = getXPosition(objData.type, objData.x, objData.y);
    objData.sprite.y = getYPosition(objData.type, objData.x, objData.y);
    objData.sprite.z = getZPosition(objData.type, objData.x, objData.y);

    objData.sprite.interactive = true;
    objData.sprite.buttonMode = true;

    objData.sprite.on("click", function(){
        console.log(objData);
    });

    objData.sprite.on("pointerover", function(){
        objData.sprite.texture = getObjectTexture(objData, true);
    });

    objData.sprite.on("pointerout", function(){
        objData.sprite.texture = getObjectTexture(objData, false);
    });

    //Setup Inventory
    // createInventory(objData);

    objData.update = update;

    if(objData.type === OBJ_CUBOT){
        objData.clips = getCubotAnimatedSprites();
        objData.clips.walk_e.visible = false;
        objData.clips.walk_n.visible = false;
        objData.clips.walk_s.visible = false;
        objData.clips.walk_w.visible = false;
        game.worldLayer.addChild(objData.clips.walk_e);
        game.worldLayer.addChild(objData.clips.walk_n);
        game.worldLayer.addChild(objData.clips.walk_s);
        game.worldLayer.addChild(objData.clips.walk_w);

    } else {
        game.worldLayer.addChild(objData.sprite);
    }



    return objData;

}