var gameState = {};
var walking_speed = 0.5; // Planning on 0.1 for the real game. Use higher values for testing.
var max_enemies = 5; // Maximum number of enemies on the map at a given time. May move that to individual maps.

// The core of the display loop
old_time = 0;
function initLoop(timestamp) {
	requestAnimationFrame(DisplayLoop);
	initialize()
}
function DisplayLoop(timestamp) {
	requestAnimationFrame(DisplayLoop);
	Increment(timestamp);
	old_time = timestamp;
}
function Increment(timestamp)
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	map = gameState.map;
	updatePosition(timestamp)
	offset = getOffset();
	gameUpdate(timestamp);
	draw(timestamp);
	updateHTML();
}
requestAnimationFrame(initLoop);

// Initalize the game
function initialize() {
	// Initialize event handlers
	canvas = document.getElementById("gameBox");
	ctx = canvas.getContext('2d');
	ctx.font = "15px Arial";
	canvas.addEventListener('mousemove', function(evt) {
	        var mousePos = getMousePos(evt);
			gameState.mouse_x = mousePos.x;
			gameState.mouse_y = mousePos.y;
			findTarget(gameState.mouse_x,gameState.mouse_y);
	}, false);
	canvas.addEventListener('click',function(evt) {
		// So far the click doesn't do anything
	}, false)
	gameState.keys = {"ArrowLeft":0,"ArrowRight":0,"ArrowDown":0,"ArrowUp":0}
	document.addEventListener('keydown',function(evt) {
		gameState.keys[evt.key] = 1;
	}, false)
	document.addEventListener('keyup',function(evt) {
		gameState.keys[evt.key] = 0;
	}, false)
	// Initialize game stats
	gameState.x = 500;
	gameState.y = 950;
	gameState.cur_map = 0;
	gameState.target = -1; // The enemy currently being targeted. If -1, no target.
	gameState.Enemies = [];
	gameState.HP = 10;
	gameState.MaxHP = 10;
	gameState.Messages = []; // Message displayed above the hero
	gameState.exp = 0;
	gameState.level = 1;
	gameState.regen = 0.1;
	gameState.regenAmt = 0;
	gameState.range = 100;
	gameState.accuracy = 20;
	gameState.frequency = 1000;
	gameState.attack = 3;
	gameState.map = make_map(gameState.cur_map);
	addEnemies();
}

// Update the HTML by updating all the key stats
function updateHTML() {
	document.getElementById("hp").innerHTML = gameState.HP;
	document.getElementById("max_hp").innerHTML = gameState.MaxHP;
	document.getElementById("regen").innerHTML = gameState.regen.toFixed(1);
	document.getElementById("attack_power").innerHTML = gameState.attack;
	document.getElementById("range").innerHTML = gameState.range;
	document.getElementById("accuracy").innerHTML = gameState.accuracy;
	document.getElementById("frequency").innerHTML = gameState.frequency/1000;
	document.getElementById("exp").innerHTML = gameState.exp;
	document.getElementById("exp_next").innerHTML = ExpNextlevel();
	document.getElementById("level").innerHTML = gameState.level;
	document.getElementById("location").innerHTML = gameState.cur_map+1;
}

function getMousePos(evt) {
	canvas = document.getElementById("gameBox");
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}