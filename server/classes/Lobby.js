function Lobby(id) {
	this.id = id;
	this.players = [];

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
}

module.exports = Lobby;