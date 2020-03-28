export const actionTypes = {
	CREATE_LOBBY: 'CREATE_LOBBY',
	CREATE_PLAYER: 'CREATE_PLAYER',
	FILE_CHANGED: 'FILE_CHANGED',
	JOIN_LOBBY: 'JOIN_LOBBY',
	JOIN_LOBBY_FAIL: 'JOIN_LOBBY_FAIL',
	UPDATE_BALL_POS: 'UPDATE_BALL_POS',
	UPDATE_LOBBY_ID: 'UPDATE_LOBBY_ID',
	UPDATE_SOCKET_ID: 'UPDATE_SOCKET_ID',
}

/**
 * Try to JSON.parse data.
 * @param {array} data - Could for example be data passed through a websocket connection; In that case, first item should be an action (see actionTypes), the rest of the items should be params for that action.
 * @example
 * const [action, ...args] = extractData("[actionTypes.CREATE_PLAYER, \"MyUsername\"]");
 */
export const extractData = (data) => {
	try {
		data = JSON.parse(data);
	} catch(e) {}

	return data;
}