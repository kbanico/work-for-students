var MrHop = MrHop || {};
MrHop.GameState = {
    init: function () {
        //pool of floors
        this.floorPool = this.game.add.group();
        
        //pool of coins
        this.coinsPool = this.game.add.group();
        this.coinsPool.enableBody = true;
        
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
        //moving background
        this.background = this.add.tileSprite(0,0,this.game.world.width,this.game.world.height, "background");
        this.background.tileScale.y = 2;
        this.background.autoScroll(-this.levelSpeed/6,0);
        this.game.world.sendToBack(this.background)
        
        // create the player
        this.player = this.add.sprite(50,50, "player");
        this.player.anchor.setTo(0.5);
        this.player.animations.add("running",[0,1,2,3,2,1],15,true);
        this.game.physics.arcade.enable(this.player);
        
        // change the player bounding box
        this.player.body.setSize(38,60,0,0);
        this.player.play("running")
        
        // hard-code first platform
        this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed, this.coinsPool);
        this.platformPool.add(this.currentPlatform);
        
        //coin sound
        this.coinSound = this.add.audio('coin');
        
        this.loadLevel();
        
        //moving water
        this.water = this.add.tileSprite(0,this.game.world.height - 30, this.game.world.width,30,"water");
        this.water.autoScroll(-this.levelSpeed * 1.5,0)
        
        //show number of coins
        var style = {font: "30px Arial", fill: "#fff"};
        this.coinsCountLabel = this.add.text(10,20,"0",style);
    }
    , update: function () {
     
        if(this.player.alive){
            
            this.platformPool.forEachAlive(function(platform,index){
                this.game.physics.arcade.collide(this.player,platform);

                // check if a platform needs to be killed
                if(platform.length && platform.children[platform.length - 1].right < 0){
                    platform.kill();
                }

            },this);

            //coins
            this.coinsPool.forEachAlive(function(coin){
                if(coin.right <=0 ){
                    coin.kill();
                }
            },this);

            //collision with player and coin
            this.game.physics.arcade.overlap(this.player,this.coinsPool,this.collectCoin,null,this);

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
            // check if the player needs to die
            if(this.player.top >= this.game.world.height || this.player.left <= 0){
                this.gameOver();
            }
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
      
    
        this.createPlatform();
    },
    createPlatform:function(){
        
        var nextPlatformData = this.generateRandomPlatform();
        if(nextPlatformData){
            this.currentPlatform = this.platformPool.getFirstDead()
            if(!this.currentPlatform){
            this.currentPlatform = new MrHop.Platform(this.game,this.floorPool,nextPlatformData.numTiles,this.game.world.width + nextPlatformData.separation, nextPlatformData.y,-this.levelSpeed, this.coinsPool);
            }
            this.currentPlatform.prepare(nextPlatformData.numTiles,this.game.world.width + nextPlatformData.separation, nextPlatformData.y, - this.levelSpeed)
            this.platformPool.add(this.currentPlatform)
            this.currIndex++;
        }
    },
    generateRandomPlatform:function(){
        var data = {};
        //distance from the previous platform
        var minSeparation = 60;
        var maxSeparation = 200;
        data.separation = minSeparation + Math.random() * (maxSeparation - minSeparation);
        //y in regards to previous platform
        var minDiffY = -120;
        var maxDiffY = 120
        data.y = this.currentPlatform.children[0].y + minDiffY + Math.random() * (maxDiffY - minDiffY);
        data.y = Math.max(150,data.y);
        data.y = Math.min(this.game.world.height - 50, data.y);
        
        //number of tiles
        var minTiles = 1;
        var maxTiles = 5;
        data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);
        
        return data
    },
    collectCoin:function(player,coin){
        coin.kill();
        this.myCoins++;
        this.coinSound.play();
        this.coinsCountLabel.text = this.myCoins;
    },
    gameOver:function(){
        this.player.kill();
        this.updateHighscore();
        
        //game over overlay
        this.overlay = this.add.bitmapData(this.game.width,this.game.height);
        this.overlay.ctx.fillStyle = "#000";
        this.overlay.ctx.fillRect(0,0,this.game.width,this.game.height);
        
        //sprite for the overlay
        this.panel = this.add.sprite(0,this.game.height,this.overlay)
        this.panel.alpha = 0.55;
        
        //overlay raising tween animation
        var gameOverPanel = this.add.tween(this.panel);
        gameOverPanel.to({y: 0},500);
        
        
        //stop all movement after the overlay reaches the top
        gameOverPanel.onComplete.add(function(){
            this.water.stopScroll();
            this.background.stopScroll();
            
            var style = {font: "30px Arial", fill: "#fff"}
            this.add.text(this.game.width/2,this.game.height/2, "GAME OVER",style).anchor.setTo(0.5);
            
            style = {font: "20px Arial", fill: "#fff"}
            this.add.text(this.game.width/2,this.game.height/2 + 50, "High Score: " + this.highScore,style).anchor.setTo(0.5);
            
            this.add.text(this.game.width/2,this.game.height/2 + 80, "Your Score: " + this.myCoins,style).anchor.setTo(0.5);
            
            style = {font: "10px Arial", fill: "#fff"}
            this.add.text(this.game.width/2, this.game.height / 2 + 120, "Tap to play again",style).anchor.setTo(0.5)
            
            this.game.input.onDown.addOnce(this.restart,this)
            
            
            
        },this);
        
        //initialize the transition
        gameOverPanel.start();
        
        
        //this.restart();
    },
    restart:function(){
        this.game.world.remove(this.background);
        this.game.world.remove(this.water);
        this.game.state.start("Game")
    },
    updateHighscore:function(){
        // adding the + sign will convert it to number
        this.highScore = +localStorage.getItem("highScore");
        
        //do we have a new highscore
        if(this.highScore < this.myCoins){
            this.highScore = this.myCoins;
            
            //save new high score
            localStorage.setItem("highScore", this.highScore);
        }
        console.log(this.highScore + " is the highscore")
        
    }
//    render:function(){
//        this.game.debug.body(this.player);
//        this.game.debug.bodyInfo(this.player,0,30);
//    }
};