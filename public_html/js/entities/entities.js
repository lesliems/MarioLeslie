game.PlayerEntity = me.Entity.extend({
    init: function (x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                height: 128,
                width: 128,
                getShape: function(){
                    return(new me.Rect(0, 0, 128, 128)).toPolygon();
                }
        }]);
         
       this.renderable.addAnimation("idle", [3]);
       this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
       this.body.setVelocity(5, 20);
    },
    
    update: function(delta){
        if(me.input.isKeyPressed("right")){
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }
        else
            {this.body.vel.x = 0;
        }
        if(this.body.vel.x !== 0){
            if (!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
              this.renderable.setAnimationFrame();

            }
        }else{
          this.renderable.setCurrentAnimation("idle");
        }
       if (me.input.isKeyPressed("left")) {
            // flip the sprite on horizontal axis
            this.flipX(true);
            // update the entity velocity
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            // change to the walking animation
            if (!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
            }
        } else if (me.input.isKeyPressed("right")) {
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            // change to the walking animation
            if (!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
            }
        else
             {this.body.vel.x = 0;
             }
        if(this.body.vel.x != 0){
            if(!this.renderable.isCurrentAnimation("smallwalk")){
                this.renderable.setCurrentAnimation("smallWalk");
                this.renderable.setAnimationFrame();
            }
        }else{
          this.renderable.setCurrentAnimation("idle");
        }
        this.body.update(delta);
        this._super(me.Entity, "update", [delta]);
        return true;
        }
    }
});