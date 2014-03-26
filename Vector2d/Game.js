function drawBackground(canvas){
	var ctx = canvas.getContext('2d');
	ctx.save();
	ctx.globalAlpha = 0.4;

	var linGrad = ctx.createLinearGradient(0,0,0,canvas.height);
	linGrad.addColorStop(0,'#00BFFF');
	linGrad.addColorStop(0.5,'#FFF');
	linGrad.addColorStop(0.5,'#55DD00');
	linGrad.addColorStop(1,'#FFF');

	ctx.fillStyle = linGrad;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.restore();
}


var canvas = document.getElementById('canvas');
var cannon = Cannon(canvas, 50, canvas.height / 2 - 20);
setInterval(function(){

	drawBackground(canvas);

		cannon.move();
		cannon.draw();
		cannon.balls.forEach(function(ball){
		   if(!ball.removeMe){
		   	 ball.move();
			 ball.draw();
		   }
		});

},100);