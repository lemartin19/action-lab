console.log("GAME 5 SCRIPT IS OPENED");

var doc = document;
var id = null, net, field_dimensions, boxtop;
var wait = [80,120,160,200];//longer totally ranrdom between 1 s -> more
var trial = 0, points = 0;
var stage = 0, timer = 0, w = 0, net_offset = 0;

var success = new Audio("../sounds/success.mp3");
var fail = new Audio("../sounds/fail.mp3");

/*
- set up game
	~ cheese ball at specific height
	~ blue box outline
	~ basket at y level of mouse
- if mouse is clicked (stage: 0)
	~ check if basket is in box
	~ set random wait time or do nothing
- count time in 5 millisecond units w/ 4 options (stage: 1)
	~ at end of time, mouse appears
- cheese disappears at a constant rate (stage: 2)
	~ check y location of user
	~ when in range, mouse is caught
- add score to block
*/

// declare variables and objects used in game
function declareVariables() {
	net = doc.getElementById('net');
	field_dimensions = doc.getElementById('game_field').getBoundingClientRect();
	boxtop = doc.getElementById('starting_box').getBoundingClientRect().top;
}

function setup() {
	net_offset = net.getBoundingClientRect().height/2;
	net.style.bottom = '0px';
}

// animate cheese loss or mouse appearance
function frame() {
	if (stage <= 1) {
		doc.getElementById('mouse').style.opacity = 0;
		timer = stage*(timer+1);
		stage += timer>=wait[w] ? 1 : 0;
	}
	else {
		doc.getElementById('mouse').style.opacity = 1;
		//cover the cheese
		//store w and mouse location
	}
}

// start time if user is in box
function checkMouseClick(e) {
	if (stage <= 1 && trial < 15) { //is this the best way to do this???????????????????????????????
		stage = e.clientY>boxtop ? 1 : 0;
		w = Math.floor(Math.random()*4);
		id = stage==1 ? setInterval(frame, 5) : null;
	}
}

// when user moves, check if game continues or if mouse is caught
function checkMotion(e) {
	if (e.clientY-net_offset>field_dimensions.top && ((e.clientY+net_offset)<field_dimensions.bottom)) {
		net.style.top = (e.clientY - net_offset - field_dimensions.top) + 'px';
	}
	else if (stage <= 1) {
		stage = net.getBoundingClientRect().top>boxtop ? stage*1 : 0;
		doc.getElementById('starting_box').style.color = "red"; //make bound box red if loc is 0
	}
	else if (e.clientY<mouse.bottom && e.clientY>mouse.top) { //stop game
		score();
		stage = 0;
		clearInterval(id);
		id = null;
	}
}

function score() {
	var newElement = document.createElement('img');	//create new div to show points on field
	newElement.src = '../images/cheeseball.jpg';
	newElement.className = 'point remove_reset';
	newElement.id = 'trial' + trial;
	newElement.style.left = (100*ball.getBoundingClientRect().width/field_dimensions.width)*points + '%';
	doc.getElementById('play').appendChild(newElement);
	points++;
	trial++;
}