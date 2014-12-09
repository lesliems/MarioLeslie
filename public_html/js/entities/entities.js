game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                height: 128,
                width: 128,
                getShape: function() {
                    return(new me.Rect(0, 0, 30, 128)).toPolygon();
                }
            }]);
        // animations for mario
        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("bigIdle", [19]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("shrink", [0, 1, 2, 3], 80);
        this.renderable.addAnimation("grow", [4, 5, 6, 7], 80);
        this.renderable.setCurrentAnimation("idle");
        this.big = false;
        this.body.setVelocity(5, 20);
    },
    update: function(delta) {
//        console.log(this.pos.x);
        //check if rigth key is pressed
        if (me.input.isKeyPressed("right")) {
            //adds the speed set is the setVelocity 
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.flipX(false);
        }
        else {
            this.body.vel.x = 0;
        }
        if (me.input.isKeyPressed("left")) {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            this.flipX(true);
        }
        else {
            this.body.vel.x - 0;
        }

        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        //if mario is not big
        if (!this.big) {
            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("smallWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("idle");
            }
        } else {
            if (this.body.vel.x !== 0) {
                // to not walk while shrinking or growing
                if (!this.renderable.isCurrentAnimation("bigWalk") && !this.renderable.isCurrentAnimation("grow") && !this.renderable.isCurrentAnimation("shrink")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("bigIdle");
            }
        }
        //if the up key is pressed, mario will jump
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
        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function(response) {
        //ydif is the between mario and whatever he hits so he can kill it
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        //respond.b represents what we run into 
        if (response.b.type === 'badguy') {
            if (ydif <= -115) {
                response.b.alive = false;
            } else {
                if (this.big) {
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    this.jumping = true;
                    //once the first (shrink) is done it will move on to the next (smallidle)
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    this.renderable.setAnimationFrame();
                } else {
                    me.state.change(me.state.MENU);

                }
            }
            //if mario touches mushroom, the idle (mario) will grow
        } else if (response.b.type === 'mushroom') {
            this.renderable.setCurrentAnimation("grow", "bigIdle");
            this.big = true;
            me.game.world.removeChild(response.b);
        }
//        else if (response.b.type === 'coin'){
//            
//        }
    }
});
game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    onCollision: function() {
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        console.log(this.xSpawn + " " + this.ySpawn);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }

});

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                height: 60,
                width: 28,
                getShape: function() {
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

        // velocity of bad guy
        this.body.setVelocity(4, 6);
    },
    update: function(delta) {
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        //if the bad guy is still alive- if not then get rid of it
        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            this.flipX(!this.walkLeft);
            //if true, it will do whats on the left - if false it will do whats one the right/ 
            //we are adding an amount to our current position but to determine to add a positive or negative amount we check weather this.walkLeft is true.
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
        } else {
            me.game.world.removeChild(this);
        }

        // delta- how long it takes
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function() {

    }
});

game.Mushroom = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                height: 64,
                width: 64,
                getShape: function() {
                    return(new me.Rect(0, 0, 64, 64)).toPolygon();
                }
            }]);
        // check if mario collides with mushroom
        me.collision.check(this);
        this.type = "mushroom";
    }

});

//game.Coin = me.Entity.extend({
//    // extending the init function is not mandatory
//    // unless you need to add some extra initialization
//    init: function(x, y, settings) {
//        // call the parent constructor
//        this._super(me.CollectableEntity, 'init', [x, y, {
//                image: "coin",
//                spritewidth: "61",
//                spriteheight: "57",
//                height: 57,
//                width: 61,
//                getShape: function() {
//                    return(new me.Rect(0, 0, 57, 61)).toPolygon();
//                },
//                // this function is called by the engine, when
//                // an object is touched by something (here collected)
//                onCollision: function(response, other) {
//                    // do something when collected
//
//                    // make sure it cannot be collected "again"
//                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
//
//                    // remove it
//                    me.game.world.removeChild(this);
//
//                    return false
//                }
//            }]);
//
//    }
//
//});
    