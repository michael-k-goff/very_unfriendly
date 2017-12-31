// Determine whether a given x,y position is valid on the map
function isValidPos(x,y,map,respawn) {
	if (x < 15 || y < 15 || x > map.len-15 || y > map.height-15) {return false;}
	for (var i=0; i<map.blocks.length; i++) {
		block = map.blocks[i]
		if (x < block.r+5 && x > block.l-5 && y < block.t+5 && y > block.b-5) {return false;}
	}
	if (respawn) { // If trying to determine valid positions for respawning enemies, make sure they are off screen
		return (x-offset.x<0 || x-offset.x > 640 || y-offset.y<0 || y-offset.y>480)
	}
	return true;
}

function updatePosition(timestamp) {
	map = gameState.map;
	delta_x = (timestamp - old_time)*(gameState.keys.ArrowRight - gameState.keys.ArrowLeft) * walking_speed;
	delta_y = (timestamp - old_time)*(gameState.keys.ArrowDown - gameState.keys.ArrowUp) * walking_speed;
	new_x = gameState.x + delta_x;
	new_y = gameState.y + delta_y;
	if (isValidPos(new_x,gameState.y,map,0)) {
		gameState.x = new_x;
	}
	if (isValidPos(gameState.x,new_y,map,0)) {
		gameState.y = new_y;
	}
	checkMapFeatures(); // Check for things to happen on the map, such as moving to another world
}

function checkMapFeatures() {
	map = gameState.map;
	threshhold = 40; // Number of pixels one must be to go through a door
	dist_prev = Math.sqrt(Math.pow((gameState.x-map.prev_map[0]),2)+Math.pow((gameState.y-map.prev_map[1]),2))
	if (dist_prev < threshhold) {
		if (gameState.cur_map > 0) {
			goTo(gameState.cur_map-1, 500,50);
		}
		return;
	}
	dist_next = Math.sqrt(Math.pow((gameState.x-map.next_map[0]),2)+Math.pow((gameState.y-map.next_map[1]),2))
	if (dist_next < threshhold) {
		goTo(gameState.cur_map+1, 500,950);
		return;
	}
}

function goTo(map_num,x,y) {
	gameState.cur_map = map_num;
	gameState.map = make_map(gameState.cur_map);
	gameState.x = x;
	gameState.y = y;
	gameState.Enemies = [];
	addEnemies();
}

function getOffset() {
	offset_x = gameState.x-320
	if (offset_x < 0) {offset_x = 0;}
	if (offset_x > map.len-640) {offset_x = map.len-640;}
	offset_y = gameState.y-240
	if (offset_y < 0) {offset_y = 0;}
	if (offset_y > map.height-480) {offset_y = map.height-480;}
	return {x:offset_x, y:offset_y}
}

function drawHero(timestamp) {
	ctx.beginPath();
	var radius = 7;
	ctx.arc(gameState.x - offset.x, gameState.y - offset.y, radius, 0, 2*3.1416, 0);
	ctx.fill();
	displayMessages(offset,timestamp);
}

function drawMap(timestamp) {
	// Draw boundary
	ctx.fillRect(0-offset.x, 0-offset.y, 10, map.height);
	ctx.fillRect(map.len-10-offset.x, 0-offset.y, 10, map.height);
	ctx.fillRect(0-offset.x, 0-offset.y, map.len, 10);
	ctx.fillRect(0-offset.x, map.height-10-offset.y, map.len, 10);
	// Draw interior blocks
	for (var i=0; i<map.blocks.length; i++) {
		block = map.blocks[i];
		ctx.beginPath()
		ctx.rect(block.l-offset_x,block.b-offset_y,block.r-block.l,block.t-block.b);
		ctx.fillStyle = "rgba(128, 128, 128, 1.0)";
		ctx.fill();
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
	}
	// Draw exits
	ctx.beginPath()
	ctx.rect(map.prev_map[0]-10-offset_x,map.prev_map[1]-10-offset_y,20,20);
	ctx.fillStyle = "rgba(256, 256, 200, 1.0)";
	ctx.fill();
	
	ctx.beginPath()
	ctx.rect(map.next_map[0]-10-offset_x,map.next_map[1]-10-offset_y,20,20);
	ctx.fill();
	ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
}

function drawEnemies(timestamp) {
	for (i=0; i<gameState.Enemies.length; i++) {
		enemy = gameState.Enemies[i];
		drawEnemy(enemy,timestamp);
	}
	drawTarget();
}

function drawTarget() {
	if (gameState.target < 0) {return;}
	enemy = gameState.Enemies[gameState.target];
	ctx.fillRect(enemy.x-15-offset.x, enemy.y-20-offset.y, 30,2);
	ctx.fillRect(enemy.x-15-offset.x, enemy.y-12-offset.y, 30,2);
	ctx.fillRect(enemy.x-15-offset.x, enemy.y-20-offset.y, 2,10);
	ctx.fillRect(enemy.x+13-offset.x,  enemy.y-20-offset.y, 2,10);
	// Determine fraction of enemy HP remaining for the purpose of drawing a health bar
	hp_frac = enemy.hp / enemy.max_hp;
	if (hp_frac < 0) {hp_frac = 0;}
	if (hp_frac > 1) {hp_frac = 1;}
	ctx.fillStyle = "rgba(0, 0, 256, 1.0)";
	ctx.fillRect(enemy.x-13-offset.x,  enemy.y-18-offset.y, 26*hp_frac,6);
	ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
}

function addEnemies(respawn = 0) {
	map = gameState.map;
	for (i=gameState.Enemies.length; i<max_enemies; i++) {
		x = Math.floor(Math.random()*map.len);
		y = Math.floor(Math.random()*map.height);
		if (isValidPos(x,y,map,respawn)) {
			enemy = generateEnemy(x,y,gameState.cur_map);
			gameState.Enemies = gameState.Enemies.concat(enemy);
		}
	}
}

function findTarget(x,y) {
	offset = getOffset();
	x = x+offset.x;
	y = y+offset.y;
	nearest_distance = 987654321;
	nearest_target = -1;
	for (var i=0; i<gameState.Enemies.length; i++) {
		enemy = gameState.Enemies[i];
		d = Math.sqrt((x-enemy.x)*(x-enemy.x)+(y-enemy.y)*(y-enemy.y));
		max_d = gameState.accuracy-enemy.evasion;
		if (max_d < 100) {
			max_d = 10000/(200-max_d)
		}
		max_enemy_d = gameState.range-enemy.avoidance;
		if (max_enemy_d < 20) {
			max_enemy_d = 400/(40-max_enemy_d)
		}
		enemy_d = Math.pow((gameState.x-enemy.x)*(gameState.x-enemy.x)+(gameState.y-enemy.y)*(gameState.y-enemy.y),0.5);
		if (d < max_d && enemy_d < max_enemy_d && enemy_d < nearest_distance && enemy.alive) {
			nearest_distance = enemy_d;
			nearest_target = i;
		}
	}
	if (nearest_target > -1) {
		gameState.target = nearest_target;
	}
	return nearest_target;
}

// Remove all enemies that have been defeated for sufficiently long
function removeDeadEnemies(timestamp) {
	for (i=0; i<gameState.Enemies.length; i++) {
		enemy = gameState.Enemies[i];
		if (enemy.alive == 0 && enemy.defeat_time < timestamp-1000) {
			gameState.Enemies.splice(i,1);
			if (gameState.target >= i) {gameState.target -= 1;}
		}
	}
}

function moveEnemies(timestamp) {
	for (i=0; i<gameState.Enemies.length; i++) {
		enemy = gameState.Enemies[i];
		moveEnemy(enemy,timestamp);
	}
}

function moveEnemy(enemy,timestamp) {
	if (!enemy.alive) {return;}
	dist = Math.sqrt((enemy.x-gameState.x)*(enemy.x-gameState.x)+(enemy.y-gameState.y)*(enemy.y-gameState.y)) + 0.0001;
	if (dist > 300) {return;} // Enemies that are far away don't move
	if (dist < enemy.range && enemy.charging == 0) {
		enemyAttack(enemy,timestamp);
	}
	else if (enemy.charging == 1) {
		if (timestamp > enemy.last_attack + 1000) {enemy.charging = 0;}
	}
	
	velocity = [1,-3][enemy.charging];
	new_x = enemy.x + (gameState.x-enemy.x)/dist*velocity;
	new_y = enemy.y + (gameState.y-enemy.y)/dist*velocity;
	
	if (isValidPos(new_x,enemy.y,map,0)) {
		enemy.x = new_x;
	}
	if (isValidPos(enemy.x,new_y,map,0)) {
		enemy.y = new_y;
	}
}

// Add a message over the hero. Typically a damage number, healing number, etc.
function addMessage(text,timestamp,color) {
	gameState.Messages = gameState.Messages.concat([[text,timestamp,color]]);
}

// Display all messages over the hero
function displayMessages(offset,timestamp) {
	for (i=0; i<gameState.Messages.length; i++) {
		m = gameState.Messages[i]
		ctx.fillStyle = "rgba("+m[2][0]+", "+m[2][1]+", "+m[2][2]+", 1.0)";
		ctx.fillText(m[0],gameState.x - offset.x,gameState.y - offset.y-10-0.08*(timestamp-m[1]));
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
		if (timestamp-m[1] > 600) {gameState.Messages.splice(i,1);}
	}
}

function draw(timestamp) {
	drawHero(timestamp);
	drawMap(timestamp);
	drawEnemies(timestamp);
}

function gameUpdate(timestamp) {
	attack(timestamp);
	moveEnemies(timestamp);
	removeDeadEnemies(timestamp);
	Regen(timestamp);
	addEnemies(1);
}