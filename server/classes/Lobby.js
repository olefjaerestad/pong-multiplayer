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
		this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_INFO, this.ball])));
	}
	this.startGame = function() {
		this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_INFO, this.ball])));
		this.gameIntervalId = setInterval(() => {
			this.ball.x += this.ball.velocity.x;
			this.ball.y += this.ball.velocity.y;
			this.ball.reverseX -= this.ball.velocity.x; // This is key since player 1 and 2 has inverted views.
			this.ball.reverseY -= this.ball.velocity.y; // This is key since player 1 and 2 has inverted views.

			// Round numbers to avoid sending unecessary large amounts of network/socket data. x needs 3 decimals, y needs 2.
			this.ball.x = Math.round(this.ball.x * 1000) / 1000;
			this.ball.reverseX = Math.round(this.ball.reverseX * 1000) / 1000;
			this.ball.y = Math.round(this.ball.y * 100) / 100;
			this.ball.reverseY = Math.round(this.ball.reverseY * 100) / 100;

			// this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_INFO, this.ball])));
			this.players.forEach(playerId => {
				if (sockets[playerId]) {
					sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_POS, this.ball.x, this.ball.y, this.ball.reverseX, this.ball.reverseY]))
				}
			});
		}, 1000/30);
	}
	this.stopGame = function() {
		this.resetBallInfo(); // todo?: Do we need this?
		clearInterval(this.gameIntervalId);
	}
	this.updateBallVelocity = function(coords) {
		coords.y = coords.y >= .2 ? .2 : coords.y; // Cap velocity.y.
		this.ball.velocity = coords;
		this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_VELOCITY, this.ball.velocity])));
	}
	this.updateCountdown = function(sec) {
		this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_LOBBY_COUNTDOWN, sec])));
	}
}

module.exports = Lobby;