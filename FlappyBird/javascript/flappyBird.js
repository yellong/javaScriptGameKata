(function(){

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var speed = 5;
	var pause = false;

	var gameObjects = [];
	var funcList = [];


	var cloudsHeight = 60;
	var buildingsHeight = 150;
	var floorHeight = 20;
	var groundHeight = 100;
	var skyHeight = canvas.height - groundHeight - floorHeight - buildingsHeight - cloudsHeight;

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
			x:0,
			y:0,
			g:2,
			vector: Vector2d(2,2),
			width: width,
			height: width/s,
			index: 0,
			fly:function(){
				bird.g = -30;
				setTimeout(function(){
					bird.g = 2;
				},50);
			},
			update:function(){
				bird.x+=bird.vector.vx;
				bird.y+=bird.vector.vy;
				bird.vector.vy+= bird.g;
				bird.index = (bird.index+birdImage.height/3)%birdImage.height;
			},
			draw:function(){
				ctx.drawImage(birdImage,0,bird.index,birdImage.width,birdImage.height/3,bird.x,bird.y,bird.width,bird.height);
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
			update:function(){
				pipes.x-=8;
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

		var cloudsImage = rollBackgroundImage( assets.clouds , 0 , skyHeight , assets.clouds.width*cloudsHeight/assets.clouds.height, cloudsHeight  , 1);

		var buildingsImage = rollBackgroundImage( assets.buildings , 0 , skyHeight+cloudsHeight , assets.buildings.width*buildingsHeight/assets.buildings.height, buildingsHeight, 2);
		
		var floorImage =  rollBackgroundImage( assets.floor , 0 , skyHeight+cloudsHeight+buildingsHeight , assets.floor.width*floorHeight/assets.floor.height, floorHeight , 8);
		
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
			var time = 3000+Math.random()*2000
			setTimeout(addPipe,time);
		}

		document.addEventListener('click',function(){
			bird.fly();
		})

		gameLoop();
		addPipe();


	});


})()
