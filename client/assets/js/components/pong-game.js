import {socket} from '../websockets/socket.js';
import {actionTypes, extractData} from '../../../../constants/client.js';
import {store} from '../store/store.js';
import {resetBallInfo, startGame, updateBallVelocity, updateLobbyCountdown, updatePlayerPos, updatePlayerScore} from '../websockets/actions.js';
import cogIcon from '../icons/cog.js';
import shareIcon from '../icons/share.js';


const colors = {
	background1: getComputedStyle(document.documentElement).getPropertyValue('--c-background-1'), // blue
	background2: getComputedStyle(document.documentElement).getPropertyValue('--c-background-2'), // magenta
	background3: getComputedStyle(document.documentElement).getPropertyValue('--c-background-3'), // yellow
	black: getComputedStyle(document.documentElement).getPropertyValue('--c-black'),
	blue: getComputedStyle(document.documentElement).getPropertyValue('--c-blue'),
	white: getComputedStyle(document.documentElement).getPropertyValue('--c-white'),
	whiteTransparent: getComputedStyle(document.documentElement).getPropertyValue('--c-white-tp'),
	yellow: getComputedStyle(document.documentElement).getPropertyValue('--c-yellow'),
}

const canShare  = 'share' in navigator;

export class PongGame extends HTMLElement {
	constructor() {
		super();
		this.ball = {};
		this.canvasBoundingClientRect = {};
		this.currentCountdown = null;
		this.keyState = {}; // currently pressed keys
		this.players = {};
		this.shareGamepinTimeoutId = 0;
		this.updateScoreTimeoutId = 0;

		this.addEventListeners = this.addEventListeners.bind(this);
		this.drawBall = this.drawBall.bind(this);
		this.drawCountdown = this.drawCountdown.bind(this);
		this.drawMessage = this.drawMessage.bind(this);
		this.drawPlayer = this.drawPlayer.bind(this);
		this.drawScores = this.drawScores.bind(this);
		this.hideMessage = this.hideMessage.bind(this);
		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);
		this.removeEventListeners = this.removeEventListeners.bind(this);
		this.render = this.render.bind(this);
		this.resizeHandler = this.resizeHandler.bind(this);
		this.run = this.run.bind(this);
		this.shareGamepin = this.shareGamepin.bind(this);
		this.setBallVelocity = this.setBallVelocity.bind(this);
		this.setCanvasSize = this.setCanvasSize.bind(this);
		this.setElementSizes = this.setElementSizes.bind(this);
		this.setPlayerPos = this.setPlayerPos.bind(this);
		this.startCountdown = this.startCountdown.bind(this);
		this.toggleSidebar = this.toggleSidebar.bind(this);
		this.touchmoveHandler = this.touchmoveHandler.bind(this);
		this.updateActionButtonsStatus = this.updateActionButtonsStatus.bind(this);
	}
	
	get isPlayer1() {
		return store.state.socketId === store.state.lobbyId;
	}

	get me() {
		return this.players[store.state.socketId];
	}

	get opponent() {
		const meIndex = Object.keys(this.players).indexOf(store.state.socketId);
		const opponentIndex = meIndex === 0 ? 1 : 0;
		return Object.values(this.players)[opponentIndex];
	}

	get player1() {
		return this.players[store.state.lobbyId];
	}

	addEventListeners() {
		window.addEventListener('resize', this.resizeHandler);
		window.addEventListener('keydown', this.keydownHandler);
		window.addEventListener('keyup', this.keyupHandler);
		this.game.addEventListener('touchstart', this.touchmoveHandler);
		this.game.addEventListener('touchmove', this.touchmoveHandler);
		this.gamepinTextarea.addEventListener('click', e => {e.target.focus(); e.target.select();});
		this.startButton.addEventListener('click', this.startCountdown);
		this.shareGamepinButton.addEventListener('click', this.shareGamepin);
		this.toggleSidebarButton.addEventListener('click', this.toggleSidebar);
	}

	connectedCallback() {
		this.canvas = document.createElement('canvas');
		this.game = document.createElement('main');
		this.message = document.createElement('div');
		this.toggleSidebarButton = document.createElement('button');
		this.sidebar = document.createElement('aside');
		this.gamepinInfo = document.createElement('div');
		this.gamepinTextarea = document.createElement('textarea');
		this.shareGamepinButton = document.createElement('button');
		this.scores = document.createElement('div');
		this.actions = document.createElement('div');
		this.startButton = document.createElement('button');
		this.c = this.canvas.getContext('2d');

		socket.addEventListener('message', ({data}) => {
			const [action, ...args] = extractData(data);
			
			switch(action) {
				case actionTypes.CROWN_WINNER: {
					this.currentCountdown = null;
					this.drawMessage(`
						<h2>${this.players[args[0]].username} won!</h2>
						<small>Note: If you didn't win, don't feel too bad, okay?</small><br>
						<small>Note 2: You can restart the game by clicking the "Start" button in the side menu.</small>
					`);
					this.updateActionButtonsStatus();
					// console.log(action, args);
					break;
				}
				case actionTypes.KICK: {
					const dialog = document.createElement('dialog-message');
					dialog.addEventListener('close', () => location.reload());
					dialog.setAttribute('message', `You were disconnected from the lobby. Reason: ${args[0]} You'll be taken to the main menu shortly.`);
					document.body.appendChild(dialog);
					// console.log(action, args);
					break;
				}
				case actionTypes.LEFT_LOBBY: {
					delete this.players[args[0]];
					this.drawScores();
					// console.log(action, args);
					break;
				}
				case actionTypes.RESET_PLAYER_SCORES: {
					Object.values(this.players).forEach(player => player.score = 0);
					this.drawScores();
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_BALL_INFO: {
					this.ball = args[0];
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_BALL_POS: {
					this.ball.x = args[0];
					this.ball.y = args[1];
					this.ball.reverseX = args[2];
					this.ball.reverseY = args[3];
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_BALL_VELOCITY: {
					this.ball.velocity = args[0];
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_PLAYER_POS: {
					this.players[args[0]].x = (this.canvas.width - this.players[args[0]].width) * args[1];
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_PLAYER_SCORE: {
					this.players[args[0]].score = args[1];
					this.drawScores();
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_LOBBY_COUNTDOWN: {
					this.currentCountdown = args[0];
					this.hideMessage();
					this.updateActionButtonsStatus();
					// console.log(action, args);
					break;
				}
				case actionTypes.UPDATE_PLAYERS_IN_LOBBY: {
					args[0].forEach(player => {
						if (this.players[player.id]) return; // Don't replace existing players.

						player.width = this.canvas.width * player.normalizedWidth; // Convert from 0-1 to px.
						player.x = (this.canvas.width - player.width) * player.x; // Convert from 0-1 to px.
						this.players[player.id] = player;
					});

					this.drawScores();
					// console.log(action, args);
					break;
				}
				default: {
					break;
				}
			}
		});

		this.addEventListeners();
		this.render();
		this.requestedAnimationFrame = requestAnimationFrame(this.run);
	}

	disconnectedCallback() {
		this.removeEventListeners();
		cancelAnimationFrame(this.requestedAnimationFrame);
	}

	drawBall() {
		if (!this.ball.x) return;

		const radius = this.ball.radius;
		const coords = this.isPlayer1 ? {x: this.ball.x, y: this.ball.y} : {x: this.ball.reverseX, y: this.ball.reverseY};
		const x = coords.x * (this.canvas.width - radius*2) + radius;
		const y = coords.y * (this.canvas.height - radius*2 - this.me.height*2) + radius + this.me.height;

		this.c.beginPath();
		this.c.fillStyle = colors.blue;
		this.c.arc(x, y, radius, 0, Math.PI * 2);
		this.c.fill();
		this.c.closePath();

		this.setBallVelocity(x, y);
	}

	drawCountdown() {
		if (!this.currentCountdown) return;

		this.c.beginPath();
		this.c.font = '100px neon';
		this.c.fillStyle = colors.yellow;
		this.c.fillText(this.currentCountdown.toString(), this.canvas.width/2-30, this.canvas.height/2+30);
		this.c.closePath();
	}

	drawMessage(message) {
		this.message.innerHTML = message;
		this.message.classList.add('isActive');
	}

	drawPlayer(player) {
		const isMe = player.id === store.state.socketId;
		const x = isMe ? player.x : this.canvas.width - player.x - player.width; // This is key since player 1 and 2 has inverted views.
		const y = isMe ? this.canvas.height-player.height : 0;
		player.y = y;
		this.c.beginPath();
		// this.c.fillStyle = player.id === this.player1.id ? colors.background2 : colors.background3;
		this.c.fillStyle = colors.blue;
		this.c.fillRect(x, y, player.width, player.height);
		this.c.font = '10px neon';
		this.c.fillStyle = colors.black;
		this.c.fillText(player.username, x, y+player.height);
		this.c.font = `50px neon`;
		this.c.fillStyle = colors.whiteTransparent;
		this.c.fillText(player.score, this.canvas.width/2-15, isMe ? player.y - 20 : player.y + 70);
		this.c.closePath();
	}

	drawScores() {
		this.scores.innerHTML = '';
		// let playersHtml = '<ul>';
		// Object.values(this.players).forEach(player => playersHtml += `<li>${player.username} (${player.score})</li>`);
		// playersHtml += '</ul>';
		let playersHtml = `
			<table>
				<thead>
					<tr>
						<th style="text-align: left;">Username</th><th style="text-align: right;">Score</th>
					</tr>
				</thead>
				<tbody>
		`;
		Object.values(this.players).forEach(player => playersHtml += `<tr><td>${player.username}</td><td style="text-align: right;">${player.score}</td></tr>`);
		playersHtml += '</tbody>';
		playersHtml += '</table>';
		this.scores.innerHTML += playersHtml;
	}

	hideMessage() {
		this.message.classList.remove('isActive');
	}

	keydownHandler(e) {
		this.keyState[e.keyCode || e.which] = true;
	}

	keyupHandler(e) {
		delete this.keyState[e.keyCode || e.which];
	}

	removeEventListeners() {
		window.removeEventListener('resize', this.resizeHandler);
		window.removeEventListener('keydown', this.keydownHandler);
		window.removeEventListener('keyup', this.keyupHandler);
		this.game.removeEventListener('touchstart', this.touchmoveHandler);
		this.game.removeEventListener('touchmove', this.touchmoveHandler);
		this.startButton.removeEventListener('click', this.startCountdown);
		this.shareGamepinButton.removeEventListener('click', this.shareGamepin);
		this.toggleSidebarButton.removeEventListener('click', this.toggleSidebar);
	}

	render() {
		this.innerHTML = '';
		const style = document.createElement('style');
		this.game.classList.add('game');
		this.message.classList.add('message');
		this.sidebar.classList.add('sidebar');
		this.toggleSidebarButton.classList.add('toggleSidebar');
		this.gamepinInfo.classList.add('gamepinInfo');
		this.shareGamepinButton.classList.add('unstyled')
		this.scores.classList.add('scores');
		this.actions.classList.add('actions');
		this.startButton.textContent = 'Start';
		this.toggleSidebarButton.innerHTML = cogIcon;
		this.gamepinTextarea.value = store.state.lobbyId;
		this.gamepinTextarea.readOnly = true;
		this.gamepinTextarea.id = 'gamepin';
		this.shareGamepinButton.innerHTML = `<small>${canShare ? `${shareIcon}Share` : 'Copy'} gamepin</small>`;
		this.actions.innerHTML += '<p style="margin-top: 0;">First to 10 points!</p>';
		this.actions.appendChild(this.startButton);
		this.gamepinInfo.innerHTML = `<label for="gamepin">Gamepin:</label>`;
		this.gamepinInfo.appendChild(this.gamepinTextarea);
		this.gamepinInfo.appendChild(this.shareGamepinButton);
		this.sidebar.appendChild(this.scores);
		this.sidebar.appendChild(this.gamepinInfo);
		this.sidebar.appendChild(this.actions);
		this.game.appendChild(this.canvas);
		this.game.appendChild(this.message);
		this.style.textContent = style.textContent = /*css*/`
			pong-game {
				width: 100vw;
				height: 100vh;
				display: flex;
			}
			pong-game .game {
				flex: 1;
				position: relative;
			}
			pong-game canvas {
				max-width: 100%;
				max-height: 100%;
			}
			pong-game .message {
				color: var(--c-white);
				background-color: var(--c-black-tp);
				padding: 20px;
				display: none;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate3d(-50%,-50%,0);
			}
			pong-game .message.isActive {
				display: block;
			}
			pong-game .message > *:first-child {
				margin-top: 0;
			}
			pong-game .message > *:last-child {
				margin-bottom: 0;
			}
			pong-game .toggleSidebar {
				line-height: 0;
				position: fixed;
				top: 0;
				left: 0;
				opacity: .5;
				z-index: 2;
				transition: all .2s ease-in-out;
			}
			pong-game .toggleSidebar:hover {
				opacity: 1;
			}
			pong-game .toggleSidebar:active {
				transition: none;
			}
			pong-game .toggleSidebar svg {
				transition: inherit;
			}
			pong-game .toggleSidebar:hover svg {
				transform: rotateZ(90deg);
			}
			pong-game.sidebarIsActive .toggleSidebar {
				opacity: 1;
			}
			pong-game .toggleSidebar svg {
				stroke: var(--c-white);
				width: 20px;
			}
			pong-game .toggleSidebar svg g {
				fill: var(--c-white);
			}
			@media (min-width: 640px) {
				pong-game .toggleSidebar {
					display: none;
				}
			}
			pong-game .sidebar {
				background-color: var(--c-black-tp);
				width: 200px;
				height: 100%;
				position: fixed;
				top: 0;
				left: 0;
				z-index: 1;
				transform: translate3d(-100%,0,0);
				transition: all .2s ease-in-out;
			}
			pong-game.sidebarIsActive .sidebar {
				transform: translate3d(0,0,0);
			}
			@media (min-width: 640px) {
				pong-game .sidebar {
					position: relative;
					transform: translate3d(0,0,0);
				}
			}
			pong-game .gamepinInfo {
				background-color: var(--c-black);
				padding: 10px;
				margin-bottom: 10px;
			}
			pong-game .gamepinInfo textarea {
				background-color: hsla(0,0%, 100%, 0.15);
				resize: none;
			}
			pong-game .scores {
				margin-top: 50px;
				margin-bottom: 10px;
			}
			@media (min-width: 640px) {
				pong-game .scores {
					margin-top: 10px;
				}
			}
			pong-game .scores table {
				width: 100%;
				border-collapse: collapse;
			}
			pong-game .scores table th,
			pong-game .scores table td {
				padding: 5px 10px;
				border-bottom: 1px solid #fff;
			}
			pong-game .actions {
				padding: 10px;
			}
		`;

		this.appendChild(this.sidebar);
		this.appendChild(this.game);
		this.appendChild(this.toggleSidebarButton);
		this.appendChild(style);
		this.toggleSidebar();

		/**
		 * We call this.setElementSizes twice.
		 * First time to account for newly connected player(s).
		 * Second time in case browser hasn't loaded CSS yet.
		 * A bit hacky/stupid, but it works.
		 */
		this.setElementSizes();
		setTimeout(() => this.setElementSizes(), 100);
	}

	resizeHandler(e) {
		this.setElementSizes();
	}

	run() {
		this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

		Object.values(this.players).forEach(player => this.drawPlayer(player));
		this.drawBall();
		this.drawCountdown();

		if (this.keyState[39]) this.setPlayerPos();
		if (this.keyState[37]) this.setPlayerPos(false);

		this.requestedAnimationFrame = requestAnimationFrame(this.run);
	}

	setBallVelocity(x, y) { // see ~12:00 here https://www.youtube.com/watch?v=KApAJhkkqkA for more concise implementation
		const movingTowardsMe = this.isPlayer1 ? this.ball.velocity.y > 0 : this.ball.velocity.y < 0;
		if (!movingTowardsMe) return; // Opponent will take care of the calculations, our work here is done.
		const player = this.me;
		const playerX = player.x; // This is key since player 1 and 2 has inverted views.
		const playerY = player.y;
		const ballY = y + this.ball.radius;
		const ballVelocityX = this.isPlayer1 ? this.ball.velocity.x : -this.ball.velocity.x; // Since player1 and player2 has inverted views.
		const thresholdY = Math.min(Math.abs(this.canvas.height*this.ball.velocity.y), 9999);
		const hitX = (x - playerX) / player.width; // where on the x axis of the player the ball hit. between 0 and 1.
		const phi = .75 * Math.PI * (hitX*2 - 1);
		const isCrossingX = hitX >= 0 && hitX <= 1;
		const isCrossingY = ballY >= playerY && ballY <= playerY + thresholdY;
		const isCrossingBoundaries = 
			ballVelocityX <= 0 ?
				x - this.ball.radius <= 0 : 
				x + this.ball.radius >= this.canvas.width;

		if (isCrossingY && isCrossingX) {
			let velocityX = 4*Math.sin(phi) / 1000;
			if (!this.isPlayer1) velocityX = -velocityX; // Since player1 and player2 has inverted views.
			// const velocityY = -this.ball.velocity.y; // no speed increase
			const velocityY = -(this.ball.velocity.y*1.05); // speed increase
			updateBallVelocity({x: velocityX, y: velocityY});
		} else if (isCrossingY && !isCrossingX) {
			// Timeout (and consecutive clearTimeout) of minimum 17ms is required so we avoid sending twice to server, since client side code is running in requestAnimationFrame aka 60fps, while server is running in a setTimeout with 30fps. Hopefully the if check will prevent a strange (and hard to reproduce) bug where score would actually be updated twice.
			if (!this.updateScoreTimeoutId && this.opponent) {
				this.updateScoreTimeoutId = setTimeout(() => {
					updatePlayerScore(this.opponent.id, this.opponent.score+1);
					resetBallInfo();
					clearTimeout(this.updateScoreTimeoutId);
					this.updateScoreTimeoutId = 0;
				}, 500);
			}
		}

		if (isCrossingBoundaries) {
			updateBallVelocity({x: -this.ball.velocity.x, y: this.ball.velocity.y});
		}
	}

	setCanvasSize() {
		this.canvas.width = parseInt(getComputedStyle(this.game).width);
		this.canvas.height = "ontouchstart" in document.documentElement ? window.innerHeight-100 : window.innerHeight;
		this.canvasBoundingClientRect = this.canvas.getBoundingClientRect();
	}

	setElementSizes() {
		this.setCanvasSize();
		Object.values(this.players).forEach(player => player.width = this.canvas.width * player.normalizedWidth);
	}

	setPlayerPos(toRight) {
		if (toRight === undefined) toRight = true;

		const x = this.me.x / (this.canvas.width - this.me.width);
		let pos = 0;
		if (toRight) pos = Math.min(1, x + this.me.velocity);
		if (!toRight) pos = Math.max(0, x - this.me.velocity);
		updatePlayerPos(pos);
	}

	async shareGamepin() {
		try {
			await navigator.share({
				text: store.state.lobbyId,
			});
		} catch (err) {
			if (this.shareGamepinTimeoutId !== 0) return;

			this.gamepinTextarea.select();
			this.gamepinTextarea.setSelectionRange(0, 99999); /* For mobile devices, ref. https://www.w3schools.com/howto/howto_js_copy_clipboard.asp */
			document.execCommand('copy');
			const buttonHtml = this.shareGamepinButton.innerHTML;
			this.shareGamepinButton.innerHTML = '<small>Gamepin copied!</small>';
			this.shareGamepinTimeoutId = setTimeout(() => {
				this.shareGamepinButton.innerHTML = buttonHtml;
				clearTimeout(this.shareGamepinTimeoutId);
				this.shareGamepinTimeoutId = 0;
			}, 3000);
		}
	}

	startCountdown() {
		let countdownSecs = 3;
		const intervalId = setInterval(() => {
			updateLobbyCountdown(countdownSecs--);

			if (countdownSecs === -1) {
				startGame();
				clearInterval(intervalId);
			}
		}, 1000);
	}

	toggleSidebar() {
		this.classList.toggle('sidebarIsActive');
	}

	touchmoveHandler(e) {
		const touchX = e.touches[0].pageX - this.canvasBoundingClientRect.x;
		const x = Math.min(this.canvas.width, Math.max(0, touchX));
		const pos = x / this.canvas.width;
		updatePlayerPos(pos);
	}

	updateActionButtonsStatus() {
		if (this.currentCountdown === null) {
			this.startButton.disabled = false;
		} else {
			this.startButton.disabled = true;
		}
	}
}