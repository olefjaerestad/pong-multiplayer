const socket = new WebSocket('ws://localhost:9000');
import {actionTypes} from '../../../constants/client.js';

socket.addEventListener('open', e => console.log(e));
socket.addEventListener('message', async ({data}) => {
	data = JSON.parse(data);
	const action = data[0];
	switch (action) {
		case actionTypes.UPDATE_BALL_POS:
			console.log(action);
			console.log(data);
			break;
		default:
			break;
	}
});
socket.addEventListener('error', e => console.log(e));
socket.addEventListener('close', e => console.log(e));