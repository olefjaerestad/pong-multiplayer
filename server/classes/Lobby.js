const {actionTypes} = require('../../constants/server');
const {sockets} = require('../globals');
const Ball = require('./Ball');

function Lobby(id) {
	this.ball = new Ball();
	this.id = id;
	this.players = [];
	this.scoreLimit = 10;
	this.gameIntervalId = null;

	this.addPlayer = function(playerId) {
		return new Promise((resolve, reject) => {
			if (this.players.indexOf(playerId) !== -1) reject('Player is already in the lobby.');

			this.players.push(playerId);
			resolve();
		});
	}
	this.removePlayer = function(playerId) {
		const index = this.players.indexOf(playerId);
		if (index !== -1) this.players.splice(index, 1);
	}
	this.resetBallInfo = function() {
		const {x, y} = this.ball.getDefaultPos();
		this.ball.x = this.ball.reverseX = x;
		this.ball.y = this.ball.reverseY = y;
		this.ball.velocity = this.ball.getDefaultVelocity();
	}
	this.startGame = function() {
		this.gameIntervalId = setInterval(() => {
			this.ball.x += this.ball.velocity.x;
			this.ball.y += this.ball.velocity.y;
			this.ball.reverseX -= this.ball.velocity.x; // This is key since player 1 and 2 has inverted views.
			this.ball.reverseY -= this.ball.velocity.y; // This is key since player 1 and 2 has inverted views.
			this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_INFO, this.ball])));
		}, 1000/30);
	}
	this.stopGame = function() {
		this.resetBallInfo(); // todo?: Do we need this?
		clearInterval(this.gameIntervalId);
	}
	this.updateBallVelocity = function(coords) {
		this.ball.velocity = coords;
		// console.log(this.ball.velocity);
	}
	this.updateCountdown = function(sec) {
		this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_LOBBY_COUNTDOWN, sec])));
	}
}

module.exports = Lobby;