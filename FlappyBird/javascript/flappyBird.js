(function(){

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var speed = 5;
	var pause = false;

	var gameObjects = [];

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

	var sprite = function(){}


	var rollBackgroundImage =  function(image,x,y,width,height,rollSpeed){
		var roll = {
			x: x,
			y: y,
			update:function(){
				var x = roll.x ;
				var snapX = x % image.width;
				roll.x = snapX - rollSpeed;
			},
			draw:function(){
				if(image.width!==0){
					var l = canvas.width/image.width + 1;
					for(var i=0; i<=l ; i++){
						if(width && height){
							ctx.drawImage(image, roll.x + image.width*i , roll.y ,  width , height);
						}else{
							ctx.drawImage(image, roll.x + image.width*i , roll.y);
						}
					}
				}
			}
		}
		return roll;
	}


	var background = function(assets){

		var cloudsHeight = assets.clouds.height;
		var buildingsHeight = assets.buildings.height;
		var floorHeight = assets.floor.height;
		var groundHeight = 100;

		var skyHeight = canvas.height - groundHeight - floorHeight - buildingsHeight - cloudsHeight;

		var cloudsImage = rollBackgroundImage( assets.clouds , 0 , skyHeight , null, null  , 5 );

		var buildingsImage = rollBackgroundImage( assets.buildings , 0 , skyHeight+cloudsHeight , null, null, 18);
		
		var floorImage =  rollBackgroundImage( assets.floor , 0 , skyHeight+cloudsHeight+buildingsHeight , assets.floor.width*floorHeight/assets.floor.height, floorHeight , 25);
		
		var height = canvas.height - groundHeight;

		console.log( canvas.height );

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
				ctx.fillStyle = 'D8A94C';
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

		gameObjects.push( background(assets) );
		gameLoop();


	});


})()
