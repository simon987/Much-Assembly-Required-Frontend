
fullscreen = false;


function gameLoop() {
    requestAnimationFrame(gameLoop);

    for(var i in game.world.objects){

        if(game.world.objects[i]){
            game.world.objects[i].update();
        }
    }

    game.worldLayer.children.sort(depthCompare);

    game.renderer.render(game.rootContainer);

}

function Game(){

    var world;
    var worldX;
    var worldY;
    var self = this;

    this.calculateBounds = function(){

        if (fullscreen) {
            self.RENDERER_WIDTH = window.innerWidth - 4;
            self.RENDERER_HEIGHT = window.innerHeight - 4;
        } else {
            self.RENDERER_WIDTH = document.getElementById("game").clientWidth;
            self.RENDERER_HEIGHT = (window.innerHeight / 1.25);
        }
    };

    //Setup renderer
    this.calculateBounds();

    this.renderer = PIXI.autoDetectRenderer(256, 256);
    document.getElementById("game").appendChild(this.renderer.view);

    this.rootContainer = new PIXI.Container();
    this.renderer.backgroundColor = 0x282828;
    this.renderer.resize(this.RENDERER_WIDTH, this.RENDERER_HEIGHT);

    window.onresize = function () {

        self.calculateBounds();
        self.renderer.resize(self.RENDERER_WIDTH, self.RENDERER_HEIGHT);
    };

    //SETUP BACKGROUND LAYER & PANNING
    this.bgLayer = new PIXI.Container();
    this.rootContainer.addChildAt(this.bgLayer, 0);
    this.bg = new PIXI.Sprite();
    this.bg.interactive = true;
    this.bg.hitArea = new PIXI.Rectangle(0, 0, this.RENDERER_WIDTH, this.RENDERER_HEIGHT);
    this.bg.on("pointerdown", function (e) {
        self.pointerdown = true;
        self.pointerFirstClick = e.data.getLocalPosition(self.rootContainer);
    });
    this.bg.on("pointerup", function () {
        self.pointerdown = false;
        self.pointerLastDrag = null;
    });
    this.bg.on("pointerupoutside", function () {
        self.pointerdown = false;
        self.pointerLastDrag = null;
    });
    this.bg.on("pointermove", function (e) {
        if (self.pointerdown === true) {
            //Dragging

            var currentMouse = e.data.getLocalPosition(self.rootContainer);

            if (self.pointerLastDrag !== null) {
                self.worldLayer.position.x += currentMouse.x - self.pointerLastDrag.x;
                self.worldLayer.position.y += currentMouse.y - self.pointerLastDrag.y;
            } else {
                self.worldLayer.position.x += currentMouse.x - self.pointerFirstClick.x;
                self.worldLayer.position.y += currentMouse.y - self.pointerFirstClick.y;
            }

            self.pointerLastDrag = currentMouse;
        }
    });
    this.bgLayer.addChild(this.bg);



    //------------------------------------



}



