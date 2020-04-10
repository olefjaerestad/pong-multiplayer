import {socket} from '../websockets/socket.js';
import {actionTypes, extractData} from '../../../../constants/client.js';
import {store} from '../store/store.js';
import {resetBallInfo, startGame, updateBallVelocity, updateLobbyCountdown, updatePlayerPos, updatePlayerScore} from '../websockets/actions.js';


const colors = {
	white: 'hsl(0, 0%, 100%)',
	black: 'hsl(0, 0%, 0%)',
	// primary: 'hsl(286, 100%, 50%)',
	primary: 'hsl(297, 100%, 50%)', // magenta
	secondary: 'hsl(56, 100%, 50%)', // yellow
	tertiary: 'hsl(191, 98%, 44%)', // blue
	primaryTransparent: 'hsla(286, 100%, 90%, .4)',
}

/**
 * A Line to bounce the Ball with
 * @param {boolean} isPlayer player controlled
 * @param {HTMLCanvasElement} canvas the canvas element this Line belongs to
 */
/* function Player (isPlayer, canvas) {
	// this.canvas = canvas;
	// this.getCalculatedWidth = () => {
	// 	return Math.max(this.canvas.width / 10, 70);
	// }
	// this.width = this.getCalculatedWidth();
	// this.height = 10;
	// this.x = (canvas.width-this.width) / 2;
	// this.y = isPlayer ? canvas.height-this.height : 0;
	// this.velocity = 10;
	// this.isPlayer = isPlayer;
	// this.score = 0;
	// this.c = this.canvas.getContext('2d');
	// this.width = 0;
	// this.height = 0;
	// this.x = 0;
	// this.y = 0;
	// this.velocity = 0;
	// this.isPlayer = isPlayer;
	// this.score = 0;
	// this.c = this.canvas.getContext('2d');

	this.update = () => {
		this.draw();
	}

	this.draw = () => {
		console.log(canvas.width, this.x);
		this.c.beginPath();
		this.c.fillStyle = colors.primary;
		this.c.fillRect(this.x, this.y, this.width, this.height);
		this.c.fillStyle = 'hsla(0, 100%, 100%, .3)';
		this.c.fillStyle = colors.primaryTransparent;
		this.c.font = `${canvas.height / 10}px sans-serif`; // 100
		this.c.fillText(this.score, (canvas.width-canvas.height/20)/2, isPlayer ? this.y+this.height-canvas.height/10 : this.y+canvas.height/6);
		this.c.closePath();
	}
} */

export class PongGame extends HTMLElement {
	constructor() {
		super();
		this.ball = {};
		this.canvasBoundingClientRect = {};
		this.currentCountdown = null;
		this.keyState = {}; // currently pressed keys
		this.players = {};
		this.updateScoreTimeoutId = 0;

		this.addEventListeners = this.addEventListeners.bind(this);
		this.drawBall = this.drawBall.bind(this);
		this.drawCountdown = this.drawCountdown.bind(this);
		this.drawPlayer = this.drawPlayer.bind(this);
		this.drawScores = this.drawScores.bind(this);
		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);
		this.removeEventListeners = this.removeEventListeners.bind(this);
		this.render = this.render.bind(this);
		this.resizeHandler = this.resizeHandler.bind(this);
		this.run = this.run.bind(this);
		this.setBallVelocity = this.setBallVelocity.bind(this);
		this.setCanvasSize = this.setCanvasSize.bind(this);
		this.setElementSizes = this.setElementSizes.bind(this);
		this.setPlayerPos = this.setPlayerPos.bind(this);
		this.startCountdown = this.startCountdown.bind(this);
		this.touchmoveHandler = this.touchmoveHandler.bind(this);
	}
	
	get isPlayer1() {
		return store.state.socketId === store.state.lobbyId;
	}

	get me() {
		return this.players[store.state.socketId];
	}

	get player1() {
		return this.players[store.state.lobbyId];
	}

	addEventListeners() {
		window.addEventListener('resize', this.resizeHandler);
		window.addEventListener('keydown', this.keydownHandler);
		window.addEventListener('keyup', this.keyupHandler);
		this.canvas.addEventListener('touchstart', this.touchmoveHandler);
		this.canvas.addEventListener('touchmove', this.touchmoveHandler);
		this.startButton.addEventListener('click', this.startCountdown);
	}

	connectedCallback() {
		this.canvas = document.createElement('canvas');
		this.game = document.createElement('main');
		this.sidebar = document.createElement('aside');
		this.scores = document.createElement('div');
		this.actions = document.createElement('div');
		this.startButton = document.createElement('button');
		this.c = this.canvas.getContext('2d');
		// this.player1 = new Player(true, this.canvas);

		socket.addEventListener('message', ({data}) => {
			const [action, ...args] = extractData(data);
			
			switch(action) {
				case actionTypes.KICK:
					const dialog = document.createElement('dialog-message');
					dialog.addEventListener('close', () => location.reload());
					dialog.setAttribute('message', `You were disconnected from the lobby. Reason: ${args[0]} You'll be taken to the main menu shortly.`);
					document.body.appendChild(dialog);
					// console.log(action, args);
					break;
				case actionTypes.LEFT_LOBBY:
					delete this.players[args[0]];
					this.drawScores();
					// console.log(action, args);
					break;
				case actionTypes.UPDATE_BALL_INFO:
					// this.players[args[0]].x = (this.canvas.width - this.players[args[0]].width) * args[1];
					this.ball = args[0];
					// console.log(action, args);
					break;
				case actionTypes.UPDATE_PLAYER_POS:
					this.players[args[0]].x = (this.canvas.width - this.players[args[0]].width) * args[1];
					// console.log(action, args);
					break;
				case actionTypes.UPDATE_PLAYER_SCORE:
					this.players[args[0]].score = args[1];
					this.drawScores();
					// console.log(action, args);
					break;
				case actionTypes.UPDATE_LOBBY_COUNTDOWN:
					this.currentCountdown = args[0];
					// console.log(action, args);
					break;
				case actionTypes.UPDATE_PLAYERS_IN_LOBBY:
					/* const players = args[0].reduce((players, player) => {
						player.width = this.canvas.width * player.normalizedWidth; // convert from 0-1 to px
						player.x = (this.canvas.width - player.width) * player.x; // convert from 0-1 to px
						players[player.id] = player;
						return players;
					}, {});

					this.players = players; // todo: this resets the position of the players already in lobby
					this.drawScores();
					break; */
					args[0].forEach(player => {
						if (this.players[player.id]) return; // Don't replace existing players.

						player.width = this.canvas.width * player.normalizedWidth; // Convert from 0-1 to px.
						player.x = (this.canvas.width - player.width) * player.x; // Convert from 0-1 to px.
						this.players[player.id] = player;
					});

					this.drawScores();
					// console.log(action, args);
					break;
				default:
					break;
			}
		});

		this.addEventListeners();
		this.render();
		this.run();
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
		this.c.fillStyle = colors.tertiary;
		this.c.arc(x, y, radius, 0, Math.PI * 2);
		this.c.fill();
		this.c.closePath();

		this.setBallVelocity(x, y);
	}

	drawCountdown() {
		if (!this.currentCountdown) return;

		this.c.beginPath();
		this.c.font = '100px neon';
		this.c.fillStyle = colors.primary;
		this.c.fillText(this.currentCountdown.toString(), this.canvas.width/2-30, this.canvas.height/2+30);
		this.c.closePath();
	}

	drawPlayer(player) {
		const isMe = player.id === store.state.socketId;
		const x = isMe ? player.x : this.canvas.width - player.x - player.width; // This is key since player 1 and 2 has inverted views.
		const y = isMe ? this.canvas.height-player.height : 0;
		player.y = y;
		this.c.beginPath();
		this.c.fillStyle = player.id === this.player1.id ? colors.primary : colors.secondary;
		// this.c.fillRect(player.x, y, player.width, player.height);
		this.c.fillRect(x, y, player.width, player.height);
		this.c.font = '10px neon';
		this.c.fillStyle = colors.black;
		// this.c.fillText(player.username, player.x, y+player.height, player.width);
		this.c.fillText(player.username, x, y+player.height);
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
		this.canvas.removeEventListener('touchstart', this.touchmoveHandler);
		this.canvas.removeEventListener('touchmove', this.touchmoveHandler);
		this.startButton.removeEventListener('click', this.startCountdown);
	}

	render() {
		this.innerHTML = '';
		const style = document.createElement('style');
		this.game.classList.add('game');
		this.sidebar.classList.add('sidebar');
		this.scores.classList.add('scores');
		this.startButton.textContent = 'Start';
		this.actions.appendChild(this.startButton);
		this.sidebar.innerHTML = `<p>Gamepin:<br>${store.state.lobbyId}</p>`;
		this.sidebar.appendChild(this.scores);
		this.sidebar.appendChild(this.actions);
		this.game.appendChild(this.canvas);
		this.style.textContent = style.textContent = /*css*/`
			pong-game {
				width: 100vw;
				height: 100vh;
				display: flex;
			}
			pong-game .game {
				flex: 1;
			}
			pong-game canvas {
				max-width: 100%;
				max-height: 100%;
			}
			pong-game .sidebar {
				background-color: rgba(0,0,0,.5);
				width: 200px;
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
		`;

		this.appendChild(this.game);
		this.appendChild(this.sidebar);
		this.appendChild(style);
		this.setElementSizes();
		// this.setCanvasSize();
	}

	resizeHandler(e) {
		this.setElementSizes();
		// this.player2.width = this.player2.getCalculatedWidth();
		// this.ball.radius = this.ball.getCalculatedRadius();
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
		const movingTowardsMe = this.ball.velocity.y > 0;
		const player = movingTowardsMe ? this.me : Object.values(this.players)[1];
		if (!player) return;
		const playerX = movingTowardsMe ? player.x : this.canvas.width - player.x - player.width; // This is key since player 1 and 2 has inverted views.
		const playerY = movingTowardsMe ? player.y : player.y + player.height;
		const ballY = movingTowardsMe ? y + this.ball.radius : y - this.ball.radius;
		const yThreshold = Math.min(Math.abs(this.ball.velocity.y), 9999); // todo: remember velocity.y is 0-1
		const hitX = (x - playerX) / player.width; // where on the x axis of the player the ball hit. between 0 and 1.
		const phi = .75 * Math.PI * (hitX*2 - 1);
		const isCrossingX = hitX >= 0 && hitX <= 1;
		const isCrossingY = movingTowardsMe ? ballY >= playerY && ballY <= playerY + yThreshold : ballY <= playerY && ballY >= playerY - yThreshold;
		const isCrossingBoundaries = x - this.ball.radius <= 0 || x >= this.canvas.width - this.ball.radius;

		if (isCrossingY && isCrossingX) {
			const velocityX = 2*Math.sin(phi) / 1000;
			const velocityY = -this.ball.velocity.y;
			// velocityY = -(this.ball.velocity.y*1.1); // speed increase // todo: remember velocity.y is 0-1
			updateBallVelocity({x: velocityX, y: velocityY});
		} else if (isCrossingY && !isCrossingX) {
			const opponent = movingTowardsMe ? Object.values(this.players)[1] : this.me;

			// Timeout (and consecutive clearTimeout) of minimum 17ms is required so we avoid sending twice to server, since client side code is running in requestAnimationFrame aka 60fps, while server is running in a setTimeout with 30fps. Hopefully the if check will prevent a strange (and hard to reproduce) bug where score would actually be updated twice.
			if (!this.updateScoreTimeoutId) {
				this.updateScoreTimeoutId = setTimeout(() => {
					updatePlayerScore(opponent.id, opponent.score+1);
					resetBallInfo();
					clearTimeout(this.updateScoreTimeoutId);
					this.updateScoreTimeoutId = 0;
				}, 500);
			}

			// const {x: newBallX, y: newBallY} = this.ball.getDefaultPos();
			// const newBallVelocity = this.ball.getDefaultVelocity();
			// this.ball.x = newBallX;
			// this.ball.y = newBallY;
			// this.ball.velocity = newBallVelocity;
			// todo: reset ball stats (send to server)
		}

		if (isCrossingBoundaries) {
			// this.ball.velocity.x = -this.ball.velocity.x;
			updateBallVelocity({x: -this.ball.velocity.x, y: this.ball.velocity.y});
		}
	}

	setCanvasSize() {
		this.canvas.width = parseInt(getComputedStyle(this.game).width);
		this.canvas.height = "ontouchstart" in document.documentElement ? parseInt(getComputedStyle(this.game).height)-100 : parseInt(getComputedStyle(this.game).height);
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

	startCountdown() {
		// todo: make some variable 'isPlaying' that when true, disables the play button
		let countdownSecs = 3;
		const intervalId = setInterval(() => {
			updateLobbyCountdown(countdownSecs--);

			if (countdownSecs === -1) {
				startGame();
				clearInterval(intervalId);
			}
		}, 1000);
	}

	touchmoveHandler(e) {
		const touchX = e.touches[0].pageX - this.canvasBoundingClientRect.x;
		const x = Math.min(this.canvas.width, Math.max(0, touchX));
		const pos = x / this.canvas.width;
		updatePlayerPos(pos);
	}
}