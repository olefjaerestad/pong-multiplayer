import {socket} from './socket.js';
import {store} from '../store/store.js';
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

export function resetBallInfo() {
	socket.send(JSON.stringify([actionTypes.RESET_BALL_INFO, store.state.lobbyId]));
}

export function startGame() {
	socket.send(JSON.stringify([actionTypes.START_GAME, store.state.lobbyId]));
}

export function updateBallVelocity(coords) {
	socket.send(JSON.stringify([actionTypes.UPDATE_BALL_VELOCITY, store.state.lobbyId, coords]));
}

export function updateLobbyCountdown(sec) {
	socket.send(JSON.stringify([actionTypes.UPDATE_LOBBY_COUNTDOWN, store.state.lobbyId, sec]));
}

export function updatePlayerPos(pos) {
	socket.send(JSON.stringify([actionTypes.UPDATE_PLAYER_POS, pos]));
}

export function updatePlayerScore(socketId, score) {
	socket.send(JSON.stringify([actionTypes.UPDATE_PLAYER_SCORE, socketId, score]));
}