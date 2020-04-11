/**
 * https://medium.com/samsung-internet-dev/being-fast-and-light-using-binary-data-to-optimise-libraries-on-the-client-and-the-server-5709f06ef105
 * https://stackoverflow.com/questions/21831124/efficient-websocket-data-handling
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
 * http://buildnewgames.com/optimizing-websockets-bandwidth/
 * https://www.reddit.com/r/gamedev/comments/508xng/websocket_binary_vs_json/
 */

 // todo: replace all callas to updatePlayersInLobby() with joined/left actions

const express = require('express');
const app = express();
const WebSocket = require('ws');
const {v4} = require('uuid');
const fs = require('fs');
const path = require('path');
const {actionTypes, extractData} = require('../constants/server');
const {sockets, lobbies, players} = require('./globals');
const {createLobby, createPlayer, getOpponents, joinLobby} = require('./functions');
const {
	joinLobbyFail,
	kickPlayers,
	leftLobby,
	updateLobbyId, 
	updatePlayerPos,
	updatePlayerScore,
	updatePlayersInLobby,
	updateSocketId
} = require('./actions')
const ws = new WebSocket.Server({port: 9000});
let doFireWatchEvent = true;

ws.on('connection', (socket, req) => {
	const socketId = v4();
	sockets[socketId] = socket;
	updateSocketId(socket, socketId);
	socket.on('message', data => {
		const [action, ...args] = extractData(data);

		switch (action) {
			case actionTypes.CREATE_PLAYER:
				createPlayer(socketId, args[0]);
				break;
			case actionTypes.CREATE_LOBBY:
				createLobby(socketId)
					.then(lobbyId => {
						updateLobbyId(socket, lobbyId);
						updatePlayersInLobby(getOpponents(socketId), lobbies[lobbyId].players.map(playerId => players[playerId]));
					})
					.catch((err) => joinLobbyFail(socket, err));
				break;
			case actionTypes.JOIN_LOBBY:
				joinLobby(args[0], args[1])
					.then(lobbyId => {
						updateLobbyId(socket, lobbyId);
						updatePlayersInLobby(getOpponents(socketId), lobbies[lobbyId].players.map(playerId => players[playerId]));
					})
					.catch((err) => joinLobbyFail(socket, err));
				break;
			case actionTypes.RESET_BALL_INFO:
				lobbies[args[0]].resetBallInfo();
				break;
			case actionTypes.START_GAME:
				// console.log(action, args);
				lobbies[args[0]].startGame(args[1]);
				break;
			case actionTypes.UPDATE_BALL_POS:
				break;
			case actionTypes.UPDATE_BALL_VELOCITY:
				// console.log(action, args);
				lobbies[args[0]].updateBallVelocity(args[1]);
				break;
			case actionTypes.UPDATE_LOBBY_COUNTDOWN:
				// console.log(action, args);
				lobbies[args[0]].updateCountdown(args[1]);
				break;
			case actionTypes.UPDATE_PLAYER_POS:
				updatePlayerPos(getOpponents(socketId), socketId, args[0]);
				// console.log(action, args);
				break;
			case actionTypes.UPDATE_PLAYER_SCORE:
				players[args[0]].score = args[1];
				updatePlayerScore(getOpponents(args[0]), args[0], args[1]);
				// console.log(action, args);
				break;
			default:
				break;
		}
	});

	// Cleanup on user disconnect.
	socket.on('close', e => {
		if (!players[socketId]) return; // User hasn't joined any lobby.

		const socketsToUpdate = getOpponents(socketId);

		players[socketId].leaveLobby();
		leftLobby(socketsToUpdate, socketId);

		delete sockets[socketId];
		delete players[socketId];
		if (lobbies[socketId]) {
			delete lobbies[socketId];
			kickPlayers(socketsToUpdate, 'The game host disconnected.');
		}
	});
});

// just for testing
/* setInterval(() => {
	for (const socket in sockets) {
		sockets[socket].send(JSON.stringify([actionTypes.UPDATE_BALL_POS, 2, 5]));
	}
}, 3000); */

// host static files
app.use('/', express.static('client'));
app.use('/constants', express.static('constants'));
app.listen(3000);

// enable browser auto refresh
fs.watch(path.join(__dirname, '../client'), {recursive: true}, (eventType, filename) => {
	if (doFireWatchEvent) {
		doFireWatchEvent = false;
		for (const socket in sockets) {
			sockets[socket].send(JSON.stringify([actionTypes.FILE_CHANGED]));
		}
		setTimeout(() => doFireWatchEvent = true, 1000);
	}
});