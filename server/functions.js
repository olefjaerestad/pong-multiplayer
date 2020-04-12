const {sockets, lobbies, players} = require('./globals');
const Lobby = require('./classes/Lobby');
const Player = require('./classes/Player');

const createPlayer = (socketId, username) => {
	// console.log('createPlayer');
	players[socketId] = new Player(socketId, username);
}

const createLobby = (socketId) => {
	// console.log('createLobby');
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
	// console.log('joinLobby');
	return new Promise((resolve, reject) => {
		if (!players[socketId]) reject('Invalid player ID');
		if (!lobbies[lobbyId]) reject('Invalid gamepin');
		players[socketId].joinLobby(lobbyId)
			.then(() => resolve(lobbyId))
			.catch(err => reject(err));
	});
}

const getLobbyFromPlayerId = (playerId) => {
	const lobby = lobbies[(players[playerId]).lobby];
	return lobby ? lobby : null;
}

const getOpponents = (socketId) => {
	const lobby = lobbies[(players[socketId]).lobby];
	return lobby ? lobby.players.map(playerId => sockets[playerId]) : [];
}

module.exports = {
	createLobby,
	createPlayer,
	getLobbyFromPlayerId,
	getOpponents,
	joinLobby,
}