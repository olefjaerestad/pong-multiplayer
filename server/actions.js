const {actionTypes} = require('../constants/server.js');

const joinLobbyFail = (socket, reason) => {
	socket.send(JSON.stringify([actionTypes.JOIN_LOBBY_FAIL, reason]));
}

const kickPlayers = (sockets, reason) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.KICK, reason])));
}

const updateLobbyId = (socket, lobbyId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_LOBBY_ID, lobbyId]));
}

const updatePlayerPos = (sockets, socketId, pos) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.UPDATE_PLAYER_POS, socketId, pos])));
}

const updatePlayersInLobby = (sockets, players) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.UPDATE_PLAYERS_IN_LOBBY, players])));
}

const updateSocketId = (socket, socketId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_SOCKET_ID, socketId]));
}

module.exports = {
	joinLobbyFail,
	kickPlayers,
	updateLobbyId,
	updatePlayerPos,
	updatePlayersInLobby,
	updateSocketId,
}