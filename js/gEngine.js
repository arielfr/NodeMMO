$(function (e, t){
	/* ------------------ Game Engine ----------------- */
	function gEngine(socket, nickname){
		_this = this;

		//Configurations
		_this.socket = socket;
		_this.fps = 15;
		_this.debugMode = true;
		_this.movement = 10;
		_this.keyboard = new keyMap();
		_this.debug = new logger(true);
		_this.fpsDebugger = new fpsWidget();
		_this.mapContainer = $('#map-container');
		_this.map = new maps();
		_this.players = {};
		_this.player = new player(nickname, 300, 180);

		//Emit Player Connection
		_this.player.emitConnection();
		//Save the player in the array
		_this.players[_this.player.nickname] = _this.player;

		//Key Detection
		_this.bindKeyboard();

		//Update Players Positions
		_this.playerPositionUpdate();

		//Bind user connect
		_this.userConnect();

		//Bind the disconnectEvent
		_this.userDisconnect();

		//Start the game loop
		setInterval(_this.gameLoop, (1000 / _this.fps) );
	}

	gEngine.prototype.userConnect = function(){
		socket.on('user_connect', function(data){
			_this.debug.log('New Player ' + data.nickname + ' Connected');

			_this.players[data.nickname] = new player(data.nickname, data.x, data.y);
		});
	}

	gEngine.prototype.userDisconnect = function(){
		socket.on('user_disconnect', function(data){
			_this.debug.log('Player ' + data.nickname + ' Disconnect');

			_this.players[data.nickname].playerElement.remove();

			delete _this.players[data.nickname];
		});
	}

	gEngine.prototype.playerPositionUpdate = function(){
		socket.on('players_position', function(data){
			for (key in data){
				//Add the palyer if not on the players array
				if( !(_this.players[data[key].nickname] != undefined) ){
					_this.debug.log('New Player ' + data[key].nickname + ' Detect');

					_this.players[data[key].nickname] = new player(data[key].nickname, data[key].x, data[key].y);
				}

				if( data[key].nickname != _this.player.nickname ){
					//Make the movement
					var finalY = _this.players[data[key].nickname].y - data[key].y,
						finalX = _this.players[data[key].nickname].x - data[key].x;

					//Save the actual position
					_this.players[data[key].nickname].y = data[key].y;
					_this.players[data[key].nickname].x = data[key].x;

					if( finalY > 0 ){
						_this.players[data[key].nickname].moveUpSocket();
					}else if(finalY < 0){
						_this.players[data[key].nickname].moveDownSocket();
					}

					if( finalX > 0 ){
						_this.players[data[key].nickname].moveLeftSocket();
					}else if(finalX < 0){
						_this.players[data[key].nickname].moveRightSocket();
					}
				}else{
					//Save the actual position
					_this.players[data[key].nickname].y = data[key].y;
					_this.players[data[key].nickname].x = data[key].x;
				}
			}
		});
	}

	gEngine.prototype.draw = function(){
		if( _this.keyboard.isArrowKeyPress() ){
			//Make the movement
			switch( _this.keyboard.keyPress[0] ){
				case 37:
					_this.player.moveLeft();
					_this.map.moveLeft();
				break;
				case 38:
					_this.player.moveUp();
					_this.map.moveUp();
				break;
				case 39:
					_this.player.moveRight();
					_this.map.moveRight();
				break;
				case 40:
					_this.player.moveDown();
					_this.map.moveDown();
				break;
			}
		}
	}

	gEngine.prototype.gameLoop = function(){
		//Update the FPS Monitor
		_this.fpsDebugger.updateFpsDebugger();

		//Draw the movement
		_this.draw();
	}

	gEngine.prototype.bindKeyboard = function(){
		$(window).keydown(function(event){
			_this.keyboard.keyDown(event);
		});

		$(window).keyup(function(event){
			_this.keyboard.keyUp(event);
		});

		$(window).focus(function(){
			//Tab gets active again - Preventing lost keyup
			_this.keyboard.clearKeyPress();
		});
	}

	/* ------------------ Map Class ----------------- */
	function maps(){
		this.mapElement = 0;
		this.x = 0;
		this.y = 0;
		this.limitX = -840;
		this.limitY = -1000;

		this.mapElement = this.createMap();
		this.renderMap(map_1);
	}

	maps.prototype.createMap = function(){
		_this.mapContainer.append('<div id="map"></div>');

		return $('#map');
	}

	maps.prototype.moveUp = function(){
		if( !(this.restrictUp()) && !(_this.player.restrictUp()) ){
			this.y = this.y + _this.movement;
			
			this.mapElement.css('top', this.y);
		}
	}

	maps.prototype.moveDown = function(){
		if( !(this.restrictDown()) && !(_this.player.restrictDown()) ){
			this.y = this.y - _this.movement;

			this.mapElement.css('top', this.y);
		}
	}

	maps.prototype.moveLeft = function(){
		if( !(this.restrictLeft()) && !(_this.player.restrictLeft()) ){
			this.x = this.x + _this.movement;

			this.mapElement.css('left', this.x);
		}
	}

	maps.prototype.moveRight = function(){
		if( !(this.restrictRight()) && !(_this.player.restrictRight()) ){
			this.x = this.x - _this.movement;

			this.mapElement.css('left', this.x);
		}
	}

	maps.prototype.renderMap = function(map){
		for(var i = 0; i < map.length; i++){
			this.mapElement.append('<div class="mapBlock" style="background-image: url(' + mapDictionary.backgrounds[map[i]] + ');"></div>');
		}
	}

	maps.prototype.restrictLeft = function(){
		if( this.x == 0 ){
			return true;
		}else{
			return false;
		}
	}

	maps.prototype.restrictRight = function(){
		if( this.x == this.limitX ){
			return true;
		}else{
			return false;
		}
	}

	maps.prototype.restrictUp = function(){
		if( this.y == 0 ){
			return true;
		}else{
			return false;
		}
	}

	maps.prototype.restrictDown = function(){
		if( this.y == this.limitY ){
			return true;
		}else{
			return false;
		}
	}

	/* ------------------ Player Class ----------------- */
	function player(nickname, x, y){
		this.playerElement = null;
		this.headElement = null;
		this.bodyElement = null;
		this.nickname = nickname;
		this.x = x;
		this.y = y;
		this.moveX = 0;
		this.moveY = 0;

		this.createPlayer();
		this.addPlayerToMap();
	}

	player.prototype.emitConnection = function(){
		_this.socket.emit('connect', { 'nickname' : this.nickname , 'y' : this.y, 'x' : this.x });
	}

	player.prototype.createPlayer = function(){
		_this.map.mapElement.append('<div class="character" id="' + this.nickname + '"><div class="head"></div><div class="body"></div></div>');

		//Save the palyer
		this.playerElement = _this.map.mapElement.find('#' + this.nickname);
		this.headElement = this.playerElement.find('.head');
		this.bodyElement = this.playerElement.find('.body');
	}

	player.prototype.addPlayerToMap = function(){
		this.playerElement.css('top', this.y);
		this.playerElement.css('left', this.x);
		this.playerElement.css('display', 'block');
	}

	player.prototype.restrictUp = function(){
		var nextMovement = this.y - _this.movement;

		for (key in _this.players){
			if( key != _this.player.nickname ){
				if( (nextMovement < (_this.players[key].y + 20)) && ( (this.x > (_this.players[key].x - 20)) && (this.x < (_this.players[key].x + 20)) ) && (this.y > (_this.players[key].y)) ){
					return true;
				}
			}
		}

		return false;
	}

	player.prototype.restrictDown = function(){
		var nextMovement = this.y + _this.movement;

		for (key in _this.players){
			if( key != _this.player.nickname ){
				if( (nextMovement > (_this.players[key].y - 20)) && ( (this.x > (_this.players[key].x - 20)) && (this.x < (_this.players[key].x + 20)) ) && (this.y < (_this.players[key].y)) ){
					return true;
				}
			}
		}

		return false;
	}

	player.prototype.restrictLeft = function(){
		var nextMovement = this.x - _this.movement;

		for (key in _this.players){
			if( key != _this.player.nickname ){
				if( (nextMovement < (_this.players[key].x + 20)) && ( (this.y > (_this.players[key].y - 20)) && (this.y < (_this.players[key].y + 20)) ) && (this.x > (_this.players[key].x)) ){
					return true;
				}
			}
		}

		return false;
	}

	player.prototype.restrictRight = function(){
		var nextMovement = this.x + _this.movement;
		
		for (key in _this.players){
			if( key != _this.player.nickname ){
				if( (nextMovement > (_this.players[key].x - 20)) && ( (this.y > (_this.players[key].y - 20)) && (this.y < (_this.players[key].y + 20)) ) && (this.x < (_this.players[key].x)) ){
					return true;
				}
			}
		}

		return false;
	}

	player.prototype.moveUp = function(){
		if( !(_this.map.restrictUp()) && !(this.restrictUp()) ){
			this.y = this.y - _this.movement;
			this.playerElement.css('top', this.y);
			this.emitMovement(this.nickname, this.y, this.x);
		}

		this.moveHead(17);
		this.moveBodyY(0);
	}

	player.prototype.moveUpSocket = function(){
		this.playerElement.css('top', this.y);

		this.moveHead(17);
		this.moveBodyY(0);
	}

	player.prototype.moveDown = function(){
		if( !(_this.map.restrictDown()) && !(this.restrictDown()) ){
			this.y = this.y + _this.movement;
			this.playerElement.css('top', this.y);
			this.emitMovement(this.nickname, this.y, this.x);
		}

		this.moveHead(0);
		this.moveBodyY(1);
	}

	player.prototype.moveDownSocket = function(){
		this.playerElement.css('top', this.y);

		this.moveHead(0);
		this.moveBodyY(1);
	}

	player.prototype.moveLeft = function(){
		if( !(_this.map.restrictLeft()) && !(this.restrictLeft()) ){
			this.x = this.x - _this.movement;
			this.playerElement.css('left', this.x);
			this.emitMovement(this.nickname, this.y, this.x);
		}

		this.moveHead(35);
		this.moveBodyX(0);
	}

	player.prototype.moveLeftSocket = function(){
		this.playerElement.css('left', this.x);

		this.moveHead(35);
		this.moveBodyX(0);
	}

	player.prototype.moveRight = function(){
		if( !(_this.map.restrictRight()) && !(this.restrictRight()) ){
			this.x = this.x + _this.movement;
			this.playerElement.css('left', this.x);
			this.emitMovement(this.nickname, this.y, this.x);
		}

		this.moveHead(51);
		this.moveBodyX(1);
	}

	player.prototype.moveRightSocket = function(){
		this.playerElement.css('left', this.x);

		this.moveHead(51);
		this.moveBodyX(1);
	}

	player.prototype.emitMovement = function(nickname, y, x){
		_this.socket.emit('player_move', { 'nickname' : this.nickname, 'y' : this.y, 'x' : this.x });
	}

	player.prototype.moveHead = function(pos){
		this.headElement.css('background-position', pos + 'px');
	}

	player.prototype.moveBodyY = function(type){
		var pos = 0;

		if(type == 0){
			pos = -45;
		}

		switch(this.moveY){
			case 0:
				this.bodyElement.css('background-position', -25 + 'px ' + pos + 'px');

				this.moveY = this.moveY + 1;
			break;
			case 1:
				this.bodyElement.css('background-position', -50 + 'px ' + pos + 'px');

				this.moveY = this.moveY + 1;
			break;
			case 2:
				this.bodyElement.css('background-position', -75 + 'px ' + pos + 'px');

				this.moveY = this.moveY + 1;
			break;
			case 3:
				this.bodyElement.css('background-position', -100 + 'px ' + pos + 'px');

				this.moveY = this.moveY + 1;
			break;
			case 4:
				this.bodyElement.css('background-position', -125 + 'px ' + pos + 'px');

				this.moveY = this.moveY + 1;
			break;
			case 5:
				this.bodyElement.css('background-position', 0 + 'px ' + pos + 'px');

				this.moveY = 0;
			break;
		}
	}

	player.prototype.moveBodyX = function(type){
		var pos = -135;

		if(type == 0){
			pos = -88;
		}

		switch(this.moveX){
			case 0:
				this.bodyElement.css('background-position', -25 + 'px ' + pos + 'px');

				this.moveX = this.moveX + 1;
			break;
			case 1:
				this.bodyElement.css('background-position', -50 + 'px ' + pos + 'px');

				this.moveX = this.moveX + 1;
			break;
			case 2:
				this.bodyElement.css('background-position', -75 + 'px ' + pos + 'px');

				this.moveX = this.moveX + 1;
			break;
			case 3:
				this.bodyElement.css('background-position', -100 + 'px ' + pos + 'px');

				this.moveX = this.moveX + 1;
			break;
			case 4:
				this.bodyElement.css('background-position', 0 + 'px ' + pos + 'px');

				this.moveX = 0;
			break;
		}
	}

	/* ------------------ Keyboard Class ----------------- */
	function keyMap(){
		this.keyPress = [];
		this.arrowKeys = { 37 : 'Left', 38 : 'Up', 39 : 'Right', 40 : 'Down' };
	}

	keyMap.prototype.isArrowKeyPress = function(){
		if( this.keyPress.length > 0 ){
			return true;
		}else{
			return false;
		}
	}

	keyMap.prototype.isPressed = function(keyCode){
		if( $.inArray(keyCode, this.keyPress) > -1 ){
			return true;
		}else{
			return false;
		}
	}

	keyMap.prototype.keyDown = function(event){
		//log(event.which);
		if( this.arrowKeys[event.keyCode] && !(this.isPressed(event.keyCode)) ){
			this.keyPress.push(event.keyCode);
		}

		if( this.arrowKeys[event.keyCode] ){
			event.preventDefault();
		}

		//Detecting Mac or Windows Key - Prevent Key to not detect KeyUp
		if( event.metaKey ){
			this.clearKeyPress();
		}
	}

	keyMap.prototype.keyUp = function(event){
		if( $.inArray(event.keyCode, this.keyPress) > -1 ){
			//Remove from Array
			this.keyPress.splice($.inArray(event.keyCode, this.keyPress), 1);
		}
	}

	keyMap.prototype.forceKeyUp = function(keyCode){
		this.keyPress.splice($.inArray(keyCode, this.keyPress), 1);
	}

	keyMap.prototype.clearKeyPress = function(){
		this.keyPress = [];
	}

	/* ------------------ Stats Class ----------------- */
	function fpsWidget(){
		this.stats;

		if( _this.debugMode ){
			this.stats = new Stats();

			//Append the debugger to the body
			$('body').append('<div id="uiStats"></div>');
			$('#uiStats').append( this.stats.domElement );
		}
	}

	fpsWidget.prototype.updateFpsDebugger = function(){
		if( _this.debugMode ){
			this.stats.update();
		}
	}

	/* ------------------ Logger Class ----------------- */
	function logger(autoexpand){
		if( _this.debugMode ){
			this.logger = 'debugger';
			this.autoexpand = autoexpand;

			//Append the debugger
			$('body').append('<div id="' + this.logger + '"><div class="title">UI Debugger</div><div class="debugMessage"></div></div>');

			//Auto Show
			if( this.autoexpand ){
				$('#' + this.logger + ' .debugMessage').css('display', 'block');
			}

			//Binding functionality
			$('#' + this.logger + ' .title').click(function(event){
				if( $(this).siblings('.debugMessage').is(':visible') ){
					$(this).siblings('.debugMessage').css('display', 'none');
				}else{
					$(this).siblings('.debugMessage').css('display', 'block');
				}
			});
		}
	}

	logger.prototype.log = function(message){
		if( _this.debugMode ){
			//Append span
			$('#' + this.logger + ' .debugMessage').append('<span>' + message + '</span>')

			//AutoScroll
			$('#' + this.logger + ' .debugMessage').animate({scrollTop: $('#' + this.logger + ' .debugMessage').prop("scrollHeight")}, 10);
		}
	}

	function log(message){
		$('#debug').append('<span>' + message + '</span><br/>');
	}

	/* ------------------ Initialization ----------------- */
	//Initialize Socket
	var socket = io.connect('http://127.0.0.1:9000');
	var characterName = prompt('Please enter the name of the character: ');
	var gEngine = new gEngine(socket, characterName);
});