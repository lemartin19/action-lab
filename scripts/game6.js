console.log("GAME 6 SCRIPT IS OPENED");

var doc = document;
var field_dimensions, window_bounds, ball, id = null;
var ballv = 0, movement = 0, trial = 0, points = 0;
var vx = [.1,.15,.125,.075], vy = [.5,.75,.625,.375];
var accelx= 0, accely  = -.1, velx = 0, vely = 0, locx = 0, locy = 0;

var success = new Audio("../sounds/success.mp3");
var fail = new Audio("../sounds/fail.mp3");

/*
game steps:
- set up game
- 15 trials:
	~ user clicks, ball thrown
	~ user clicks again, ball freezes/house turns transparent/noise
	~ count success, super success, or failure
*/

// setup variables
function declareVariables() {
	//ballx and y, v, am vel set up?
	field_dimensions = doc.getElementById('game_field').getBoundingClientRect();
	window_bounds = doc.getElementById('window').getBoundingClientRect();
	ball = doc.getElementById('ball');
}

function setup() {
	locx = 10;
	locy = 300;
	ball.style.left = locx + 'px';
	ball.style.top = locy + 'px';
	var num = Math.floor(Math.random()*4);
	velx = vx[num];
	vely = vy[num];
}

function frame() {
	locx += ballv*velx;
	locy += ballv*vely;
	//velx += accelx;
	//vely += accely;
	ball.style.left = locx+ 'px';
	ball.style.top = locy + 'px';
}

//mouse click
function checkClick(e) {
	if (ballv) {
		score();
		clearInterval(id);
	}
	ballv = !(ballv||id) ? 1 : 0;
	id = ballv ? null : setInterval(frame, 5);
}

function score() {
	trial++;
	if (locx>window_bounds.left && locy<window_bounds.right) {
		//check if it was super precise 
		var newElement = document.createElement('div');	//create new div to show points on field
		newElement.className = 'point trials';
		newElement.id = 'trial' + trial;
		newElement.style.left = 5 + (ball.getBoundingClientRect().width)*points + 'px';
		newElementChild = doc.createElement('div');
		newElementChild.className = 'circle';
		newElement.appendChild(newElementChild);
		doc.getElementById('game_field').appendChild(newElement);
		points++;
	}
}