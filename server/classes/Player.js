const {lobbies} = require('../globals');

function Player(id, username) {
	this.id = id;
	this.username = username;
	this.lobby = null;
	this.width = 70;
	this.normalizedWidth = .2; // between 0-1
	this.height = 10; // px
	this.x = .5; // between 0-1
	this.y = null; // px. Client sets this (see PongGame.drawPlayer()).
	this.velocity = .05;
	this.score = 0;

	this.joinLobby = function(lobbyId) {
		return new Promise((resolve, reject) => {
			if (!lobbies[lobbyId]) reject('Invalid gamepin');

			for (const lobbyId in lobbies) {
				lobbies[lobbyId].removePlayer(this.id);
			}
			lobbies[lobbyId].addPlayer(this.id)
				.then(() => {
					this.lobby = lobbyId;
					resolve();
				})
				.catch(err => reject(err));
		});
	}

	this.leaveLobby = function() {
		Object.values(lobbies).forEach(lobby => lobby.removePlayer(this.id));
		this.lobby = null;
	}
}

module.exports = Player;