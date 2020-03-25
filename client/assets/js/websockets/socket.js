import {actionTypes, extractData} from '../../../constants/client.js';
import {store} from '../store/store.js';

export const socket = new WebSocket('ws://localhost:9000');

socket.addEventListener('open', e => console.log(e));
socket.addEventListener('message', async ({data}) => {
	const [action, ...args] = extractData(data);

	switch (action) {
		case actionTypes.FILE_CHANGED:
			setTimeout(() => location.reload(), 500);
			break;
		case actionTypes.UPDATE_SOCKET_ID:
			store.actions.setSocketId(args[0]);
			console.log(action, args, store.state.socketId);
			break;
		case actionTypes.UPDATE_BALL_POS:
			console.log(action, args);
			break;
		default:
			break;
	}
});
socket.addEventListener('error', e => console.log(e));
socket.addEventListener('close', e => console.log(e));