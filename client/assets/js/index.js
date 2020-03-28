// import {socket} from './websockets/socket.js';
import {MyApp} from './components/my-app.js';
import {MainMenu} from './components/main-menu.js';
import {PongGame} from './components/pong-game.js';
import {DialogMessage} from './components/dialog-message.js';

window.customElements.define('my-app', MyApp);
window.customElements.define('main-menu', MainMenu);
window.customElements.define('pong-game', PongGame);
window.customElements.define('dialog-message', DialogMessage);