Todo:
- When player joins lobby, all player positions (and scores?) are reset. They shouldn't be. Use PLAYER_JOINED, PLAYER_LEFT actions instead of UPDATE_PLAYERS_IN_LOBBY.
- When ball moves downwards for Player 1, it should move upwards for Player 2.
- When ball moves left for Player 1, it should move right for Player 2.
- Game Rules: first to x points.
- When winner is crowned: "Restart game?" and "Go to main menu" buttons.
- What should happen if more than 2 players join the same lobby? Should it even be possible?
- Spectator mode.
- Restart game.
- Pause game.
- Chat? Private and/or public? Premade messages?

In progress:
- Ball: Make sure it reaches the edges at the same time for all players in lobby, regardless of screen width/height.
- Collision detection: When player/ball moves, calculate whether ball is hit and broadcast it to all players in the lobby.
- Scoring.

Done:
- Error handling if joining non-existent lobby.
- Remove player (and lobby if player is host) on disconnect.
- Kick players from lobby if host leaves.
- Make player visible for other players in the lobby.
- 'Me' should always be at the bottom of the screen, while opponent should be at the top.
- Make player moveable.
- When player moves, send position to server and broadcast it to all players in the lobby.
- Touch support.
- Move some default logic (e.g. player and ball starting stats) over to the server.
- "Start game" button with "Game starting in ..." countdown timer.
- Make player (and ball?) sizes relative to viewport width, to avoid difficulty differences across different widths.
- Make the ball!