import {socket} from './socket.js';
import {actionTypes} from '../../../../constants/client.js';

export function createLobby() {
	return new Promise((resolve, reject) => {
		try {
			socket.send(JSON.stringify([actionTypes.CREATE_LOBBY]));
			resolve();
		} catch(e) {
			reject(e);
		}
	});
}

export function createPlayer(username) {
	return new Promise((resolve, reject) => {
		try {
			socket.send(JSON.stringify([actionTypes.CREATE_PLAYER, username]));
			resolve(username);
		} catch(e) {
			reject(e);
		}
	});
}

export function joinLobby(socketId, gamepin) {
	return new Promise((resolve, reject) => {
		try {
			socket.send(JSON.stringify([actionTypes.JOIN_LOBBY, socketId, gamepin]));
			resolve(gamepin);
		} catch(e) {
			reject(e);
		}
	});
}