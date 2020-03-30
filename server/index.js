/**
 * https://medium.com/samsung-internet-dev/being-fast-and-light-using-binary-data-to-optimise-libraries-on-the-client-and-the-server-5709f06ef105
 * https://stackoverflow.com/questions/21831124/efficient-websocket-data-handling
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
 * http://buildnewgames.com/optimizing-websockets-bandwidth/
 * https://www.reddit.com/r/gamedev/comments/508xng/websocket_binary_vs_json/
 */

const express = require('express');
const app = express();
const WebSocket = require('ws');
const {v4} = require('uuid');
const fs = require('fs');
const path = require('path');
const {actionTypes, extractData} = require('../constants/server');
const {
	joinLobbyFail,
	kickPlayers,
	updateLobbyId, 
	updatePlayersInLobby,
	updateSocketId
} = require('./actions')
const ws = new WebSocket.Server({port: 9000});
const sockets = {}; // WebSocket[]
const lobbies = {}; // Lobby[]
const players = {}; // Player[]
let doFireWatchEvent = true;
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
function Player(id, username) {
	this.id = id;
	this.username = username;
	this.lobby = null;

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
						const socketsToUpdate = lobbies[lobbyId].players.map(playerId => sockets[playerId]);
						updateLobbyId(socket, lobbyId);
						updatePlayersInLobby(socketsToUpdate, lobbies[lobbyId].players.map(playerId => players[playerId].username));
					})
					.catch((err) => joinLobbyFail(socket, err));
				break;
			case actionTypes.JOIN_LOBBY:
				joinLobby(args[0], args[1])
					.then(lobbyId => {
						const socketsToUpdate = lobbies[lobbyId].players.map(playerId => sockets[playerId]);
						updateLobbyId(socket, args[1]);
						updatePlayersInLobby(socketsToUpdate, lobbies[lobbyId].players.map(playerId => players[playerId].username));
					})
					.catch((err) => joinLobbyFail(socket, err));
				break;
			case actionTypes.UPDATE_BALL_POS:
				break;
			default:
				break;
		}
	});

	socket.on('close', e => {
		if (!players[socketId]) return;

		const playerLobby = lobbies[(players[socketId]).lobby];
		const socketsToUpdate = playerLobby ? playerLobby.players.map(playerId => sockets[playerId]) : [];

		players[socketId].leaveLobby();
		updatePlayersInLobby(socketsToUpdate, playerLobby ? playerLobby.players.map(playerId => players[playerId].username) : []);

		delete players[socketId];
		if (lobbies[socketId]) delete lobbies[socketId] && kickPlayers(socketsToUpdate, 'The game host disconnected.');
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