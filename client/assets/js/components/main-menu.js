import {createPlayer, createLobby, joinLobby} from '../websockets/actions.js';
import {store} from '../store/store.js';

export class MainMenu extends HTMLElement {
	static get observedAttributes() { return ['is-logged-in', 'is-in-lobby'] }

	get isLoggedIn() {
		return this.getAttribute('is-logged-in') === 'true';
	}
	get isInLobby() {
		return this.getAttribute('is-in-lobby') === 'true';
	}

	render() {
		this.innerHTML = '';
		const createPlayerForm = document.createElement('form');
		const createLobbyForm = document.createElement('form');
		const joinLobbyForm = document.createElement('form');
		const formContainer = document.createElement('div');
		const style = document.createElement('style');

		formContainer.classList.add('forms');

		createPlayerForm.addEventListener('submit', e => {
			e.preventDefault();
			const data = {};
			const dataObj = new FormData(e.target);

			for (const row of dataObj.entries()) {
				data[row[0]] = row[1];
			}
			
			createPlayer(data.username)
				.then(username => this.dispatchEvent(new CustomEvent('created-player')));
		});

		createLobbyForm.addEventListener('submit', e => {
			e.preventDefault();

			createLobby();
		});

		joinLobbyForm.addEventListener('submit', e => {
			e.preventDefault();
			const data = {};
			const dataObj = new FormData(e.target);

			for (const row of dataObj.entries()) {
				data[row[0]] = row[1];
			}

			joinLobby(store.state.socketId, data.gamepin);
		});

		createPlayerForm.innerHTML = /*html*/`
			<input type="text" name="username" placeholder="Username" required>
			<input type="submit" value="Let's play!">
		`;

		createLobbyForm.innerHTML = /*html*/`
			<input type="submit" value="Create lobby">
		`;

		joinLobbyForm.innerHTML = /*html*/`
			<input type="text" name="gamepin" placeholder="Game pin (get this from the game host)" required>
			<input type="submit" value="Join lobby">
		`;

		style.textContent = /*css*/`
			main-menu h1 {
				font-size: 45vw;
				margin: 0;
				transform: translate3d(-50%,-50%,0);
				position: fixed;
				top: 50%;
				left: 50%;
				opacity: .5;
			}
			main-menu .forms {
				transform: translate3d(-50%,-50%,0);
				position: fixed;
				top: 50%;
				left: 50%;
			}
		`;

		if (this.isLoggedIn && this.isInLobby) {
			this.remove();
		} else if (!this.isLoggedIn) {
			this.innerHTML = '<h1>Pong!</h1>';
			formContainer.appendChild(createPlayerForm);
			this.appendChild(formContainer);
			this.appendChild(style);
		} else if (!this.isInLobby) {
			this.innerHTML = '<h1>Pong!</h1>';
			formContainer.appendChild(createLobbyForm);
			formContainer.appendChild(joinLobbyForm);
			this.appendChild(formContainer);
			this.appendChild(style);
		}
	}

	attributeChangedCallback(attr, val, prevVal) {
		this.render();
	}

	connectedCallback() {
		this.render();
	}
}