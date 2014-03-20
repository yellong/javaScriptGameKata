var Shape = function(options){
	this.color = options.color;
	this.x = options.x;
	this.y = options.y;
	this.grid = options.grid;
	this.type = options.type;
	this.relative_cells = Shape.shape_type[this.type];

	this.init();
}

Shape.shape_type = [
	[[0,-1],[-1,0],[0,0],[1,0]],
	[[-1,-1],[0,-1],[0,0],[1,0]],
	[[0,-1],[1,-1],[-1,0],[0,0]],
	[[1,-1],[-1,0],[0,0],[1,0]],
	[[-1,-1],[-1,0],[0,0],[1,0]],
	[[-1,-1],[0,-1],[-1,0],[0,0]],
	[[-1,0],[0,0],[1,0],[2,0]]
]


Shape.prototype.init = function(){
	
}

Shape.prototype.cells = function(shape){
	var self = shape || this;
	return self.relative_cells.map(function(r_cell){
		return {x: self.x+r_cell[0] , y:self.y+r_cell[1] , value: 1 };
	})
}

Shape.prototype.moveUp= function(){
	return this.move(function(shape){
		Shape.prototype.change.call(shape);
	});
}

Shape.prototype.moveDown = function(){
	var isDown = this.move(function(shape){
		shape.y = shape.y + 1;
	});
	//if(!isDown)this.grid.checkFull(this.cells());
	return isDown;
}

Shape.prototype.moveLeft = function(){
	return this.move(function(shape){
		shape.x = shape.x - 1;
	});
}

Shape.prototype.moveRight = function(){
	return this.move(function(shape){
		shape.x = shape.x + 1;
	});
}

Shape.prototype.change = function(){
	this.relative_cells = this.relative_cells.map(Shape.turn90);
}

Shape.prototype.clean = function(){
	var self = this;
	self.grid.setCells(this.cells(),0);
}

Shape.prototype.move = function(moveFunc){
	var self = this;
	var testData = {x: self.x , y: self.y , value: 1 , relative_cells: self.relative_cells}
	moveFunc(testData);
	if(!self.grid.isCollision( self.cells() , self.cells(testData) )){
		self.clean();
		moveFunc(self);
		self.grid.setCells(this.cells(),1);
		return true;
	}
	return false;
}

Shape.prototype.isReachTheTopOfGrid = function(){
	var cells = this.cells();
	for(var i=0;i<cells.length;i++){
		if(cells[i].y<0)return true;
	}
	return false;
}

Shape.turn90 = function(c){
	return [c[1],-c[0]];
}





