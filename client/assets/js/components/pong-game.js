import {socket} from '../websockets/socket.js';
import {actionTypes, extractData} from '../../../../constants/client.js';
import {store} from '../store/store.js';
import {updatePlayerPos} from '../websockets/actions.js';


const colors = {
	white: 'hsl(0, 0%, 100%)',
	black: 'hsl(0, 0%, 0%)',
	primary: 'hsl(286, 100%, 50%)',
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
		this.players = {};
		this.keyState = {}; // currently pressed keys

		this.run = this.run.bind(this);
		this.setElementSizes = this.setElementSizes.bind(this);
		this.setCanvasSize = this.setCanvasSize.bind(this);
		this.resizeHandler = this.resizeHandler.bind(this);
		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);
		this.touchmoveHandler = this.touchmoveHandler.bind(this);
		this.setMyPos = this.setMyPos.bind(this);
		// this.setLine1Pos = this.setLine1Pos.bind(this);
		// this.setLine2Pos = this.setLine2Pos.bind(this);
		// this.setBallPos = this.setBallPos.bind(this);
		// this.setBallVelocity = this.setBallVelocity.bind(this);
		this.addEventListeners = this.addEventListeners.bind(this);
		this.removeEventListeners = this.removeEventListeners.bind(this);
	}
	
	get me() {
		return this.players[store.state.socketId];
	}

	run() {
		// console.log(this.c);
		this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

		Object.values(this.players).forEach((player, i) => this.drawPlayer(player, i));
		if (this.keyState[39]) this.setMyPos();
		if (this.keyState[37]) this.setMyPos(false);

		this.requestedAnimationFrame = requestAnimationFrame(this.run);
	}

	setMyPos(toRight) {
		if (toRight === undefined) toRight = true;

		const x = this.me.x / (this.canvas.width - this.me.width);
		let pos = 0;
		if (toRight) pos = Math.min(1, x + this.me.velocity);
		if (!toRight) pos = Math.max(0, x - this.me.velocity);
		updatePlayerPos(pos);
	}

	drawPlayer(player, index) {
		const y = player.id === store.state.socketId ? this.canvas.height-player.height : 0;
		this.c.beginPath();
		this.c.fillStyle = colors.primary;
		this.c.fillRect(player.x, y, player.width, player.height);
		this.c.closePath();
	}

	updateScores() {
		this.scores.innerHTML = '';
		let playersHtml = '<ul>';
		Object.values(this.players).forEach(player => playersHtml += `<li>${player.username} (${player.score})</li>`);
		playersHtml += '</ul>';
		this.scores.innerHTML += playersHtml;
	}

	setElementSizes() {
		this.setCanvasSize();
		// this.player1.y = this.canvas.height-this.player1.height;
		// this.player1.x = ((this.canvas.width-this.player1.width)/2);
		// this.player1.width = this.player1.getCalculatedWidth();
	}

	setCanvasSize() {
		this.canvas.width = parseInt(getComputedStyle(this.game).width);
		this.canvas.height = "ontouchstart" in document.documentElement ? parseInt(getComputedStyle(this.game).height)-100 : parseInt(getComputedStyle(this.game).height);
	}

	resizeHandler(e) {
		this.setElementSizes();
		// this.player2.width = this.player2.getCalculatedWidth();
		// this.ball.radius = this.ball.getCalculatedRadius();
	}

	keydownHandler(e) {
		this.keyState[e.keyCode || e.which] = true;
	}

	keyupHandler(e) {
		delete this.keyState[e.keyCode || e.which];
	}

	touchmoveHandler(e) {
		// this.player1.x = Math.min(this.canvas.width-this.player1.width, Math.max(0, e.touches[0].pageX - this.player1.width/2));
	}

	addEventListeners() {
		window.addEventListener('resize', this.resizeHandler);
		window.addEventListener('keydown', this.keydownHandler);
		window.addEventListener('keyup', this.keyupHandler);
		this.addEventListener('touchstart', this.touchmoveHandler);
		this.addEventListener('touchmove', this.touchmoveHandler);
	}

	removeEventListeners() {
		window.removeEventListener('resize', this.resizeHandler);
		window.removeEventListener('keydown', this.keydownHandler);
		window.removeEventListener('keyup', this.keyupHandler);
		this.removeEventListener('touchstart', this.touchmoveHandler);
		this.removeEventListener('touchmove', this.touchmoveHandler);
	}

	render() {
		this.innerHTML = '';
		const style = document.createElement('style');
		this.game.classList.add('game');
		this.sidebar.classList.add('sidebar');
		this.scores.classList.add('scores');
		this.sidebar.innerHTML = `<h2>Gamepin: ${store.state.lobbyId}</h2>`;
		this.sidebar.appendChild(this.scores);
		this.game.appendChild(this.canvas);
		this.style.textContent = style.textContent = /*css*/`
			pong-game {
				width: 100vw;
				height: 100vh;
				display: flex;
			}
			pong-game .game {
				background-color: black;
				flex: 1;
			}
			pong-game canvas {
				max-width: 100%;
				max-height: 100%;
			}
			pong-game .sidebar {
				background-color: lightgreen;
				width: 200px;
			}
		`;

		this.appendChild(this.game);
		this.appendChild(this.sidebar);
		this.appendChild(style);
		this.setElementSizes();
		// this.setCanvasSize();
	}

	connectedCallback() {
		this.canvas = document.createElement('canvas');
		this.game = document.createElement('main');
		this.sidebar = document.createElement('aside');
		this.scores = document.createElement('div');
		this.c = this.canvas.getContext('2d');
		// this.player1 = new Player(true, this.canvas);

		socket.addEventListener('message', ({data}) => {
			const [action, ...args] = extractData(data);
			
			switch(action) {
				case actionTypes.UPDATE_PLAYER_POS:
					this.players[args[0]].x = (this.canvas.width - this.players[args[0]].width) * args[1];
					// console.log(action, args);
					break;
				case actionTypes.UPDATE_PLAYERS_IN_LOBBY:
					const players = args[0].reduce((players, player) => {
						player.x = (this.canvas.width - player.width) * player.x;
						players[player.id] = player;
						return players;
					}, {});

					this.players = players; // todo: this resets the position of the players already in lobby
					this.updateScores();
					// console.log(action, args);
					break;
				case actionTypes.KICK:
					const dialog = document.createElement('dialog-message');
					dialog.addEventListener('close', () => location.reload());
					dialog.setAttribute('message', `You were disconnected from the lobby. Reason: ${args[0]} You'll be taken to the main menu shortly.`);
					document.body.appendChild(dialog);
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
}