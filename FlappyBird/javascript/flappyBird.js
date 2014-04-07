(function(){

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var speed = 60;
	var pause = false;

	var gameObjects = [];
	var funcList = [];
	var bird = {};
	var gameScore = {};


	var cloudsHeight = 60;
	var buildingsHeight = 150;
	var floorHeight = 20;
	var groundHeight = 100;
	var skyHeight = canvas.height - groundHeight - floorHeight - buildingsHeight - cloudsHeight;
	var backgroundVolicity = 2.6;

	var crash = true;

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

	var sounds = [
		'fx_rope_swinging_swish_2',
		'fx_punch26',
		'fx_app_game_interactive_alert_tone_016',
		'fx_cartoonish_whip_crack'
	];

	sounds.forEach(function(sound){
		var audio = document.getElementById(sound);
		sounds[sound] = audio;
	});

	var Bird = function(assets){
		var birdImage = assets.bird;
		var s = birdImage.width/(birdImage.height/3);
		var sensitive = 8;
		var width = 70;
		var bird = {
			name:'bird',
			x:canvas.width*0.25,
			y:canvas.height*0.5,
			g:0.2,
			vector: Vector2d(0,0.2),
			degree: 0,
			zIndex: 2,
			width: width-sensitive,
			height: width/s-sensitive,
			index: 0,
			round: 0,
			keepflying:false,
			fly:function(){
				sounds.fx_punch26.play();
				var oldG = bird.g;
				bird.g = -0.3;
				bird.vector.vy = -0.3;
				bird.y -=15;
				setTimeout(function(){
					bird.g = oldG;
				},100);
			},
			update:function(){
				if(bird.y+bird.height/2+sensitive>=skyHeight+cloudsHeight+buildingsHeight){
					sounds.fx_cartoonish_whip_crack.play();
					pause = true;
					gameover();
					return;
				}
				bird.round += 1/10;
				bird.index = (Math.floor(bird.round))%3;
				if(bird.keepflying){
					return ;
				}
				bird.x+=bird.vector.vx;
				bird.y+=bird.vector.vy;
				bird.vector.vy+= bird.g;
				if(bird.vector.vy<0){
					bird.degree = -Math.PI/8;
				}else{
					bird.degree = -15*Math.PI/180 + Math.atan( bird.vector.vy/(bird.vector.vx||backgroundVolicity));
				}

				if(collison()){
					bird.g = 4;
					crash = true;
				}

			},
			draw:function(){
				ctx.save();
				ctx.rotate(bird.degree);
				var x = bird.x * Math.cos(-bird.degree) - bird.y * Math.sin(-bird.degree);
				var y = bird.y * Math.cos(-bird.degree) + bird.x * Math.sin(-bird.degree);
				ctx.drawImage(birdImage,0,bird.index*birdImage.height/3,birdImage.width,birdImage.height/3,
					x-(bird.width+sensitive)/2,y-(bird.height+sensitive)/2,bird.width+sensitive,bird.height+sensitive);
				ctx.restore();
			},
			reset:function(){
				bird.x = canvas.width*0.25;
				bird.y = canvas.height*0.5;
				bird.g = 2;
				bird.degree = 0;
				bird.vector = Vector2d(0,0.2);
				bird.round = 0;
				bird.index = 0;
				bird.keepflying = false;
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
			name:'pipes',
			x:canvas.width,
			y:0,
			width: pipesWidth,
			height:upHeight+downHeight+spaceHeight,
			passed: false,
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

				if(!pipes.passed && pipes.x+pipesWidth<bird.x-bird.width/2-3){
					gameScore.add(1);
					pipes.passed = true;
				}

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

	var firstSence = function(assets){
		var image =assets.sprites;
		return {
			name:'f',
			x:0,
			y:0,
			width:0,
			height:0,
			remove:false,
			update:function(){},
			draw:function(){
				ctx.drawImage(image,0,0,450,120,(canvas.width-300)/2,100,300,75);
				ctx.drawImage(image,470,0,330,244,(canvas.width-200)/2,240,200,140);
			}
		}
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

	var ScoreObject = function(assets){
		var image = assets.sprites;
		var position = [2,422];
		var image_width =68, image_height=88;
		var number_width = 49,number_height=60;
		var score = {
			x:0,
			y:0,
			value:0,
			width:0,
			height:0,
			zIndex:1,
			getScore:function(){
				return score.value;
			},
			setScore:function(v){
				score.value= v;
			},
			update:function(){
			},
			add:function(n){
				score.value+=n;
				sounds.fx_app_game_interactive_alert_tone_016.play();
			},
			draw:function(){
				var score_numbers = score.value.toString().split("");
				var l = score_numbers.length;
				score.width = l*(number_width);
				score.height = number_height;

				score_numbers.forEach(function(num,i){
					ctx.drawImage(image,position[0]+num*image_width,position[1],image_width,image_height,
						(canvas.width/2-score.width/2)+number_width*i,40,number_width,number_height
						);
				})
			}
		}
		return score;
	}

	var NumberImage =  function(options){
		var image = options.assets.sprites,
			x = options.x,
			y = options.y,
			image_x = options.image_x,
			image_y = options.image_y;
		var image_width = options.image_width,
			image_height = options.image_height,
			number_width = options.number_width,
			number_height = options.number_height,
			value = options.value;
		var number = {
			x:0,
			y:0,
			width:0,
			height:0,
			zIndex:1,
			setNumber:function(v){
				value = v;
			},
			getNumber:function(){
				return value;
			},
			update:function(){
			},
			draw:function(){
				var score_numbers = value.toString().split("");
				var l = score_numbers.length;
				number.width = l*(number_width);
				number.height = number_height;

				score_numbers.forEach(function(num,i){
					ctx.drawImage(image,image_x+num*image_width,image_y,image_width,image_height,
						x,y,number_width,number_height
						);
				});
			}
		}
		return number;
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
		if(bird.y+bird.height/2>=skyHeight+cloudsHeight+buildingsHeight){
			sounds.fx_cartoonish_whip_crack.play();
			return true;
		}
		for(var i=0;i<gameObjects.length;i++){
			if(gameObjects[i].name==='pipes'){
				if(isRectCross(bird,gameObjects[i].up)||isRectCross(bird,gameObjects[i].down)){
					sounds.fx_cartoonish_whip_crack.play();
					return true;
				}
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
				if(!item.zIndex){item.zIndex=0}
				newGameObjects.push(item);
			}
		});

		newGameObjects.sort(function(a,b){return a.zIndex-b.zIndex});
		newGameObjects.forEach(function(item){
			item.update();
			item.draw();
		})

		gameObjects = newGameObjects;
		
		setTimeout(gameLoop,1000/speed);
	}

	var LastSence = function(assets){
		var image = assets.sprites;
		var best = NumberImage({
			assets: assets,
			x: 350,
			y: 260,
			number_width: 30,
			number_height: 40,
			image_x: 575,
			image_y: 700,
			image_width: 45,
			image_height: 60,
			value: 0,
		});
		var s = NumberImage({
			assets: assets,
			x: 350,
			y: 340,
			number_width: 30,
			number_height: 40,
			image_x: 575,
			image_y: 700,
			image_width: 45,
			image_height: 60,
			value:0
		});
		return {
			draw:function(){
				var score = gameScore.getScore();
				best.setNumber(window.localStorage.getItem('best'));
				s.setNumber(score);
				ctx.drawImage(image,0,520,500,110,(canvas.width-280)/2,120,300,70);
				ctx.drawImage(image,0,630,570,330,(canvas.width-390)/2,200,400,240);
				var i = 0;
				var d = s.getNumber()- best.getNumber();
				if(d>0){
					i = d>5?2:(d<3?0:1);
					ctx.drawImage(image,575+i*120,770,110,110,78,285,75,75);
				}
				best.draw();
				s.draw();
			}
		}
	}

	var gameover = function(){
		
	}

	var addPipe = function(){}
	var f;

	var start = function(assets){

		ctx.fillRect(0,0,canvas.width,canvas.height);
		gameObjects = [];
		pause = false;

		var backgroundObject = Background({
			clouds:assets.clouds,
			buildings:assets.buildings,
			floor: assets.floor
		})

		backgroundObject.draw();

		gameObjects.push( backgroundObject );

		bird = Bird( {
			bird: assets.birds
		} )

		bird.keepflying = true;
		bird.draw();

		gameObjects.push( bird );

		gameScore = ScoreObject(assets);

		addPipe = function(){
			if(pause){
				return;
			}
			var p = Pipes({ pipes: assets.sprites });
			gameObjects.push(p);
			var time = 150*1000/(speed*backgroundVolicity) * (2+Math.random()) ;
			setTimeout(addPipe,time);
		}
		
		f= firstSence(assets);
		

		gameover = function(){
			pause = true;
			crash = true;
			var best = window.localStorage.getItem('best');
			if(gameScore.getScore()>best){
				window.localStorage.setItem('best',gameScore.getScore());
			}
			var over = LastSence(assets);
			over.draw();
			document.getElementById('restart-btn').style.display = 'block';
		}

		gameObjects.push(f);
		gameLoop();
	}

	

	loadAsset([
			imageAsset('buildings','image/buildings.jpg'),
			imageAsset('clouds','image/clouds.jpg'),
			imageAsset('floor','image/floor.jpg'),
			imageAsset('sprites','image/sprites.gif'),
			imageAsset('birds','image/birds.gif')
			],
	function(assets){
		var oldStart = start;
		start=function(){
			oldStart(assets);
		}
		start();
	});

	document.addEventListener('click',function(){
			if(!crash && !pause){
				bird.fly();
			}
		});

	var rebtn = document.getElementById('restart-btn');


	var btn = document.getElementById('start-btn');

	rebtn.addEventListener('click',function(e){
		start();
		rebtn.style.display = 'none';
		btn.style.display = 'block';
		e.stopPropagation();
	});
		btn.addEventListener('click',function(e){
				addPipe();
				bird.keepflying = false;
				f.remove = true;
				crash = false;
				btn.style.display = 'none';
				gameObjects.push(gameScore);
				if(pause){
					pause = false;
					gameLoop();
				}
				e.stopPropagation();
		});

		



})()
