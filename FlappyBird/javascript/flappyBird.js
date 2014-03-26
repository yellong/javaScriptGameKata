(function(){

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var speed = 3;
	var pause = false;

	var gameObjects = [];

	var background = function(){
		var buildingsImage = new Image();
		buildingsImage.src = 'image/buildings.jpg';
		var cloudsImage = new Image();
		cloudsImage.src = 'image/clouds.jpg';
		var floorImage = new Image();
		floorImage.src = 'image/floor.jpg';
		var background = {
			x: 0,
			y: 0,
			update:function(){
				background.x=background.x?0:-canvas.width/2;
			},
			draw:function(){
				if(buildingsImage.width!==0){
					var l = canvas.width/buildingsImage.width + 1;
				for(var i=0; i<=l ; i++){
					ctx.drawImage(buildingsImage, background.x + buildingsImage.width*i , canvas.height*2/3);
				}
			}
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

	gameObjects.push(background())

	gameLoop();


})()
