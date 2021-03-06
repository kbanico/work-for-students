var MrHop = MrHop || {};
MrHop.GameState = {
    init: function () {
        //pool of floors
        this.floorPool = this.game.add.group();
        //gravity
        this.game.physics.arcade.gravity.y = 1000;
        
        //max jump distance
        this.maxJumpDistance = 120;
        
        // move the player with up key
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        //coins
        this.myCoins = 0;
        
        //pool of platforms
        this.platformPool = this.add.group();
        
        //level speed
        this.levelSpeed = 200;
    }
    , create: function () {
        // create the player
        this.player = this.add.sprite(50,50, "player");
        this.player.anchor.setTo(0.5);
        this.player.animations.add("running",[0,1,2,3,2,1],15,true);
        this.game.physics.arcade.enable(this.player);
        
        // change the player bounding box
        this.player.body.setSize(38,60,0,0);
        this.player.play("running")
        
        // hard-code first platform
        this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed);
        this.platformPool.add(this.currentPlatform);
        
        this.loadLevel();
    }
    , update: function () {
     
        
        this.platformPool.forEachAlive(function(platform,index){
            this.game.physics.arcade.collide(this.player,platform);
            
            // check if a platform needs to be killed
            if(platform.length && platform.children[platform.length - 1].right < 0){
                platform.kill();
            }

        },this);
        
           // set the velocity of the player so it doesn't get knocked off the edge
        
        if(this.player.body.touching.down){
            this.player.body.velocity.x = this.levelSpeed;
        }else{
            // if its in the air
            this.player.body.velocity.x = 0;
        }
        
        if(this.cursors.up.isDown || this.game.input.activePointer.isDown){
            this.playerJump();
        }else if(this.cursors.up.isUp || this.game.input.activePointer.isUp){
            this.isJumping = false;
        }
        
        // add more platform
        if(this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length - 1].right < this.game.world.width){
            this.createPlatform();
        }
    },
    playerJump:function(){
        if(this.player.body.touching.down){
            //starting point of the jump
            this.startJumpY = this.player.y;
            
            //keep track of the fact that it is jumping
            this.isJumping = true;
            this.jumpPeaked = false;
            
            this.player.body.velocity.y = -300;
        }else if(this.isJumping && !this.jumpPeaked){
            var distanceJumped = this.startJumpY - this.player.y;
            console.log(distanceJumped + " player is in the air");
            if(distanceJumped <= this.maxJumpDistance){
                // if this is true keep the same jumping velocity
                this.player.body.velocity.y = -300;
            }else{
                // we have reached the jumpPeaked
                this.jumpPeaked = true;
            }
        }
    },
    loadLevel:function(){
        this.levelData = {
            platforms:[
                {
                    separation:50,
                    y: 200,
                    numTiles: 4
                },
                {
                    separation: 50,
                    y:250,
                    numTiles: 6
                },
                {
                    separation: 100,
                    y: 200,
                    numTiles: 3
                },
                {
                    separation: 50,
                    y: 250,
                    numTiles: 8
                },
                {
                    separation: 100,
                    y: 200,
                    numTiles: 10
                },
                {
                    separation: 100,
                    y: 300,
                    numTiles: 4
                },
                {
                    separation: 50,
                    y: 200,
                    numTiles: 10
                },
                {
                    separation: 100,
                    y: 300,
                    numTiles: 4
                },
                {
                    separation: 50,
                    y: 200,
                    numTiles: 4
                },
            ]
        };
        this.currIndex = 0;
        this.createPlatform();
    },
    createPlatform:function(){
        
        var nextPlatformData = this.levelData.platforms[this.currIndex];
        if(nextPlatformData){
            this.currentPlatform = this.platformPool.getFirstDead()
            if(!this.currentPlatform){
            this.currentPlatform = new MrHop.Platform(this.game,this.floorPool,nextPlatformData.numTiles,this.game.world.width + nextPlatformData.separation, nextPlatformData.y,-this.levelSpeed);
            }
            this.currentPlatform.prepare(nextPlatformData.numTiles,this.game.world.width + nextPlatformData.separation, nextPlatformData.y, - this.levelSpeed)
            this.platformPool.add(this.currentPlatform)
            this.currIndex++;
        }
    }
//    render:function(){
//        this.game.debug.body(this.player);
//        this.game.debug.bodyInfo(this.player,0,30);
//    }
};