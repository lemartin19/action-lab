console.log("GAME1 SCRIPT IS OPENED"); //make sure the script has opened

var trial = 0, points = 0;
var id = null; //checks whether ball is already being thrown
var doc = document; //prevents continuous retrieval of different variables
var net, ball, field_dimensions, netBounds;
var checkX, checkY, above;
var start_top;

var xv, yv;
var xpos, ypos, xvel, yvel, yacc;

var xml = "<query><data>data:text/plain;charset=utf-8,"; //string to become output csv

var date = 0, curDate = 1000;

var RANDOMTABLE = [0,0,0,2,2,2,2,1,2,1,0,1,0,0,0,1,2,1,1,2,2,2,2,0,0,0,2,0,1,1,0,2,1,0,1,1,2,2,1,2,0,0,0,1,2,0,2,0,2,2,1,1,2,0,1,2,2,2,1,1,1,2,2,2,1,2,0,1,0,1,2,1,0,1,0,1,0,0,1,1];

function declareVariables() {
	ball = doc.getElementById("ball");
	net = doc.getElementById("net");
	field_dimensions = doc.getElementById("game_field").getBoundingClientRect();
	start_top = doc.getElementById("starting_box").getBoundingClientRect().top;

	xv = [3.7,3.9,4.1];
	yv = [-4.7,-4.5,-4.3];
	yacc = 0.04;
	setup();
}

//animates the ball's motion and checks location in comparison to net
function frame() {
	netBounds = net.getBoundingClientRect();	//get net location
	checkX = field_dimensions.left + xpos + ball.offsetWidth/2;			//get ball location (center)
	checkY = field_dimensions.top + ypos + ball.offsetHeight/2;

												//add ball center and net center string to give location
	xml += checkX.toString() + ", " + checkY.toString() + ", " + (netBounds.right-netBounds.width/2).toString() + ", " + (netBounds.bottom-netBounds.height/2).toString() + "\n"; 

	if (checkY > field_dimensions.bottom) { 		//if the ball is outside the game field
    var fail = new Audio("../sounds/fail" + Math.ceil(Math.random() * 3) + "/mp3");
		fail.currentTime = 0;
		fail.play();					//play fail sound
		setup();
		return 0;
	} else {						//otherwise
		if (checkX<netBounds.right &&			//if ball is inside net bounds
			checkX>netBounds.left &&
			checkY>netBounds.top && above) {
			score();					//mark score
      var success = new Audio("../sounds/success" + Math.ceil(Math.random() * 3) + ".mp3");
			success.currentTime = 0;
			success.play();
			setup();
			return 0;					//end function
		}

		above = (checkY<netBounds.top);			//was the ball above the net in previous frame
		xpos += xvel;					//move ball a little bit (animating)
		ypos += yvel;
		yvel += yacc;
		ball.style.top = ypos + 'px';
		ball.style.left = xpos + 'px';
	}
}

//draw's net every time the mouse is moved
function drawNet(e) {
	if((e.clientY - net.offsetHeight/2) > field_dimensions.top && (e.clientY + net.offsetHeight/2) < field_dimensions.bottom) {
		net.style.top = e.clientY - field_dimensions.top - net.offsetHeight/2 + 'px'; //draw net centered on mouse
	}
}

//starts ball animation when mouse is clicked
function throwBall() {
	curDate = new Date();				//reset my time
	netBounds = net.getBoundingClientRect()

	//checks if animation is already running, if there have been more than 15 trials,
	//if the net starts in the box, or if there has been enough time since last throw
	if (!id && trial < 15 && netBounds.top > start_top && (curDate - date) > 1000) {
		trial++;
		id = setInterval(frame, 5);

		xml += "xvel:, " + xvel + "\nyvel:, " + yvel + "\nyacc:, " + yacc + "\n";
		xml += "Ball X, Ball Y, Mouse X, Mouse Y\n";
	}
	else if (trial >= 15) {
    window.onbeforeunload = null;
    downloadData();
    var link = doc.createElement('a');
    link.setAttribute('href', '/game_finished' + points);
    doc.body.appendChild(link);
    link.click();
  }
}

//resets ball velocities and position, stops animation
function setup() {
	if (id) {
		clearInterval(id); 				//stop animation
		id = null;					//allow ball to be thrown again
	}

	xpos = 10; 					//resets ball position
	ypos = 7*field_dimensions.height/8;
	date = new Date();
	xvel = xv[RANDOMTABLE[date % RANDOMTABLE.length]];		//reset velocity
	yvel = yv[RANDOMTABLE[date % RANDOMTABLE.length]];
	ball.style.top = ypos + 'px'; 			//redraw ball at start
	ball.style.left = xpos + 'px';
	date = new Date();
}

//when user catches ball, adds to scoreboard
function score() {
	var newElement = document.createElement('div');	//create new div to show points on field
	newElement.className = 'point trials';
	newElement.id = 'trial' + trial;
	newElement.style.left = 3 + (3 + ball.getBoundingClientRect().width)*points + 'px';
	newElement.style.top = 3 + 'px';
	newElementChild = doc.createElement('div');
	newElementChild.className = 'circle';
	newElement.appendChild(newElementChild);
	doc.getElementById('game_field').appendChild(newElement);
	points++;						//add to number of points
}

//resets game
function reset() {
  downloadData();
	var paras = doc.getElementsByClassName('trials');
	while(paras[0]) {
		paras[0].parentNode.removeChild(paras[0]);
	}
	setup();
	xml = "<query><data>";
	trial = 0;
	points = 0;
}

//download csv file
function downloadData() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST","/data/usergame");
  xmlhttp.setRequestHeader('Content-Type', 'text/xml');
  xml += "</data><game>1</game><trials>" + trial + "</trials><points>" + points + "</points></query>";
  xmlhttp.send(xml);
}