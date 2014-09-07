var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Game', { preload: preload, create: create, update: update });
var screenNum = 1;

function preload()
{
	game.load.spritesheet('ChromeSkins', '../Images/Browser-Wars/GoogleChrome-Icons.png', 256, 256);
	game.load.spritesheet('FirefoxSkins', '../Images/Browser-Wars/Firefox-Icons.png', 512, 512);
	game.load.spritesheet('InternetExplorerSkins', '../Images/Browser-Wars/InternetExplorer-Icons.png', 70, 70);
	game.load.spritesheet('NexusSkins', '../Images/Browser-Wars/Nexus-Icons.png', 62, 55);
	game.load.spritesheet('Cursors', '../Images/Browser-Wars/Cursors.png', 50, 50);
	game.load.spritesheet('Stages', '../Images/Browser-Wars/Stages.png', 800, 600);
	game.load.audio('Click', ['../Sounds/Click.mp3']);
	game.load.image('AddButton', '../Images/Browser-Wars/Add-Button.png', 62, 55);
}

function onClick(e)
{
	var indexOfBtn = playerButtons.indexOf(e);

	game.add.text(e.x, e.y, 'Player ' + (indexOfBtn + 1));
	
	var clickSound = game.add.sound('Click');
	clickSound.play();

	var cursor = game.add.sprite(0, 0, 'Cursors');
	cursor.frame = indexOfBtn;
	cursor.inputEnabled = true;
	cursor.input.enableDrag();
	cursor.events.onDragStop.add(changeChosen, this);
	game.physics.arcade.enable(cursor);

	e.destroy();
}

function changeChosen(e)
{
	for(var i = 0; i < characters.length; i++)
	{
		var icon = characters[i];
		var iconNX = (225 * (e.frame + 1) - 200);
		
		if (game.physics.arcade.overlap(e, icon) && icon.y === 25)
		{
			for(var j = 0; j < characters.length; j++)
			{
				if (characters[j].y !== 25 && characters[j].x === iconNX)
				{
					characters[j].x = 25 * j + 70 * (j - 1) + characters[j].width;
					characters[j].y = 25;
					
					players.splice(e.frame, 1);
				}
			}

			icon.x = iconNX;
			icon.y = game.height - 220;

			players[e.frame] = icon.key;

			break;
		}
	}
}

function create()
{
	game.stage.backgroundColor = 0XFAFAFA;
	game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
	game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
	game.physics.startSystem(Phaser.Physics.ARCADE);

	playerButtons = [];
	players = [];
	
	for(var i = 1; i < 3; i++)
	{
		var playerRects = game.add.graphics(0, 0);
		playerRects.beginFill(0XC0C0C0);
		playerRects.drawRect(225 * i - 200, game.height - 220, 150, 200);
		playerRects.endFill();
		
		var playerRectsButton = game.add.button(225 * i - 195, game.height - 55, 'AddButton', onClick);
		playerButtons.push(playerRectsButton);
	}

	var playBtn = game.add.graphics(0, 0);
	playBtn.beginFill(0X32CBFB);
	playBtn.drawRect(0, game.height / 2 - 25, game.width, 50);
	playBtn.endFill();
	
	game.add.text(0, game.height / 2 - 12.5, 'Press Enter to Start');

	var ie = game.add.sprite(25, 25, 'InternetExplorerSkins');
	var firefox = game.add.sprite(120, 25, 'FirefoxSkins');
	var chrome = game.add.sprite(215, 25, 'ChromeSkins');
	var nexus = game.add.sprite(303, 25, 'NexusSkins');

	characters = [ie, firefox, chrome, nexus];

	for(i = 0; i < characters.length; i++)
	{
		game.physics.arcade.enable(characters[i]);
	}

	firefox.width = 70;
	firefox.height = 70;

	nexus.width = 63;
	nexus.height = 70;

	chrome.width = 70;
	chrome.height = 70;
}

function initPlay()
{
	gamePlayers = {};

	platforms = game.add.group(); 
	
	platforms.enableBody = true;
 
	var ground = platforms.create(0, game.world.height - 64, 'Stages'); 
	ground.width = game.world.width;
	ground.height = 64;
	ground.body.immovable = true;
	
	var tile = platforms.create(game.width / 2 - 30, game.world.height - 184, 'Stages');
	tile.width = 60;
	tile.height = 120;
	tile.body.immovable = true;

	players = players.reverse();

	for(var i = 0; i < players.length; i++)
	{
		var player = game.add.sprite(0, game.height / 2, players[i]);
		
		switch(players[i])
		{
			case 'NexusSkins':
				player.width = 63;
				player.height = 70;
			break;
			
			default:
				player.width = 70;
				player.height = 70;
			break;
		}
		
		player.x = i * (game.width - player.width) / 4 + (i - 1) * 70 + player.width;
		
		game.physics.arcade.enable(player);
		player.body.bounce.x = .5;
		player.body.bounce.y = .2;
  		player.body.gravity.y = 500;
		player.body.collideWorldBounds = true;

		gamePlayers['Player' + i] = player;
		
		game.physics.arcade.setBoundsToWorld();
		
		player.collideWith = [];
		player.direction = "right";
		
		player.damage = function(amount, nameIfDead)
		{
			this.health -= amount;

			if (this.health <= 0)
			{
				delete gamePlayers[this];
				this.destroy();
	
				if(!!Object.keys(gamePlayers).length)
				{
					game.world.removeAll();
					screenNum++;
					game.add.text(0, 0, 'Player ' + (parseInt(nameIfDead) + 1) + ' won!');
				}
			}
	
			this.alpha = this.health;
			
			console.log(nameIfDead)
			
			return this;
		};
	}
}

function update()
{
	var speed = 10;
	
	if(game.input.keyboard.isDown(13) && screenNum === 1)
	{
		game.world.removeAll();
		screenNum++;
		
		initPlay();
	}

	if(screenNum === 2)
	{
		for(var obj in gamePlayers) gamePlayers[obj].collideWith = [];
		for(var obj in gamePlayers)
		{
			var leftKey, rightKey, downKey, upKey;
			
			switch(obj)
			{
				case 'Player1':
					leftKey = 37;
					rightKey = 39;
					upKey = 38;
					downKey = 40;
				break;
				
				case 'Player0':
					leftKey = 65;
					rightKey = 68;
					upKey = 87;
					downKey = 83;
				break;
			}
			
			var player = gamePlayers[obj];
			game.physics.arcade.collide(player, platforms);

			if (game.input.keyboard.isDown(leftKey))
			{
				player.body.velocity.x -= speed;
				player.scale.x = -Math.abs(player.scale.x);
				var offset=new Phaser.Point();
				offset.x=player.width;
				player.body.offset=offset;
				if (player.direction=="right")
				{
					player.body.x=player.body.x-player.width;
					player.direction="left";
				}
			}
		
			if (game.input.keyboard.isDown(rightKey))
			{
				player.body.velocity.x += speed;
				player.scale.x = Math.abs(player.scale.x);
				var offset=new Phaser.Point();
				player.body.offset=offset;
				if (player.direction=="left")
				{
					player.body.x=player.body.x-player.width;
					player.direction="right";
				}
			}
			
			if (game.input.keyboard.isDown(upKey) && player.body.touching.down)
			{
				player.body.velocity.y = -350;
			}
			for (var other in gamePlayers)
			{
				var otherPlayer = gamePlayers[other];
				if (otherPlayer === player) continue;
				if (game.input.keyboard.isDown(downKey))
				{
					var collide = false
					for(var i in otherPlayer.collideWith)
					{
						if (otherPlayer.collideWith[i] === player)
						{
							otherPlayer.damage(.01, other.replace('Player', ''));
							player.collideWith.push(otherPlayer);
							collide = true;
						}
					}
					if (!collide)
					{
						if (game.physics.arcade.collide(player, otherPlayer))
						{
							otherPlayer.damage(.01, other.replace('Player', ''));
							player.collideWith.push(otherPlayer);
						}
					}
				}
			}
		}
	}
}
