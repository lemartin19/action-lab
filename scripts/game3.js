console.log("GAME3 SCRIPT IS OPENED"); //make sure the script has opened

var trial = 0;
var points = 0;
var id = null; //checks whether ball is already being thrown
var doc = document; //prevents continuous retrieval of different variables
var paddle, ball, field_dimensions, paddleBounds, crocBounds
var checkX, checkY, mouseY, mousevel, ballX_old, ballY_old;
var start_top;

var xv, yv;
var xpos, ypos, xvel, yvel, yacc;

var csvContent = "data:text/csv;charset=utf-8,"; //string to become output csv

var success = new Audio("../sounds/success.mp3");
var fail = new Audio("../sounds/fail.mp3");
var date = 0, curDate = 1000;

function declareVariables() {
	ball = doc.getElementById("ball");
	paddle = doc.getElementById("paddle");
	field_dimensions = doc.getElementById("game_field").getBoundingClientRect();
	crocBounds = doc.getElementById("croc").getBoundingClientRect();
	doc.getElementById("starting_box").style.height = paddle.getBoundingClientRect().height+5+'px';
	start_top = doc.getElementById("starting_box").getBoundingClientRect().top;

	xv = [4.7,4.9,5.1];
	yv = [-3.7,-3.5,-3.3];
	yacc = 0.04;
	setup();
}


//animates the ball's motion and checks location in comparison to paddle
function frame() {
	paddleBounds = paddle.getBoundingClientRect();			//get paddle location
	checkX = field_dimensions.left + xpos + ball.offsetWidth/2;			//get ball location (center)
	checkY = field_dimensions.top + ypos + ball.offsetHeight/2;

	mousevel = ((paddleBounds.top + paddleBounds.height/2)-mouseY)/5; 	//calculate change in mouse position from previous frame

									//add ball center and paddle center string to give location
	csvContent += checkX.toString() + ", " + checkY.toString() + ", " + (paddleBounds.left+paddleBounds.width/2).toString() + ", " + (paddleBounds.top+paddleBounds.height/2).toString() + "\n";// + ", " + yvel + "\n"; 

	if (checkY > field_dimensions.bottom || checkX > field_dimensions.width) {//if the ball is outside the game field
		fail.currentTime = 0;
		fail.play();
		setup();
		return 0;
	} else {
		if (checkX>paddleBounds.left &&	//if ball is inside paddle bounds
			checkX<paddleBounds.right &&
			checkY<paddleBounds.bottom &&
			checkY>paddleBounds.top && (yvel > 0)) {
				yvel = -.65*yvel+.75*mousevel;			//make it bounce off paddle with added velocity
		}
		else if (checkX>field_dimensions.width*.7631 &&		//if in crocs mouth
				checkX<field_dimensions.width*.8184 &&
				ballY_old>(4.36347*ballX_old/field_dimensions.width-3.11397)*field_dimensions.height &&
				checkY<(4.36347*checkX/field_dimensions.width-3.11397)*field_dimensions.height) {
					score(); 				//draw point
					success.currentTime = 0;
					success.play();				//play success sound
					setup();				//reset ball
					return 0;				//end function
		}

		ballX_old = checkX;
		ballY_old = checkY;
		xpos += xvel;						//move ball a little bit (animating)
		ypos += yvel;
		yvel += yacc;
		ball.style.top = ypos + 'px';
		ball.style.left = xpos + 'px';
		mouseY = paddleBounds.top+paddleBounds.height/2;	//give new mouse position for next frame
	}
}

//draw's paddle every time the mouse is moved
function drawPaddle(e) {
	if(!mouseY) {
		mouseY = e.clientY;
	}
	if((e.clientY - paddle.offsetHeight/2) > field_dimensions.top && (e.clientY + paddle.offsetHeight/2) < field_dimensions.bottom) {
		paddle.style.top = e.clientY - field_dimensions.top - paddle.offsetHeight/2 + 'px'; //draw paddle centered on mouse
	}
}

//starts ball animation when mouse is clicked
function throwBall(e) {
	curDate = new Date();
	paddleBounds = paddle.getBoundingClientRect();

	csvContent += "xvel:, " + xvel + "\nyvel:, " + yvel + "\nyacc:, " + yacc + "\n";
	csvContent += "Ball X, Ball Y, Mouse X, Mouse Y\n";

	//checks if animation is already running, if there have been more than 15 trials,
	//if the paddle starts in the box, or if there has been enough time since last throw
	if (!id && trial < 15 && paddleBounds.top > start_top && (curDate - date) > 1000) {
		trial++;
		id = setInterval(frame, 5);
	}
	else if (trial >= 15) {
		var link = doc.createElement('a');
		link.setAttribute('href', '/game_finished' + points);
		document.body.appendChild(link); // Required for FF
		link.click();
	}
}

//resets ball velocities and position, stops animation
function setup() {
	if(id) {
		clearInterval(id); 				//stop animation
		id = null;					//allow ball to be thrown again
	}

	xpos = 15; 					//resets ball position
	ypos = field_dimensions.height/2;
	xvel = xv[Math.floor(Math.random()*3)];		//reset velocity
	yvel = yv[Math.floor(Math.random()*3)];
	ball.style.top = ypos + 'px'; 			//redraw ball at start
	ball.style.left = xpos + 'px';
	date = new Date();
	csvContent += "\n";
}

//when user catches ball, adds to scoreboard
function score() {
	var newElement = document.createElement('div');	//create new div to show points on field
	newElement.className = 'point trials';
	newElement.id = 'trial' + trial;
	newElement.style.left = 5 + (ball.getBoundingClientRect().width)*points + 'px';
	newElementChild = doc.createElement('div');
	newElementChild.className = 'circle';
	newElement.appendChild(newElementChild);
	doc.getElementById('game_field').appendChild(newElement);
	points++;						//add to number of points
}

//resets game
function reset() {
	var paras = doc.getElementsByClassName('trials');
	while(paras[0]) {
		paras[0].parentNode.removeChild(paras[0]);
	}
	setup();
	csvContent = "data:text/csv;charset=utf-8,";
	csvContent += "Ball X, Ball Y, Mouse X, Mouse Y\n";
	trial = 0;
	points = 0;
}

//download csv file
function downloadData() {
	var encodedUri = encodeURI(csvContent);
	var link = doc.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "game3_data.csv");
	document.body.appendChild(link); // Required for FF
	link.click();
}