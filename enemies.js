// Data on enemies
// Basic assumptions
// 		1) On average one level gain per screen
//		2) Each enemy level corresponds to three player levels since there are three enemy types per level
//		3) About 50 enemies to gain a level. So at level n, you should receive about n^4/50 exp.
//		4) At level n, you should have about 5/4 n^2 HP with n^/20 regen, n attack (0.075 n^2 damage), 5n range, n accuracy, 50n frequency
//		5) Each enemy hit knocks out about 10% of the player's HP, or about 1/8n^2

// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function generateEnemy(x,y,strength) {
	// charging: indicates whether the enemy is recharging for another attack. last_attack was the time of the last attack
	// messages: all messages for display
	// alive: whether the enemy is alive. defeat_time: if the enemy has been defeated, the timestamp of that event.
	enemy_type = Math.floor(strength+2*randn_bm());
	if (enemy_type < 0) {enemy_type = 0;}
	enemy_class = enemy_type%3;
	enemy_level = Math.floor(enemy_type/3);
	enemy_base_hp = Math.floor(2/3*Math.pow(enemy_level,2)+enemy_level+3);
	base_stats = {x:x,y:y,type:enemy_type,
		hp:enemy_base_hp, max_hp:enemy_base_hp,
		exp:Math.pow(enemy_level+1,4)-Math.pow(enemy_level+1,3)+Math.pow(enemy_level+1,2)-enemy_level,
		attack: Math.floor(1.25*Math.pow(enemy_level+1,2)),avoidance:15*(enemy_level),evasion:3*(enemy_level),dodge:150*(enemy_level),
		range:20,
		charging:0,last_attack:-9999,messages:[],alive:1,defeat_time:-9999
	};
	return (base_stats);
}

// Turn an integer into a color
function getColor(num) {
	// 25 colors right now
	col_array = ["rgba(256, 0, 0, 1.0)","rgba(0, 256, 0, 1.0)","rgba(, 0, 256, 1.0)",
		"rgba(256, 256, 0, 1.0)","rgba(256, 0, 256, 1.0)","rgba(0, 256, 256, 1.0)",
		"rgba(128, 128, 128, 1.0)","rgba(0, 128, 128, 1.0)","rgba(128, 0, 128, 1.0)","rgba(128, 128, 0, 1.0)",
		"rgba(0, 0, 128, 1.0)","rgba(0, 128, 0, 1.0)","rgba(128, 0, 0, 1.0)",
		"rgba(128, 256, 0, 1.0)","rgba(0, 128, 256, 1.0)","rgba(256, 0, 128, 1.0)",
		"rgba(256, 128, 0, 1.0)","rgba(0, 256, 128, 1.0)","rgba(128, 0, 256, 1.0)",
		"rgba(256, 128, 128, 1.0)","rgba(128, 256, 128, 1.0)","rgba(128, 128, 256, 1.0)",
		"rgba(256, 256, 128, 1.0)","rgba(256, 128, 256, 1.0)","rgba(128, 256, 256, 1.0)"];
	return col_array[num%(col_array.length)]
}

// Draw the enemy shape, assuming color has been set
function drawEnemyShape(enemy,timestamp) {
	num_shapes = 6; // Number of shapes. For best results, should be relatively prime to the number of colors
	shape = enemy.type % num_shapes;
	// Square
	if (shape == 0) {ctx.fillRect(enemy.x-5-offset.x, enemy.y-5-offset.y, 10,10);}
	// Circle
	if (shape == 1) {
		ctx.beginPath();
		ctx.arc(enemy.x - offset.x, enemy.y - offset.y, 7, 0, 2*3.1416, 0);
		ctx.fill();
	}
	// Triangle
	if (shape == 2) {
		ctx.beginPath();
		ctx.moveTo(enemy.x-offset.x, enemy.y-offset.y+5);
		ctx.lineTo(enemy.x-offset.x-5, enemy.y-offset.y-5);
		ctx.lineTo(enemy.x-offset.x+5, enemy.y-offset.y-5);
		ctx.fill();
	}
	// Rotating line
	if (shape == 3) {
		angle = timestamp / 80;
		ctx.beginPath();
		ctx.moveTo(enemy.x-offset.x+7*Math.cos(angle), enemy.y-offset.y+7*Math.sin(angle));
		ctx.lineTo(enemy.x-offset.x-7*Math.cos(angle), enemy.y-offset.y-7*Math.sin(angle));
		ctx.stroke();
	}
	// Diamond
	if (shape == 4) {
		ctx.beginPath();
		ctx.moveTo(enemy.x-offset.x, enemy.y-offset.y+5);
		ctx.lineTo(enemy.x-offset.x-5, enemy.y-offset.y);
		ctx.lineTo(enemy.x-offset.x, enemy.y-offset.y-5);
		ctx.lineTo(enemy.x-offset.x+5, enemy.y-offset.y);
		ctx.fill();
	}
	// Pulsating circle
	if (shape == 5) {
		ctx.beginPath();
		radius = 7*Math.abs(Math.sin(timestamp/1000));
		ctx.arc(enemy.x - offset.x, enemy.y - offset.y, radius, 0, 2*3.1416, 0);
		ctx.fill();
	}
}

function drawEnemy(enemy,timestamp) {
	if (enemy.alive) {
		ctx.fillStyle = getColor(enemy.type);
		drawEnemyShape(enemy,timestamp);
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
	}
	for (j=0;j<enemy.messages.length;j++) {
		m = enemy.messages[j];
		ctx.fillStyle = "rgba("+m[2][0]+", "+m[2][1]+", "+m[2][2]+", 1.0)";
		ctx.fillText(m[0],enemy.x - offset.x,enemy.y - offset.y-10-0.08*(timestamp-m[1]));
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
		if (timestamp-m[1] > 600) {enemy.messages.splice(j,1);}
	}
}