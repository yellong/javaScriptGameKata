function Cannon(canvas,x,y){
	var ctx = canvas.getContext('2d');
	var mx = 0,
		my = 0,
		angle = 0,
		that = {
			x: x,
			y: y,
			angle: 0,
			removeMe: false,
			balls:[],

			move: function(){
				angle = Math.atan2( my - that.y , mx - that.x);
			},

			draw: function(){
				ctx.save();
				ctx.lineWidth = 2;
				ctx.translate( that.x , that.y );

				ctx.rotate(angle);
				ctx.strokeRect(0,-5,50,10);

				ctx.moveTo(0,0);
				ctx.beginPath();
				ctx.arc(0,0,15,0,Math.PI*2,true);
				ctx.fill();
				ctx.closePath();
				ctx.restore();
			}
		};

	canvas.onmousedown = function(e){
		var v = Vector2d( mx-that.x , my-that.y );
		// v.normalize();
		// v.scale(25);
		that.balls.push( CannonBall(canvas , that.x , that.y , v ) );
	}

	canvas.onmousemove = function(e){
		var bb = canvas.getBoundingClientRect();
		mx = e.clientX - bb.left;
		my = e.clientY - bb.top;
	}

	return that;


}

function CannonBall(canvas,x,y,v){
	var ctx = canvas.getContext('2d');
	var g = 0,
		ball = {

			x: x,
			y: y,
			removeMe: false,

			move: function(){
				v.vy += g;
				g += 0.1;
				ball.x += v.vx;
				ball.y += v.vy;
				if(ball.y > canvas.height/2-20){
					ball.removeMe = true;
				}
			},

			draw: function(){
				ctx.beginPath();
				ctx.arc( ball.x , ball.y , 5 , 0 , Math.PI*2 , true );
				ctx.fill();
				ctx.closePath();
			}


		}

	return ball;
}