const {actionTypes} = require('../constants/server.js');

const updateSocketId = (socket, socketId) => {
	socket.send(JSON.stringify([actionTypes.UPDATE_SOCKET_ID, socketId]));
}

module.exports = {
	updateSocketId,
}