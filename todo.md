Todo:
- Move some default logic (e.g. player and ball starting stats) over to the server.
- Make player visible for other players in the lobby.
- Make player moveable.
- When player moves, send position to server and broadcast it to all players in the lobby.
- When player moves, calculate whether ball is hit and broadcast it to all players in the lobby.

Done:
- Error handling if joining non-existent lobby.
- Remove player (and lobby if player is host) on disconnect.
- Kick players from lobby if host leaves.