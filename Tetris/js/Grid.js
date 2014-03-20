var Grid = function(options){
	this.x_cell_count =  options.x_cell_count;
	this.y_cell_count =  options.y_cell_count;

	this.cells = [];
	this.build();
}

Grid.prototype.build = function(){
	for(var x=0;x<this.x_cell_count;x++){
		for(var y=0;y<this.y_cell_count;y++){
			this.cells[x] = this.cells[x] || [];
			this.cells[x][y] = 0;
		}
	}
	return this;
}

Grid.prototype.clean = function(){
	this.build();
}

Grid.prototype.setCell = function(options){
	this.cells[options.x][options.y] = options.value;
}

Grid.prototype.setCells = function(cells,value){
	var self = this;
	cells.forEach(function(cell){
		if(cell.x<0 || cell.x>=self.x_cell_count || cell.y<0 || cell.y>=self.y_cell_count)return;
		self.cells[cell.x][cell.y] = value!=null ? value : cell.value;
	});
}

Grid.prototype.getCell =  function(options){
	return this.cells[options.x][options.y];
}

Grid.prototype.eachCell = function(callback){
	for(var x=0;x<this.x_cell_count;x++){
		for(var y=0;y<this.y_cell_count;y++){
			callback({x: x,y: y,value: this.cells[x][y]});
		}
	}
}

Grid.prototype.isCollision = function(from_cells ,to_cells){
	var self = this;
	if(!to_cells){
		to_cells = from_cells;
		from_cells = [];
	}
	self.setCells(from_cells,0);
	for(var i=0;i<to_cells.length;i++){
		var cell = to_cells[i];
		if(cell.x<0 || cell.x>=self.x_cell_count || cell.y>=self.y_cell_count){
			self.setCells(from_cells,1);
			return true;
		}
		var value = self.cells[cell.x][cell.y];
		if(value===1){
			self.setCells(from_cells,1);
			return true;
		}
	}
	return false;
}

Grid.prototype.turnXYtoYX = function(){
	var self = this;
	this._cells = [];
	this.eachCell(function(cell){
		(self._cells[cell.y] || (self._cells[cell.y]=[]))[cell.x] = cell.value;
	})
	return this._cells;
}

Grid.prototype.turnYXtoXY = function(){
	var self = this;
	for(var y=0;y<this.y_cell_count;y++){
		for(var x=0;x<this.x_cell_count;x++){
			self.cells[x][y] = self._cells[y][x];
		}
	}
	return this.cells;
}

Grid.prototype.checkFull = function( check_cells ){
	var self = this;
	if(!check_cells)return;
	var full_rows_key_map = {};
	var full_rows =[];
	self.turnXYtoYX();
	check_cells.forEach(function(cell){
		var y = cell.y;
		var is_full = self._cells[y].reduce(function(m,i){return m+i},0) === self.x_cell_count;
		if(is_full){
			full_rows_key_map[y] = 1;
		}
	});
	for(var row in full_rows_key_map){
		full_rows.push(row);
	}
	full_rows = full_rows.sort(function(a,b){return b-a});
	full_rows.forEach(function(row){
		self._cells.splice(row,1);
	});		
	full_rows.forEach(function(){
		var empty_row = [];
		for(var i=0;i<self.x_cell_count;i++){ empty_row.push(0); }
		self._cells.unshift(empty_row);
	})
	self.turnYXtoXY();
	return full_rows.length;
}