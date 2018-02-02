console.log("GAME 5 SCRIPT IS OPENED");

var doc = document;
var id = null, net, field_dimensions, boxtop;
var wait = [1000, 1250, 1500];
var trial = 0, points = 0;
var stage = 0, timer = 0, w = 0, net_offset = 0;
var start = 0, date = 0;

var csvContent = "data:text/csv;charset=utf-8,"; //string to become output csv

var RANDOMTABLE = [0,0,0,2,2,2,2,1,2,1,0,1,0,0,0,1,2,1,1,2,2,2,2,0,0,0,2,0,1,1,0,2,1,0,1,1,2,2,1,2,0,0,0,1,2,0,2,0,2,2,1,1,2,0,1,2,2,2,1,1,1,2,2,2,1,2,0,1,0,1,2,1,0,1,0,1,0,0,1,1];

var success = new Audio("../sounds/success.mp3");
var fail = new Audio("../sounds/fail.mp3");

/*
- set up game
    ~ cheese ball at specific height
    ~ blue box outline
    ~ basket at y level of mouse
STAGE0: net not in box
STAGE1: net in box, counting down
STAGE2: mouse on screen, cheese counting down
*/

// declare variables and objects used in game
function declareVariables() {
  net = doc.getElementById('net');
  net_offset = 47/2; //net height / 2
  cheese = doc.getElementById('cheese');
  field_dimensions = doc.getElementById('game_field').getBoundingClientRect();
  boxtop = doc.getElementById('starting_box').getBoundingClientRect().top;
  date =  new Date();
  w = RANDOMTABLE[date % RANDOMTABLE.length];
}

function setup() {
  setTimeout(function() {doc.getElementById("cheese").src="../images/Slide1.jpg"}, 500);
  stage = 0; //reset stage
  clearInterval(id); //stop animation
  id = null;
  mouse.style.opacity = 0;
  timer = 0;
  w = RANDOMTABLE[date % RANDOMTABLE.length];
}

// animate cheese loss or mouse appearance
function frame() {
  if (stage <= 1) {
    doc.getElementById('mouse').style.opacity = 0;
    timer = stage==0 ? 0 : (timer+5);
    stage += timer>=wait[w] ? 1 : 0;
    start = Date.now();
  }
  else {
    doc.getElementById('mouse').style.opacity = 1;
    if (Math.floor((Date.now()-start)/100)+1 >= 9) {
      doc.getElementById("cheese").src="../images/Slide9.jpg";
    }
    else {
      doc.getElementById("cheese").src="../images/Slide" + (Math.floor((Date.now()-start)/100)+1) + ".jpg";
    }
  }
}

// when user moves, check if game continues or if mouse is caught
function checkMotion(e) {
  csvContent += stage + ", " + e.clientX + ", " + e.clientY + ", " + timer + "\n" ; 
  if (e.clientY-net_offset>field_dimensions.top && ((e.clientY+net_offset)<field_dimensions.bottom)) {
    net.style.top = (e.clientY - net_offset - field_dimensions.top) + 'px';
  }
  doc.getElementById('starting_box').style.borderColor = net.getBoundingClientRect().top>boxtop ? "blue" : "red"; //make bound box red if out of box
  stage += (stage==0 && net.getBoundingClientRect().top>boxtop) ? 1 : 0;
  if (stage == 1 && trial < 15) {
    id = id==null ? setInterval(frame,5) : id;
  }
  else if (stage == 2 && e.clientY <= mouse.getBoundingClientRect().bottom) { //stop game once mouse is caught
    var img = (Math.floor((Date.now()-start)/100)+1) >= 9 ? 9 : Math.floor((Date.now()-start)/100)+1;
    score(img); //add score to scoreboard
    setup();
  }
}

function score(img) {
  var newElement = document.createElement('img'); //create new div to show points on field
  newElement.src = "../images/Slide" + img + ".jpg";
  newElement.className = 'remove_reset';
  newElement.id = 'trial' + trial;
  newElement.style.left = (cheese.getBoundingClientRect().width)*points-1 + 'px';
  newElement.style.height = '50px';
  doc.getElementById('play').appendChild(newElement);
  points++;
  trial++;
}

//download csv file
function downloadData() {
	var encodedUri = encodeURI(csvContent);
	var link = doc.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "game1_data.csv");
	document.body.appendChild(link); // Required for FF
	link.click();
}