function Sprite(options){

	var sprite = {
		x:  0,
		y:  0,
		width:  0,
		height: 0,
		image: [],
		update:function(){},
		draw:function(){}
	}

	return sprite;

}

Sprite.extend =  function(klass){
	
}