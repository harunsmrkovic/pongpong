var cursorPos = [];
var hostname = "http://178.62.205.41:8080";
(function(){

	var pong = {};
	window.Pong = pong;

	// default field properties
	pong.field = {
		width: 1200,
		height: 500,
		dom: document.getElementById('field'),
		topOffset: 100
	};
	pong.gameOn = false;

	// calculating offset
	pong.field.leftOffset = (window.outerWidth - pong.field.width) / 2;

	// paddle configuration
	pong.paddle = {
		paddles: [
			{
				top: 0,
				dom: document.getElementById('paddle-1')
			},
			{
				top: 0,
				dom: document.getElementById('paddle-2')
			}
		],
		defaults: {
			width: 20,
			height: 150,
		},
		position: -1
	};

	pong.send = true;

	pong.moveOwnPaddle = function(paddleNum){
		var x = cursorPos[0],
				y = cursorPos[1];

		if(y > 0){
			var max_y = pong.field.height - pong.paddle.defaults.height;
			y -= pong.paddle.defaults.height/2;
			y = (y < 0) ? 0 : y;
			y = (y > max_y) ? max_y : y;

			pong.paddle.paddles[paddleNum].top = y;
			// if(pong.send){
				console.log('sending to vedad', y);
				socket.emit('paddle'+pong.paddle.position, y);
				pong.send = false;
			// }
		}
	};

	setInterval(function(){
		pong.send = true;
	}, 8);

	pong.render = function(){
		pong.paddle.paddles[0].dom.style.marginTop = pong.paddle.paddles[0].top;
		pong.paddle.paddles[1].dom.style.marginTop = pong.paddle.paddles[1].top;
	};

	pong.startGame = function(){
		// setting the field dimensions
		pong.field.dom.style.width = pong.field.width;
		pong.field.dom.style.height = pong.field.height;
		pong.field.dom.style.marginTop = pong.field.topOffset;

		// setting paddles
		pong.paddle.paddles[0].dom.style.marginTop = pong.paddle.paddles[0].top;
		pong.paddle.paddles[1].dom.style.marginTop = pong.paddle.paddles[1].top;

		pong.gameOn = true;

		// Start following the other player
		var enemy = Math.abs(1-pong.paddle.position);
		socket.on('paddle'+enemy, function(data){
			pong.paddle.paddles[enemy].top = data;
		});


		setInterval(function(){
			pong.render();
		}, 16);
	}

	pong.stopGame = function(){
		alert('Game stopped');
	}

})();

var socket = io.connect(hostname);
socket.on('game', function(data){ 
	if(data == 1) Pong.startGame();
	else if(data == 0) Pong.stopGame();
});

var paddle = -1;


socket.on('sides', function(returned){
	var val = returned;
	console.log(val);
	
	if(!val){
		// default setting
		determinePaddle(0);
	}
	else {
		if(val[0] == 0 && paddle < 0){
			determinePaddle(0);
		}

		// I AM THE RIGHT PLAYER AND HAVE THE POWER, hence I HAVE THE POWEEEEEER
		if(val[1] == 0 && paddle < 0){
			determinePaddle(1);
		}

		Pong.paddle.yourPaddle = paddle;

		if(val[0] == 1 && val[1] == 1 && paddle < 0){
			alert('No more space to play :(');
		}
	}
});

function determinePaddle(tempPaddle){
	paddle = tempPaddle;
	socket.emit('setSide', paddle);
	Pong.paddle.position = paddle;
};

document.addEventListener('mousemove', function(e){

	cursorPos = [(e.x - Pong.field.leftOffset), (e.y - Pong.field.topOffset)];
	if(Pong.paddle.yourPaddle >= 0){
		Pong.moveOwnPaddle(Pong.paddle.yourPaddle);
	}

});