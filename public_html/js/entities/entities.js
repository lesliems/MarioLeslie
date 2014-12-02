game.PlayerEntity = me.Entity.extend({
    init: function (x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                height: 128,
                width: 128,
                getShape: function(){
                    return(new me.Rect(0, 0, 30, 128)).toPolygon();
                }
        }]);
         
       this.renderable.addAnimation("idle", [3]);
       this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
       this.renderable.setCurrentAnimation("idle");
       this.body.setVelocity(5, 20);
    },
    
    update: function(delta){
        console.log(this.pos.x);
        if(me.input.isKeyPressed("right")){
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }
        else{
            this.body.vel.x = 0;
        }  
        
                 this.body.update(delta);
                 me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        if(this.body.vel.x !== 0){
            if (!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
                this.renderable.setAnimationFrame();
            }
            } else {
                this.renderable.setCurrentAnimation("idle");

            }
            if (me.input.isKeyPressed('jump')) {
            // make sure we are not already jumping or falling
            if (!this.body.jumping && !this.body.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.body.jumping = true;
            }
 
        }
        this._super(me.Entity, "update", [delta]);
        return true;
        },
        collideHandler: function(response){
        
        }
 });

game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision =  this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    
    onCollision: function(){
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        console.log(this.xSpawn + " " + this.ySpawn);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }
    
});

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings){
          this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                height: 60,
                width: 28,
                getShape: function(){
                    return(new me.Rect(0, 0, 60, 28)).toPolygon();
                }
        }]);
         this.spriteWidth = 60;
         var width = settings.width;
         x = this.pos.x;
         this.startX = x;
         this.endX = x + width - this.spriteWidth;
         this.pos.x = x + width - this.spriteWidth;
         this.updateBounds();
         
         this.alwaysUpdate = true;
         
         this.walkLeft = false;
         this.alive = true;
         this.type = ("badguy");
         
         
         this.body.setVelocity(4, 6);
    },
    update: function(delta){
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
     
        //if the bad guy is still alive- if not then get rid of it
        if(this.alive){
            if(this.walkLeft && this.pos.x <= this.startX){
                this.walkLeft = false;
            }else if(! this.walkLeft && this.pos.x >= this.endX){
                this.walkLeft = true;
            }
            this.flipX(! this.walkLeft);
            //if true, it will do whats on the left - if false it will do whats one the right
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
        }else{
            
        }me.game.world.removeChild(this);
        
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    collideHandler: function(){
        
    }
});