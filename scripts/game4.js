console.log("GAME4 SCRIPT IS OPENED"); //make sure the script has opened

var trial = 0;
var points = 0;
var id = null; //checks if ball is already being thrown
var guess = false, is_setup = false;
var doc = document; //prevents continuous retrieval of different variables
var ball, field_dimensions, house_dimensions;

var mice = [], mouse;
var yv;
var xpos, ypox, xvel, yvel, yacc;

var csvContent = "data:text/csv;charset=utf-8,"; //string to become output csv

var success = new Audio('../sounds/success.mp3');
var fail = new Audio('../sounds/fail.mp3');
var date = 0, curDate = 1000;

//function to declare variables
function declareVariables()  {
	ball = doc.getElementById('ball');
	field_dimensions = doc.getElementById('game_field').getBoundingClientRect();
	mice = doc.getElementsByClassName('mouse');				//get all "mice" elements
	yv = [-5.57,-5.12,-4.67];
	xvel = 3.6;
	yacc = 0.05;
	setup();
}

//animates the ball's motion
function frame() {
	if (xpos > house_dimensions.left + house_dimensions.width/2) {	//once ball is no longer visible
		clearInterval(id);					//stop animating
		id = null;
		thrown = true;

		xpos = mice[mouse].getBoundingClientRect().left+mice[mouse].getBoundingClientRect().width/2-ball.getBoundingClientRect().width/2-field_dimensions.left;	//move ball behind mouse head
		ypos = mice[mouse].getBoundingClientRect().top+mice[mouse].getBoundingClientRect().height/2-ball.getBoundingClientRect().height/2-field_dimensions.top;
		ball.style.top = ypos + 'px';
		ball.style.left = xpos +'px';
	}
	else {
	        xpos += xvel;					//move ball a little bit (animating)
        	ypos += yvel;
        	yvel += yacc;
        	ball.style.top = ypos + 'px';
        	ball.style.left = xpos + 'px';
	}
}

function checkAction(e) {
	if (!id) {						//if the game is animating
		if (guess && !is_setup) {			//if the ball is not in place or the number of trials has been reached
			if (trial == 15) {
				var link = doc.createElement('a');
				link.setAttribute('href', '/game_finished' + points);
				document.body.appendChild(link); // Required for FF
				link.click();
			}
			setup();
      doc.getElementById('push').getElementsByTagName("p")[0].innerHTML = "throw ball";
			trial++;
			guess = false;
		}
		else if (is_setup) {
			csvContent += "mouse: " + mouse + ", ";
			house_dimensions = doc.getElementById("house").getBoundingClientRect();
			id = setInterval(frame,5);
			is_setup = false;
		}
		else {
			if (mouse == checkButton(e.clientX-field_dimensions.left,e.clientY)) {//if they clicked in the right mouse
				seeMice(0.0);				//show ball location
				score();				//mark success
				success.currentTime = 0;
				success.play();
				guess = true;
			}
			else if (mice.length != checkButton(e.clientX,e.clientY)) {
				seeMice(0.0);
				fail.currentTime = 0;
				fail.play();
				guess = true;
			}
		}
	}
}

//check which button the user clicked in
function checkButton(e) {
  if (!id && !is_setup && !guess) {
    var x = e.clientX;
    var y = e.clientY;
    console.log("x: " + x + ", y: " + y);
    for (var i = 0; i < mice.length; i++) {
      console.log("checking mouse " + i);
      console.log("right: " + mice[i].getBoundingClientRect().right + ", left: " +mice[i].getBoundingClientRect().left);
      if (x < mice[i].getBoundingClientRect().right && x > mice[i].getBoundingClientRect().left &&
          y < mice[i].getBoundingClientRect().bottom && y > mice[i].getBoundingClientRect().top)	{
            console.log("inside mouse");
        csvContent += "guess:, " + i + "\n";
        if (i == mouse) {
          seeMice(0.0);
          score();
          success.currentTime = 0;
          success.play();
        }
        else {
          seeMice(0.0);
          fail.currentTime = 0;
          fail.play();
        }
        doc.getElementById('push').getElementsByTagName("p")[0].innerHTML = "reset";
      }
    }
    guess = true;
  }
}

//turn mice semi-transparent
function seeMice(opaque) {
	for (var index = 0; index < mice.length; index++)  {
		mice[index].style.opacity = 0.5+0.5*opaque;
	}
}

//resets ball velocities and position, stops animation
function setup() {
	is_setup = true;
	thrown = false;

	mouse = Math.floor(Math.random()*3);	
	xpos = 10; 					//resets ball position
	ypos = 7*field_dimensions.height/8;
	yvel = yv[mouse];
    ball.style.top = ypos + 'px'; 			//redraw ball at start
    ball.style.left = xpos + 'px';
	seeMice(1.0);

    date = new Date();
    csvContent += "\n";
}

//adds a point to scoreboard
function score() {
	var newElement = document.createElement('img');	//create new div to show points on field
	newElement.src = '../images/slide1.jpg';
	newElement.className = 'remove_reset cheese';
	newElement.id = 'trial' + trial;
	newElement.style.left = 3 + (3 + ball.getBoundingClientRect().width)*points + 'px';
	doc.getElementById('game_field').appendChild(newElement);
	points++;						//add to number of points
}

//resets game
function reset() {
	var paras = doc.getElementsByClassName('remove_reset');
	while(paras[0]) {
		paras[0].parentNode.removeChild(paras[0]);
	}
	doc.getElementById('play').style.opacity = 1;
	setup();
	csvContent = "data:text/csv;charset=utf-8,";
	trial = 0;
	points = 0;
}

//download csv file
function downloadData() {
	var encodedUri = encodeURI(csvContent);
	var link = doc.createElement('a');
	link.setAttribute('href', encodedUri);
	link.setAttribute('download', 'game1_data.csv');
	doc.body.appendChild(link); // Required for FF
	link.click();
}