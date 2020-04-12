const {actionTypes} = require('../constants/server.js');
const {players} = require('./globals.js');

const crownWinner = (sockets, socketId) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.CROWN_WINNER, socketId])));
}

const joinLobbyFail = (socket, reason) => {
	socket.send(JSON.stringify([actionTypes.JOIN_LOBBY_FAIL, reason]));
}

const kickPlayers = (sockets, reason) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.KICK, reason])));
}

const leftLobby = (sockets, socketId) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.LEFT_LOBBY, socketId])));
}

const resetPlayerScores = (sockets) => {
	sockets.forEach(socket => players[socket.id].score = 0);
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.RESET_PLAYER_SCORES])));
}

const updateLobbyId = (socket, lobbyId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_LOBBY_ID, lobbyId]));
}

const updatePlayerPos = (sockets, socketId, pos) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.UPDATE_PLAYER_POS, socketId, pos])));
}

const updatePlayerScore = (sockets, socketId, score) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.UPDATE_PLAYER_SCORE, socketId, score])));
}

const updatePlayersInLobby = (sockets, players) => {
	sockets.forEach(socket => socket.send(JSON.stringify([actionTypes.UPDATE_PLAYERS_IN_LOBBY, players])));
}

const updateSocketId = (socket, socketId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_SOCKET_ID, socketId]));
}

module.exports = {
	crownWinner,
	joinLobbyFail,
	kickPlayers,
	leftLobby,
	resetPlayerScores,
	updateLobbyId,
	updatePlayerPos,
	updatePlayerScore,
	updatePlayersInLobby,
	updateSocketId,
}