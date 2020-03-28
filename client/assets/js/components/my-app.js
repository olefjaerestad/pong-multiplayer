import {store} from '../store/store.js';

export class MyApp extends HTMLElement {
	isLoggedIn = false;
	isInLobby = false;

	render() {
		this.innerHTML = '';

		this.mainMenu.addEventListener('created-player', () => {
			this.isLoggedIn = true;
			this.mainMenu.setAttribute('is-logged-in', this.isLoggedIn);
		});
		this.mainMenu.addEventListener('joined-lobby', () => {
			this.isInLobby = true;
			this.mainMenu.setAttribute('is-in-lobby', this.isInLobby);
		});
		this.appendChild(this.mainMenu);

		if (this.isLoggedIn && this.isInLobby) this.appendChild(this.pongGame);
	}

	connectedCallback() {
		this.mainMenu = document.createElement('main-menu');
		this.pongGame = document.createElement('pong-game');

		store.subscribe((prop, val) => {
			if (prop === 'lobbyId' && val) {
				this.isInLobby = true;
				this.mainMenu.setAttribute('is-in-lobby', this.isInLobby);
				this.render();
			}
		});

		this.render();
	}
}