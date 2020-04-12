export const actionTypes = {
	CREATE_LOBBY: 'CREATE_LOBBY',
	CREATE_PLAYER: 'CREATE_PLAYER',
	CROWN_WINNER: 'CROWN_WINNER',
	FILE_CHANGED: 'FILE_CHANGED',
	JOIN_LOBBY: 'JOIN_LOBBY',
	JOIN_LOBBY_FAIL: 'JOIN_LOBBY_FAIL',
	KICK: 'KICK',
	LEFT_LOBBY: 'LEFT_LOBBY',
	RESET_BALL_INFO: 'RESET_BALL_INFO',
	RESET_PLAYER_SCORES: 'RESET_PLAYER_SCORES',
	START_GAME: 'START_GAME',
	UPDATE_BALL_INFO: 'UPDATE_BALL_INFO',
	UPDATE_BALL_VELOCITY: 'UPDATE_BALL_VELOCITY',
	UPDATE_LOBBY_COUNTDOWN: 'UPDATE_LOBBY_COUNTDOWN',
	UPDATE_LOBBY_ID: 'UPDATE_LOBBY_ID',
	UPDATE_PLAYER_POS: 'UPDATE_PLAYER_POS',
	UPDATE_PLAYER_SCORE: 'UPDATE_PLAYER_SCORE',
	UPDATE_PLAYERS_IN_LOBBY: 'UPDATE_PLAYERS_IN_LOBBY',
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