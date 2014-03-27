function Vector2d(x,y){

	var vec ={
		vx:x,
		vy:y,

		scale: function(s){
			vec.vx *= s;
			vec.vy *= s;
		},

		add: function(vec2){
			vec.vx += vec2.vx;
			vec.vy += vec2.vy;
		},

		sub: function(vec2){
			vec.vx -= vec2.vx;
			vec.vy -= vec2.vy;
		},

		negate: function(){
			vec.vx = -vec.vx;
			vec.vy = -vec.vy;
		},

		length: function(){
			return Math.sqrt(vec.vx*vec.vx + vec.vy*vec.vy);
		},

		lengthSquared: function(){
			return vec.vx*vec.vx + vec.vy*vec.vy;
		},

		normalize: function(){
			var len = Math.sqrt(vec.vx*vec.vx + vec.vy*vec.vy);
			if(len){
				vec.vx /= len;
				vec.vy /= len;
			}
			return len;
		},

		rotate: function(angle){
			var vx = vec.vx,
				vy = vec.vy,
				cosVal = Math.cos(angle),
				sinVal = Math.sin(angle);

			vec.vx = vec.vx * cosVal - vec.vy * sinVal;
			vec.vy = vec.vx * sinVal + vec.vy * cosVal;
		},

		toString: function(){
			return "("+vec.vx+","+vec.vy+")";
		}

	}

	return vec;

}