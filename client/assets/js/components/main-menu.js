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
		const formSeparator = document.createElement('p');
		const style = document.createElement('style');

		formSeparator.innerHTML = '<p>Or</p>';
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
			<input type="text" name="username" placeholder="Username" required autofocus>
			<input type="submit" value="Let's play!">
		`;

		createLobbyForm.innerHTML = /*html*/`
			<input type="submit" value="Create game">
		`;

		joinLobbyForm.innerHTML = /*html*/`
			<input type="text" name="gamepin" placeholder="Gamepin" required>
			<input type="submit" value="Join game">
			<small style="position: absolute; top: 110%; left: 0;">Get this from the game host</small>
		`;

		style.textContent = /*css*/`
			main-menu h1 {
				font-size: 35vmin;
				-webkit-text-fill-color: transparent;
				-webkit-text-stroke: 1px white;
				background: linear-gradient(to bottom, red, yellow);
				background-clip: text;
  			-webkit-background-clip: text;
				margin: 0;
				position: fixed;
				bottom: 40%;
				left: calc(50% - 1.25em); /* Instead of translate, due to https://stackoverflow.com/questions/55725461/webkit-background-clip-text-on-an-element-with-transition-is-not-working-after */
				opacity: .9;
				filter: drop-shadow(0px 0px 10px yellow);
			}
			main-menu .forms {
				max-width: 100%;
				padding: 10px;
				transform: translate3d(-50%,-50%,0);
				position: fixed;
				top: 70%;
				left: 50%;
			}
			main-menu form {
				display: flex;
				position: relative;
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
			formContainer.appendChild(formSeparator);
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