var Pen = function(options){
	this.canvas = options.canvas;
	this.pen = this.canvas.getContext('2d');

	this.grid = options.grid;
	this.cell_size = options.cell_size;
	this.cell_color = options.cell_color || 'CCCCCC';

	this.init();
}

Pen.prototype.init = function(){
	this.width = this.grid.x_cell_count * this.cell_size;
	this.height = this.grid.y_cell_count * this.cell_size;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.pen.fillStyle = this.cell_color;
}

Pen.prototype.clean = function(){
	this.pen.clearRect( 0,0,this.canvas.width,this.canvas.height );
}

Pen.prototype.drawCell = function(options) {
	var pen = this.pen , cell_size = this.cell_size;
	var x = options.x , y = options.y , value = options.value;
	pen.fillStyle = value ? this.cell_color : 'fff' ;
	pen.fillRect(x*cell_size+1,y*cell_size+1,cell_size-1,cell_size-1);
};

Pen.prototype.drawShape = function(shape){
	var self = this;
	var cells = shape.cells();
	cells.forEach(function(cell){
		self.drawCell(cell);
	});
}

Pen.prototype.drawGrid = function(){
	var self = this;
	this.grid.eachCell(function(cell){
		self.drawCell(cell);
	})
}