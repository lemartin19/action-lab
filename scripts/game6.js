console.log("GAME 6 SCRIPT IS OPENED");

var doc = document;
var field_dimensions, window_bounds, ball, house, id = null;
var is_setup = 0, ballv = 0, movement = 0, trial = 0, points = 0;
var vx = [3.5,4,4.5,5], vy = [-3.25,-3.714,-4.179,-4.643], ay  = [.03,.0392,.0496];
var velx = 0, vely = 0, accely = 0, locx = 0, locy = 0;

var xml = "<query><data>data:text/plain;charset=utf-8,"; //string to become output csv

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
  house = doc.getElementById('house');
}

function setup() {
  id = null;
  locx = 10;
  locy = 7*field_dimensions.height/8;;
  ball.style.left = locx + 'px';
  ball.style.top = locy + 'px';
  var num = Math.floor(Math.random());
  velx = vx[num];
  vely = vy[num];
  accely = ay[num];
  is_setup = 1;
}

function frame() {
  locx += ballv*velx;
  locy += ballv*vely;
  vely += accely;
  ball.style.left = locx+ 'px';
  ball.style.top = locy + 'px';
}

//mouse click
function checkClick(e) {
  if (trial >= 15) {
    var link = doc.createElement('a');
		link.setAttribute('href', '/game_finished' + points);
		document.body.appendChild(link); // Required for FF
		link.click();
    return 0;
  }
  house.style.opacity = 1;
  if (ballv) {
    ballv = 0;
    score();
    clearInterval(id);
    house.style.opacity = .3;
  }
  else if (is_setup) {
    id = setInterval(frame, 5);
    is_setup = 0;
    ballv = 1;
  }
  else { 
    setup();
  }
}

function score() {
  trial++;
  if ((locx+ball.getBoundingClientRect().width/2+field_dimensions.left)>window_bounds.left
   && (locx+ball.getBoundingClientRect().width/2+field_dimensions.left)<window_bounds.right) {
    //check if it was super precise
    var newElement = doc.createElement('div'); //create new div to show points on field
    newElement.className = 'point trials';
    newElement.id = 'trial' + trial;
    newElement.style.top = '5px';
    newElement.style.left = 5+(5 + ball.getBoundingClientRect().width)*points + 'px';
    newElementChild = doc.createElement('div');
    newElementChild.className = 'circle';
    newElement.appendChild(newElementChild);
    doc.getElementById('game_field').appendChild(newElement);
    points++;
  }
}

//download csv file
function downloadData() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST","/data");
  xmlhttp.setRequestHeader('Content-Type', 'text/xml');
  xml += "</data><game>1</game><trials>" + trial + "</trials><points>" + points + "</points></query>";
  xmlhttp.send(xml);
}