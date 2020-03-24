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
const {actionTypes} = require('../constants/server');
const ws = new WebSocket.Server({port: 9000});
const sockets = {};

ws.on('connection', (socket, req) => {
	sockets[v4()] = socket;
});

setInterval(() => {
	for (const socket in sockets) {
		// sockets[socket].send(JSON.stringify({type: actionTypes.UPDATE_BALL_POS}));
		sockets[socket].send(JSON.stringify([actionTypes.UPDATE_BALL_POS, 2, 5]));
	}
}, 3000);

app.use('/', express.static('client'));
app.use('/constants', express.static('constants'));

app.listen(3000);