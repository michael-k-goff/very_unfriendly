function attack(timestamp) {
	if (gameState.target < 0) {return;}
	// If the target moves out of range, target is lost
	enemy = gameState.Enemies[gameState.target];
	d = Math.sqrt((gameState.x-enemy.x)*(gameState.x-enemy.x)+(gameState.y-enemy.y)*(gameState.y-enemy.y));
	if (d > gameState.range) {
		gameState.target = -1;
		return;
	}
	// Do the attack
	gap = 1000000 / Math.max((gameState.frequency-enemy.dodge),1);
	if (1000+enemy.dodge > gameState.frequency) {
		gap = 2000+enemy.dodge-gameState.frequency;
	}
	if (Math.floor(timestamp/gap) == Math.floor(old_time/gap)) {return;}
	damage = getDamageToEnemy();// Vary this by attack power, enemy defense, etc.
	enemy.messages = enemy.messages.concat([[damage.toString(),timestamp,[0,0,0]]]);
	enemy.hp -= damage;
	if (enemy.hp <= 0) {
		enemyDefeat(enemy,timestamp);
		gameState.target = -1;
	}
}

function getDamageToEnemy(enemy) {
	return (1+Math.floor(Math.pow(gameState.attack,2)*(Math.random()+1)/20));
}

// Process enemy defeat
function enemyDefeat(enemy,timestamp) {
	enemy.alive = 0;
	enemy.defeat_time = timestamp;
	gameState.exp += enemy.exp;
	if (gameState.exp >= ExpNextlevel()) {LevelUp();}
}

function ExpNextlevel() {
	lv = gameState.level;
	return (3+3*lv + Math.pow(lv,2) + 2*Math.pow(lv-1,3) + Math.pow(lv-2,4));
}

function LevelUp() {
	gameState.exp = 0;
	gameState.level += 1;
	hp_gain = Math.floor((Math.random()/2+2)*gameState.level);
	gameState.HP += hp_gain;
	gameState.MaxHP += hp_gain;
	gameState.regen += 0.1*Math.floor(Math.random()*gameState.level);
	gameState.attack += Math.floor(Math.random()*3);
	gameState.range += 3+Math.floor(Math.random()*5);
	gameState.accuracy += Math.floor(Math.random()*3);
	gameState.frequency += 50;
}

function enemyAttack(enemy,timestamp) {
	enemy.charging = 1;
	enemy.last_attack = timestamp;
	damage = Math.floor(1+(0.5*Math.random()/2)*enemy.attack);
	gameState.HP -= damage;
	addMessage(damage.toString(),timestamp,[256,0,0])
	if (gameState.HP <= 0) {Death();}
}

function Regen(timestamp) {
	gameState.regenAmt += (timestamp-old_time)/1000 * gameState.regen;
	hp = Math.floor(gameState.regenAmt);
	gameState.regenAmt -= hp;
	gameState.HP = Math.min(gameState.MaxHP, gameState.HP+hp);
}

// What happens when you run out of HP
function Death() {
	gameState.exp = 0;
	gameState.HP = Math.floor(gameState.MaxHP/10);
	gameState.Enemies = [];
	gameState.x = 500;
	gameState.y = 950;
}