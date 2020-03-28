const {actionTypes} = require('../constants/server.js');

const joinLobbyFail = (socket, reason) => {
	socket.send(JSON.stringify([actionTypes.JOIN_LOBBY_FAIL, reason]));
}

const updateLobbyId = (socket, lobbyId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_LOBBY_ID, lobbyId]));
}

const updateSocketId = (socket, socketId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_SOCKET_ID, socketId]));
}

module.exports = {
	joinLobbyFail,
	updateLobbyId,
	updateSocketId,
}