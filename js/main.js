// Erstellt ein neues Fenster mit gegeben Parametern und weist es der Variabel Game zu
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-game', {
	preload : preload,
	create : create,
	update : update
});

//Hier werden die Bilder mit entsprechenden Variabeln geladen und wenn angegeben mit größen
function preload() {

	game.load.image('sky', 'assets/sky.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.image('star', 'assets/star.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	game.load.image('bullet', 'assets/bullet.png');

}

// Typlose Variabeln für die gesamte Laufzeit

// Begrezungslinien für Spieler (Linie1 = Links, Linie2 = Rechts)
var line1;
var line2;

// Beide Spieler (Spieler 1 = Links, Spieler 2 = Rechts)
var player1;
var player2;

// Für die Zuweisung des Inputs der Pfeiltasten für Spieler 2
var cursors;

// Schießen Variablen (bullets für die Kollisonsbrechnung, bulletTime = ???, fireButton für die auswahl des Schießenbuttons)
var bullets;
var bulletTime = 0;
var fireButton;


// Folgende Funktion wird zu beginn einmal ausgeführt und ersellt alle Objekte für ein Spiel inklusive Spieler, Leben usw.
function create() {


	// Fügt einen Hintergrund an der Position an der Stelle links oben ein (0,0), das Bild welches verwendet wird hat die Variabel sky
	game.add.sprite(0, 0, 'sky');


	// An dieser Stelle erzeugen wir die beiden Wände die beide Spieler separieren. Dazu wird die gesamte Spielbreite durch
	// 3 geteilt. Linie 1 wird an Stelle der (Spielbreite : 3) angelegt die linie 2 (Spielbreite : 3 * 2). Die Grafik heißt ground
	line1 = game.add.sprite(game.world.width / 3, 0, 'ground');
	line2 = game.add.sprite(2 * game.world.width / 3, 0, 'ground');
	
	// Für die beiden Linienobjekte wird die Pysic angestellt damit eine Kollisionsbrechenung stattfinden kann
	game.physics.enable(line1, Phaser.Physics.ARCADE);
	game.physics.enable(line2, Phaser.Physics.ARCADE);

	//Setzt die linien fest so das sie nicht mehr verschoben werden können
	game.physics.arcade.enable(line1);
	line1.body.immovable = true;

	game.physics.arcade.enable(line2);
	line2.body.immovable = true;


	// Startposition für die Spieler , und assets (Bilder für Bewegung...) gesetzt
	player1 = game.add.sprite(32, game.world.height - 150, 'dude');
	player2 = game.add.sprite(game.world.width - 64, game.world.height - 150, 'dude');

	//  Animationen für nach links, rechts gehen
	player1.animations.add('left', [0, 1, 2, 3], 10, true);
	player1.animations.add('right', [5, 6, 7, 8], 10, true);

	player2.animations.add('left', [0, 1, 2, 3], 10, true);
	player2.animations.add('right', [5, 6, 7, 8], 10, true);

	// Stellt die Phsic beider Spieler ein, z.B. für Kollisionsberechnung
	game.physics.arcade.enable(player1);
	game.physics.arcade.enable(player2);

	// Verhinder das Spieler aus dem Feld rausgehen können
	player1.body.collideWorldBounds = true;
	player2.body.collideWorldBounds = true;


	//  Steuerung des Spielers 2 mithilfe der Pfeiltasten
	cursors = game.input.keyboard.createCursorKeys();

	// Steuerung des Spielers 1 mithilfe WASD Tasten
	wupKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
	sdownKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
	aleftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
	drightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

	// Schießebutton für Spieler 1 (leertaste)
	fireButton1 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	// Schießebutton für Spieler 2 (leertaste)
	fireButton2 = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);


	// Bullets Player 1
	bulletsPlayer1 = game.add.group();
	bulletsPlayer1.enableBody = true;
	bulletsPlayer1.physicsBodyType = Phaser.Physics.ARCADE;
	bulletsPlayer1.createMultiple(30, 'bullet');
	bulletsPlayer1.setAll('anchor.x', 0, 5);
	bulletsPlayer1.setAll('anchor.y', 1);
	bulletsPlayer1.setAll('outOfBoundsKill', true);
	bulletsPlayer1.setAll('checkWorldBounds', true);

	// Bullets Player 2
	bulletsPlayer2 = game.add.group();
	bulletsPlayer2.enableBody = true;
	bulletsPlayer2.physicsBodyType = Phaser.Physics.ARCADE;
	bulletsPlayer2.createMultiple(30, 'bullet');
	bulletsPlayer2.setAll('anchor.x', 0, 5);
	bulletsPlayer2.setAll('anchor.y', 1);
	bulletsPlayer2.setAll('outOfBoundsKill', true);
	bulletsPlayer2.setAll('checkWorldBounds', true);

	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	//  Lives Player 1
	livesPlayer1 = game.add.group();

	for (var i = 0; i < 3; i++) {
		var player1Lives = livesPlayer1.create(40 + (30 * i), 60, 'bullet');
		player1Lives.anchor.setTo(0.5, 0.5);
		player1Lives.angle = 90;
		player1Lives.alpha = 0.4;
	}

	//  Lives Player 2
	livesPlayer2 = game.add.group();

	for (var i = 0; i < 3; i++) {
		var player2Lives = livesPlayer2.create(game.world.width - 100 + (30 * i), 60, 'bullet');
		player2Lives.anchor.setTo(0.5, 0.5);
		player2Lives.angle = 90;
		player2Lives.alpha = 0.4;
	}

	//  Text
	stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', {
		font : '84px Arial',
		fill : '#fff'
	});
	stateText.anchor.setTo(0.5, 0.5);
	stateText.visible = false;

}

function update() {
	player1.body.velocity.x = 0;
	player2.body.velocity.x = 0;
	player1.body.velocity.y = 0;
	player2.body.velocity.y = 0;
	if (game.physics.arcade.collide(player1, line1, null) || game.physics.arcade.collide(player2, line2, null)) {

	}
	if (game.physics.arcade.collide(player2, line2, null) || game.physics.arcade.collide(player1, line1, null)) {

	} else {
		if (cursors.up.isDown) {
			//  Move to the left
			player2.body.velocity.y = -150;

			player2.animations.play('up');
		} else if (cursors.down.isDown) {
			//  Move to the right
			player2.body.velocity.y = 150;

			player2.animations.play('down');
		} else if (cursors.left.isDown) {
			//  Move to the right
			player2.body.velocity.x = -150;

			player2.animations.play('left');
		} else if (cursors.right.isDown) {
			//  Move to the right
			player2.body.velocity.x = 150;

			player2.animations.play('right');
		} else {
			//  Stand still
			player2.animations.stop();

			player2.frame = 4;
		}

		if (fireButton2.isDown) {
			fireBulletPlayer2(player2);
		}

		//Player 2 controls
		if (wupKey.isDown) {
			//  Move to the left
			player1.body.velocity.y = -150;

			player1.animations.play('up');
		} else if (sdownKey.isDown) {
			//  Move to the right
			player1.body.velocity.y = 150;

			player1.animations.play('down');
		} else if (aleftKey.isDown) {
			//  Move to the right
			player1.body.velocity.x = -150;

			player1.animations.play('left');
		} else if (drightKey.isDown) {
			//  Move to the right
			player1.body.velocity.x = 150;
			player1.animations.play('right');
		} else {
			//  Stand still
			player1.animations.stop();

			player1.frame = 4;
		}
		if (fireButton1.isDown) {
			fireBulletPlayer1(player1);
		}
	}

	game.physics.arcade.overlap(bulletsPlayer2, player1, player1gotHit, null, this);
	game.physics.arcade.overlap(bulletsPlayer1, player2, player2gotHit, null, this);
}

function fireBulletPlayer1(player) {

	if (game.time.now > bulletTime) {
		bullet = bulletsPlayer1.getFirstExists(false);
		bullet.reset(player.x + 70, player.y + 40);
		bullet.body.velocity.x = 200;
		bulletTime = game.time.now + 200;
	}
}

function fireBulletPlayer2(player) {

	if (game.time.now > bulletTime) {
		bullet = bulletsPlayer2.getFirstExists(false);
		bullet.reset(player.x - 70, player.y + 40);
		bullet.body.velocity.x = -200;
		bulletTime = game.time.now + 200;
	}
}

function player1gotHit(player1) {

	bullet.kill();

	live = livesPlayer1.getFirstAlive();

	if (live) {
		live.kill();
	}

	// When the player dies
	if (livesPlayer1.countLiving() < 1) {
		player1.kill();
		bulletsPlayer2.callAll('kill');

		stateText.text = "Spieler 2 Gewinnt \n Klick für Neustart";
		stateText.visible = true;

		//the "click to restart" handler
		game.input.onTap.addOnce(restart, this);
	}

}

function player2gotHit(player2, bullet) {

	bullet.kill();

	live = livesPlayer2.getFirstAlive();

	if (live) {
		live.kill();
	}

	// When the player dies
	if (livesPlayer2.countLiving() < 1) {
		player2.kill();
		bulletsPlayer1.callAll('kill');

		stateText.text = "Spieler 1 Gewinnt \n Klick für Neustart";
		stateText.visible = true;

		//the "click to restart" handler
		game.input.onTap.addOnce(restart, this);
	}

}

function restart() {

	//  A new level starts

	//resets the life count
	livesPlayer1.callAll('revive');
	livesPlayer2.callAll('revive');

	//revives the player
	player1.revive();
	player2.revive();
	//hides the text
	stateText.visible = false;

}
