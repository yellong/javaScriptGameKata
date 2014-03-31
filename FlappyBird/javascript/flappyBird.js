(function(){

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var speed = 60;
	var pause = false;

	var gameObjects = [];
	var funcList = [];


	var cloudsHeight = 60;
	var buildingsHeight = 150;
	var floorHeight = 20;
	var groundHeight = 100;
	var skyHeight = canvas.height - groundHeight - floorHeight - buildingsHeight - cloudsHeight;
	var backgroundVolicity = 1;

	var loadAsset = function(assets,callback){
		var result = {};
		var count = assets.length;
		for(var i=0;i<assets.length;i++){
			assets[i].load(function(name,asset){
				result[name]=asset;
				if( --count === 0)callback(result);
			});
		}
	}

	var imageAsset = function(name,url){
		var image = new Image();
		return {
			load:function(callback){
				image.onload = function(){
					callback(name,image);
				};
				image.src = url;
			}
		}
	}

	var Bird = function(assets){
		var birdImage = assets.bird;
		var s = birdImage.width/(birdImage.height/3);
		var width = 70;
		var bird = {
			x:canvas.width*0.3,
			y:canvas.height*0.3,
			g:0.1,
			vector: Vector2d(0,0.2),
			degree: 0,
			width: width,
			height: width/s,
			index: 0,
			round: 0,
			fly:function(){
				bird.g = -0.3;
				bird.vector.vy = -0.3;
				bird.y -=15;
				setTimeout(function(){
					bird.g = 0.1;
				},50);
			},
			update:function(){
				bird.x+=bird.vector.vx;
				bird.y+=bird.vector.vy;
				bird.vector.vy+= bird.g;
				bird.round += 1/10;
				bird.index = (Math.floor(bird.round))%3;
				if(bird.vector.vy<0){
					bird.degree = -Math.PI/8;
				}else{
					bird.degree = -15*Math.PI/180 + Math.atan( bird.vector.vy/(bird.vector.vx||backgroundVolicity));
				}
				if(collison()){
					pause = true;
				}
			},
			draw:function(){
				
				ctx.save();
				ctx.rotate(bird.degree);
				var x = bird.x * Math.cos(-bird.degree) - bird.y * Math.sin(-bird.degree);
				var y = bird.y * Math.cos(-bird.degree) + bird.x * Math.sin(-bird.degree);
				ctx.drawImage(birdImage,0,bird.index*birdImage.height/3,birdImage.width,birdImage.height/3,x,y,bird.width,bird.height);
				ctx.restore();
			}
		}
		return bird;
	}

	var Pipes = function(assets){
		var pipesImage = assets.pipes;
		var up = 815,down=955,realWidth = 130,realHeight = 700;
		var pipesWidth = 65;
		var spaceHeight = 150;
		var downHeight = 100+Math.random()*200;
		var upHeight = skyHeight+cloudsHeight+buildingsHeight - spaceHeight - downHeight;
		var rate = realWidth/pipesWidth;

		var pipes = {
			x:canvas.width,
			y:0,
			width: pipesWidth,
			height:upHeight+downHeight+spaceHeight,
			up:{
				x:0,
				y:0,
				width:pipesWidth,
				height:upHeight
			},
			down:{
				x:0,
				y:0,
				width:pipesWidth,
				height:downHeight
			},
			update:function(){
				pipes.x -= backgroundVolicity;
				pipes.up.x = pipes.x+pipesWidth/2 ;
				pipes.up.y = pipes.y+upHeight/2 ;
				pipes.down.x = pipes.x + pipesWidth/2 
				pipes.down.y = pipes.y + upHeight+spaceHeight+downHeight/2;
				if(pipes.x<-pipesWidth){pipes.remove=true};
			},
			draw:function(){
				ctx.drawImage(pipesImage,up,realHeight-upHeight*rate,realWidth,upHeight*rate,pipes.x,pipes.y,pipesWidth,upHeight);
				ctx.drawImage(pipesImage,down,0,realWidth,downHeight*rate,pipes.x,pipes.y+upHeight+spaceHeight,pipesWidth,downHeight);
			}
		}
		return pipes;

	}


	var rollBackgroundImage =  function(image,x,y,width,height,rollSpeed){
		var roll = {
			x: x,
			y: y,
			update:function(){
				var x = roll.x ;
				var snapX = x % (width||image.width);
				roll.x = snapX - rollSpeed;
			},
			draw:function(){
				if(image.width!==0){
					var l = canvas.width/(width||image.width) + 1;
					for(var i=0; i<=l ; i++){
						if(width && height){
							ctx.drawImage(image, roll.x + width*i , roll.y ,  width , height);
						}else{
							ctx.drawImage(image, roll.x + image.width*i , roll.y);
						}
					}
				}
			}
		}
		return roll;
	}


	var Background = function(assets){

		var cloudsImage = rollBackgroundImage( assets.clouds , 0 , skyHeight , assets.clouds.width*cloudsHeight/assets.clouds.height, cloudsHeight  , 0.1);

		var buildingsImage = rollBackgroundImage( assets.buildings , 0 , skyHeight+cloudsHeight , assets.buildings.width*buildingsHeight/assets.buildings.height, buildingsHeight, 0.2);
		
		var floorImage =  rollBackgroundImage( assets.floor , 0 , skyHeight+cloudsHeight+buildingsHeight , assets.floor.width*floorHeight/assets.floor.height, floorHeight , backgroundVolicity);
		
		var height = canvas.height - groundHeight;

		var background = {
			x: 0,
			y: 0,
			update:function(){
				cloudsImage.update();
				buildingsImage.update();
				floorImage.update();
			},
			draw:function(){
				ctx.fillStyle = '4AC3CE';
				ctx.fillRect(0,0,canvas.width,skyHeight);
				cloudsImage.draw();
				buildingsImage.draw();
				floorImage.draw();
				ctx.fillRect(0,0,canvas.width,assets.floor.height);
				ctx.fillStyle = 'DEDB94';
				ctx.fillRect(0,height,canvas.width,canvas.height-height);
			}
		}
		return background;
	}

	var collison = function(){
		var bird = gameObjects[1];
		for(var i=2;i<gameObjects.length;i++){
			if(isRectCross(bird,gameObjects[i].up)||isRectCross(bird,gameObjects[i].down))
			{
				return true;
			}
		}
		return false;
	}

	var isRectCross = function(rect1,rect2){
		return Math.abs(rect1.x-rect2.x)<(rect1.width+rect1.width)/2
		&& Math.abs(rect1.y-rect2.y)<(rect1.height+rect2.height)/2;
	}

	var gameLoop = function(){
		if(pause){
			return;
		}
		var newGameObjects = [];
		gameObjects.forEach(function(item){
			if(!item.remove){
				newGameObjects.push(item);
				item.update();
				item.draw();
			}
		});
		gameObjects = newGameObjects;
		funcList.forEach(function(func){
			func(gameObjects);
		})
		setTimeout(gameLoop,1000/speed);
	}

	loadAsset([
			imageAsset('buildings','image/buildings.jpg'),
			imageAsset('clouds','image/clouds.jpg'),
			imageAsset('floor','image/floor.jpg'),
			imageAsset('sprites','image/sprites.gif'),
			imageAsset('birds','image/birds.gif')
			],
	function(assets){

		var backgroundObject = Background({
			clouds:assets.clouds,
			buildings:assets.buildings,
			floor: assets.floor
		})

		gameObjects.push( backgroundObject );

		var bird = Bird( {
			bird: assets.birds
		} )

		gameObjects.push( bird );

		var addPipe = function(){
			var p = Pipes({ pipes: assets.sprites });
			gameObjects.push(p);
			var time = 150*1000/(speed*backgroundVolicity) * (1+Math.random()) ;
			setTimeout(addPipe,time);
		}

		document.addEventListener('click',function(){
			bird.fly();
		})

		gameLoop();
		addPipe();


	});


})()
