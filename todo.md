Todo:
- Move some default logic (e.g. player and ball starting stats) over to the server.
- Touch support.
- When player/ball moves, calculate whether ball is hit and broadcast it to all players in the lobby.
- "Start game" button with "Game starting in ..." countdown timer.
- Game Rules: first to x points.
- When winner is crowned: "Restart game?" and "Go to main menu" buttons.
- What should happen if more than 2 players join the same lobby? Should it even be possible?
- Spectator mode.

Done:
- Error handling if joining non-existent lobby.
- Remove player (and lobby if player is host) on disconnect.
- Kick players from lobby if host leaves.
- Make player visible for other players in the lobby.
- 'Me' should always be at the bottom of the screen, while opponent should be at the top.
- Make player moveable.
- When player moves, send position to server and broadcast it to all players in the lobby.