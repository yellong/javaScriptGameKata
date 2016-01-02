(function(root){

	var annagame = function(opt){
		var that = {
			canvas: opt.canvas
			ctx: opt.ctx
		}
		return that;
	}

	annagame.getCtx = function(){
		return annagame.ctx || (annagame.ctx = document.getElementById('annagame').getContext('2d'));
	}
	annagame.getCanvas = function(){
		return annagame.canvas || (annagame.canvas = document.getElementById('annagame'));
	}
	annagame.getCtx().fillStyle = '#fff';
	annagame.image = function(opt){
		var ctx = annagame.getCtx(),loaded = false;
		if(!!(opt.image && opt.image.nodeType === 1)){
			opt.image = opt.image;
		}else if(typeof opt.image === 'string'){
			var img = new Image();
			img.src = opt.image;
			opt.image = img;
		}
		var that ={
			x: opt.x,
			y: opt.y,
			width: opt.width,
			height: opt.height,
			index: 0,
			framesCount: opt.framesCount || 1,
			update:function(i){
				i%=that.framesCount;
				if(opt.h){
					that.x += (i - that.index)*(that.width+(opt.padding||0));
				}
				if(opt.v){
					that.y += (i - that.index)*(that.height+(opt.padding||0));
				}
				that.index = i;
				if(opt.update)opt.update(that);
				return that;
			},
			next:function(){
				that.update(that.index+1);
				that.draw();
				return that;
			},
			draw:function(options){
				options = options||{
					x:0,y:0,
					width: that.width,height: that.height
				}
				var render = function(){
					ctx.fillRect(options.x,options.y,options.width,options.height);
					ctx.drawImage(opt.image,that.x,that.y,that.width,that.height,
					options.x,options.y,options.width,options.height);
					if(opt.draw)opt.draw(options);
					if(options.afterDraw)options.afterDraw(opt);
				}
				if(opt.image.complete){
					render();
				}else{
					opt.image.onload = function(){
						render();
						opt.image.onload = function(){}
					}
				}
				return that;
			}
		}
		return that;
	}

	annagame.sprite = function(opt){
		var that = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			image: opt.image,
			update:function(){},
			draw:function(){
				that.image.draw(that);
			}
		}
		return that;
	}

	annagame.backgroundSprite = function(opt){
		var sprite = annagame.sprite(opt);
		sprite.update = function(){}
		return sprite;
	}


})(this);




