import {Store} from './store-class.js';

export const store = new Store({
	socketId: {},
}, {
	setSocketId(id) {
		this.state.socketId = id;
	},
});