import {store} from '../store/store.js';

export class MyApp extends HTMLElement {

	render() {
		const style = document.createElement('style');
		this.innerHTML = '';

		this.mainMenu.addEventListener('created-player', () => {
			this.isLoggedIn = true;
			this.mainMenu.setAttribute('is-logged-in', this.isLoggedIn);
		});
		this.mainMenu.addEventListener('joined-lobby', () => {
			this.isInLobby = true;
			this.mainMenu.setAttribute('is-in-lobby', this.isInLobby);
		});
		style.textContent = /*css*/`
			my-app {
				/* background: linear-gradient(to bottom, var(--c-background-1), var(--c-background-2)); */
				background: linear-gradient(to bottom, var(--c-background-1) 20%, var(--c-background-2) 80%, var(--c-background-3));
				height: 100vh;
				display: block;
			}
		`
		this.appendChild(this.mainMenu);
		this.appendChild(style);

		if (this.isLoggedIn && this.isInLobby) this.appendChild(this.pongGame);
	}

	connectedCallback() {
		this.isLoggedIn = false;
		this.isInLobby = false;
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