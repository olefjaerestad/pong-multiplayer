Todo:
- Simpler id's/gamepins? Make your own?
- Make game installable (PWA).
- Blurred player names (Tried a bit but unable to fix atm).
	- https://www.html5rocks.com/en/tutorials/canvas/hidpi/
	- https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
	- https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
- Ball velocity changes when player hits it are a bit exaggerated?
- What should happen if more than 2 players join the same lobby? Should it even be possible?
- Pause game?
- Spectator mode?
- Chat? Private and/or public? Premade messages?
- When launched; make sure to have https/ssl?
- When launched; make sure the client websocket connects to the correct domain.

In progress:

Probably done/Keep an eye on:
- When player2 joins _after_ the game has started, he gets 2 points the first time player1 fails. Doesn't seem to be consistently reproducable. Fix it though.
- (iOS) Chrome: sometimes the canvas is way too low. Wrap initial PongGame.setElementSizes() in a timeout?
- Adjust ball speed. Should it increase over time?

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
- App doesn't run in:
	- iOS Safari (Constantly disconnects from server). Fixed.
	- iOS or Chrome (Constantly disconnects from server). Fixed.
	- OSX Firefox ('SyntaxError: private fields are not currently supported, in store-class.js:45:9'). Fixed.
	- OSX Safari ('SyntaxError: Unexpected token '='. Expected an opening '(' before a method's parameter list'). Fixed.
- Styling!
	- Place the sidebar off-screen on small screens? Fixed.
	- OSX Firefox background color. Fixed.
	- OSX Safari input background color. Fixed.
	- OSX Safari input placeholder color. Fixed.
- Remove unused fonts.
- More spacing below pongGame.me on smaller screens, and make that area touchable.
- The settings button should be a cog SVG.
- Delete socket on disconnect.
- 'Copy' gamepin button. Use native share?
- Randomize whether ball is served towards player1 or player2.
- Game Rules: first to x points.
	- Stop game when winner is crowned.
	- "Restart game" button.
- When clicking "Start" button, disable it until game is over.

Don't do:
- Differentiate the players, visually. Update: Doing it requires a tiny performance hit. Don't think it's worth it.
- When player2 joins, leaves and rejoins, an already started game should still work (although score will obviously be reset). Update: Hmm, is there any point really?
- Store player positions server side, instead of only sending them between players? This way, current player1 position is visible for player2 as soon as he joins. Update: Too little gain to be worth the tiny performance hit of accessing server RAM?
- iOS Safari/Chrome: .gamepinInfo gets transparent background when clicking "Copy gamepin".