const {sockets, lobbies, players} = require('./globals');
const Lobby = require('./classes/Lobby');
const Player = require('./classes/Player');

const createPlayer = (socketId, username) => {
	players[socketId] = new Player(socketId, username);
	console.log('createPlayer');
	// console.log(players);
}

const createLobby = (socketId) => {
	console.log('createLobby');
	// console.log(lobbies);
	return new Promise((resolve, reject) => {
		if (!players[socketId]) reject('You can\'t create a lobby since you\'re not logged in.');

		const lobby = new Lobby(socketId);
		lobbies[socketId] = lobby;
		players[socketId].joinLobby(lobby.id)
			.then(() => resolve(lobby.id))
			.catch(err => reject(err));
	});
}

const joinLobby = (socketId, lobbyId) => {
	console.log('joinLobby');
	// console.log(lobbies);
	return new Promise((resolve, reject) => {
		if (!players[socketId]) reject('Invalid player ID');
		if (!lobbies[lobbyId]) reject('Invalid gamepin');
		players[socketId].joinLobby(lobbyId)
			.then(() => resolve(lobbyId))
			.catch(err => reject(err));
	});
}

const getOpponents = (socketId) => {
	const lobby = Object.values(lobbies).find(lobby => lobby.players.includes(socketId));
	return lobby ? lobby.players.map(playerId => sockets[playerId]) : [];
}

module.exports = {
	createLobby,
	createPlayer,
	getOpponents,
	joinLobby,
}