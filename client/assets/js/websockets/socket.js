import {actionTypes, extractData} from '../../../constants/client.js';
import {store} from '../store/store.js';

// export const socket = new WebSocket('ws://localhost:9000');
export const socket = new WebSocket(`ws://${location.hostname}:9000`);

socket.addEventListener('open', e => console.log(e));
socket.addEventListener('message', ({data}) => {
	const [action, ...args] = extractData(data);

	switch (action) {
		case actionTypes.FILE_CHANGED:
			setTimeout(() => location.reload(), 500);
			break;
		case actionTypes.JOIN_LOBBY_FAIL:
			const dialog = document.createElement('dialog-message');
			dialog.setAttribute('message', `Couldn\'t join lobby. Reason: ${args[0]}`);
			document.body.appendChild(dialog);
			// console.log(action, args);
			break;
		case actionTypes.UPDATE_LOBBY_ID:
			store.actions.setLobbyId(args[0]);
			// console.log(action, args, store.state.lobbyId);
			break;
		case actionTypes.UPDATE_SOCKET_ID:
			store.actions.setSocketId(args[0]);
			// console.log(action, args, store.state.socketId);
			break;
		default:
			break;
	}
});
socket.addEventListener('error', e => console.log(e));
socket.addEventListener('close', e => {
	console.log(e);
	const dialog = document.createElement('dialog-message');
	dialog.addEventListener('close', () => location.reload());
	dialog.setAttribute('message', `You were disconnected from the server. Reason: The server doesn't respond. The game will refresh shortly.`);
	document.body.appendChild(dialog);
});