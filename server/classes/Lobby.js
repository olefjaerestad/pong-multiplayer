const {actionTypes} = require('../../constants/server');
const {sockets} = require('../globals');
const Ball = require('./Ball');

function Lobby(id) {
	this.id = id;
	this.players = [];
	this.ball = new Ball();

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
	this.startGame = function() {
		setInterval(() => {
			this.ball.y += this.ball.velocity.y;
			this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_BALL_INFO, this.ball])));
		}, 1000/30);
	}
	this.updateBallVelocity = function(coords) {
		this.ball.velocity = coords;
		console.log(this.ball.velocity);
	}
	this.updateCountdown = function(sec) {
		this.players.forEach(playerId => sockets[playerId].send(JSON.stringify([actionTypes.UPDATE_LOBBY_COUNTDOWN, sec])));
	}
}

module.exports = Lobby;