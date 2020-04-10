Todo:
- Styling!
- Remove unused fonts.
- When clicking "Start" button, disable it until game is over.
- Game Rules: first to x points.
- When winner is crowned: "Restart game?" and "Go to main menu" buttons.
- What should happen if more than 2 players join the same lobby? Should it even be possible?
- Spectator mode.
- Restart game.
- Pause game.
- Chat? Private and/or public? Premade messages?
- Store player positions server side, instead of only sending them between players? This way, current player1 position is visible for player2 as soon as he joins.
- Simpler id's/gamepins?

In progress:
- App doesn't run in:
	- iOS Safari (Constantly disconnects from server).
	- iOS or Chrome (Constantly disconnects from server).
	- OSX Firefox ('SyntaxError: private fields are not currently supported, in store-class.js:45:9'). Fixed.
	- OSX Safari ('SyntaxError: Unexpected token '='. Expected an opening '(' before a method's parameter list'). Fixed.

Probably done/Keep an eye on:
- When player2 joins _after_ the game has started, he gets 2 points the first time player1 fails. Doesn't seem to be consistently reproducable. Fix it though.

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
- When clicking "Start" button, players names turn huge. Fix.
- Collision detection: When player/ball moves, calculate whether ball is hit and broadcast it to all players in the lobby.
- When ball moves downwards for Player 1, it should move upwards for Player 2.
- When ball moves left for Player 1, it should move right for Player 2.
- Ball: Make sure it reaches the edges at the same time for all players in lobby, regardless of screen width/height.
- isCrossingBounds doesn't work across different screen sizes. Ball changes direction too early/late.
- When player1 moves right, it should move left for player2. And vice versa.
- Player 2 unable to hit ball after implementing isCrossingBounds. Sometimes able (it seems player1 positions are "the correct ones" and will count towards hits), but ball x direction changes the wrong way. Fix.
- Scoring.
- When player joins lobby, all player positions (and scores?) are reset. They shouldn't be. Also, use LEFT_LOBBY action instead of UPDATE_PLAYERS_IN_LOBBY.
- Differentiate the players, visually.