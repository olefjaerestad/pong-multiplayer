import {socket} from './socket.js';
import {actionTypes} from '../../../../constants/client.js';

export function createLobby() {
	return new Promise((resolve, reject) => {
		try {
			socket.send(JSON.stringify([actionTypes.CREATE_LOBBY]));
			resolve();
		} catch(err) {
			reject(err);
		}
	});
}

export function createPlayer(username) {
	return new Promise((resolve, reject) => {
		try {
			socket.send(JSON.stringify([actionTypes.CREATE_PLAYER, username]));
			resolve(username);
		} catch(err) {
			reject(err);
		}
	});
}

export function joinLobby(socketId, gamepin) {
	// We don't use Promise here, since the server needs to check if gamepin is valid and can't return the response directly. We handle the response in socket.js.
	socket.send(JSON.stringify([actionTypes.JOIN_LOBBY, socketId, gamepin]));
}

export function updatePlayerPos(pos) {
	socket.send(JSON.stringify([actionTypes.UPDATE_PLAYER_POS, pos]));
}