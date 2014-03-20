var Game = function(options){
	var self = this;
	this.grid = new Grid({x_cell_count: 12,y_cell_count: 20});
	this.pen = new Pen({
		canvas: document.getElementById('canvas'),
		cell_size: 30,
		grid: self.grid
	});
	this.preview = new Pen({
		canvas: document.getElementById('preview'),
		cell_size: 30,
		grid: new Grid({x_cell_count: 5,y_cell_count: 4})
	})
	this.speed = 2;
	this._pause = false;
	this._score = 0;
	this.init();
}

Game.prototype.init = function(){
	var self = this;
	EventBus.on('move',function(direction){
		if(!self._pause){
			if(self.current_shape)self.current_shape['move'+direction]();
			self.pen.drawGrid();
		}
	});
	EventBus.on('pause',function(){
		console.log('pause');
		self.pause();
	});
	EventBus.on('restart',function(){
		self.restart();
	});
}

Game.prototype.createRandomShape = function(){
	var self = this;
	return new Shape({
		x: Math.floor( self.grid.x_cell_count / 2 ),
		y: -2,
		type: Math.floor( Math.random(+new Date())* Shape.shape_type.length ),
		grid: self.grid
	})
}

Game.prototype.restart =  function(){
	var self = this;
	showMask(false);
	showBest();
	if(self.timeout == null){
		self.current_shape = null;
		self.next_shape = null;
		self._score = 0;
		self.score(0);
		self.showPreview(null);
		self.grid.clean();
		self._pause = false;
		self.start();
	}else{
		self._pauseFunc = function(){
			self.current_shape = null;
			self.next_shape = null;
			self._score = 0;
			self.score(0);
			self.showPreview(null);
			self.grid.clean();
			self._pause = false;
			self._pauseFunc = null;
			self.start();
		}	
		self._pause = true;
	}
	
}

Game.prototype.start = function(){
	var self = this;
	self.current_shape = self.current_shape || self.createRandomShape();
	self.next_shape = self.next_shape || self.createRandomShape();
	clearTimeout(self.timeout);
	function gameLoopFunc(){
		if(self._pause){
			clearTimeout(self.timeout);
			self.timeout = null;
			if(self._pauseFunc)self._pauseFunc();
			return;
		}
		var isDown = self.current_shape.moveDown();
		if(!isDown){
			if( self.current_shape.isReachTheTopOfGrid() ){
				self.timeout = null;
				return self.gameOver();
			}
			var row_count = self.grid.checkFull( self.current_shape.cells() );
			self.score(row_count);
			self.pen.drawGrid();
			self.current_shape = self.next_shape;
			self.next_shape = self.createRandomShape();
			setTimeout(function(){
				self.showPreview( self.next_shape );
			},4000/self.speed);
			// self.pen.drawShape(self.current_shape);
		}
		self.pen.drawGrid();
		self.timeout = setTimeout(gameLoopFunc,1000/self.speed);
	}
	gameLoopFunc();
	setTimeout(function(){self.showPreview( self.next_shape )},2000);
}

Game.prototype.gameOver = function(){
	showMask(true,'游戏结束！');
	var best = window.localStorage.getItem('best');
	if(this._score>best)window.localStorage.setItem('best',this._score);
	showBest();
}

function showMask(show,text){
	var mask_El = document.getElementById('mask');
	var mask_text_El = document.getElementById('mask-text');
	mask_text_El.innerHTML = text;
	mask_El.style.display = show? 'block' : 'none';
}

Game.prototype.pause = function(){
	this._pause = !this._pause;
	showMask(true,'||');
	if(!this._pause){
		showMask(false,'');
		this.start();
	}
}

Game.prototype.showPreview = function( next_shape ){
	var self = this;
	self.preview.clean();
	if(!next_shape)return;
	var show_map = {
		0: [ 2   , 2 ],
		1: [ 2   , 2 ],
		2: [ 2   , 2 ],
		3: [ 2   , 2 ],
		4: [ 2   , 2 ],
		5: [ 2.5 , 2 ],
		6: [ 1.5 , 1.5 ]
	}
	self.preview.drawShape( new Shape({
			x: show_map[next_shape.type][0],
			y: show_map[next_shape.type][1],
			type: next_shape.type,
			grid: self.preview.grid
	}));
}

Game.prototype.score = function(row){
	var scoreMap = [ 0 , 20 , 60 , 100 , 140 ];
	this._score += scoreMap[row];
	document.getElementById('score').innerHTML = this._score;
}

function showBest(score){
	document.getElementById('best').innerHTML = window.localStorage.getItem('best') || 0;
}

var game = new Game();
EventBus.listen();
game.restart();
