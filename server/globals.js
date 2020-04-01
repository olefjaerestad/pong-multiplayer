const sockets = {}; // {socketId: WebSocket}
const lobbies = {}; // {socketId: Lobby}
const players = {}; // {socketId: Player}

module.exports = {
	sockets,
	lobbies,
	players,
}