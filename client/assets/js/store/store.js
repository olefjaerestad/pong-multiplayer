import {Store} from './store-class.js';

export const store = new Store({
	socketId: {},
	lobbyId: {},
}, {
	setSocketId(id) {
		this.state.socketId = id;
	},
	setLobbyId(id) {
		this.state.lobbyId = id;
	},
});