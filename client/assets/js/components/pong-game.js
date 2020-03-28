export class PongGame extends HTMLElement {
	render() {
		this.innerHTML = '';

		this.stats = document.createElement('div');
		this.canvas = document.createElement('canvas');
		this.c = this.canvas.getContext('2d');
		const style = document.createElement('style');

		this.stats.classList.add('stats');

		this.style.textContent = style.textContent = /*css*/`
			pong-game {
				width: 100vw;
				height: 100vh;
				display: flex;
			}
			pong-game canvas {
				background-color: black;
				flex: 1;
			}
			pong-game .stats {
				background-color: lightgreen;
				width: 200px;
			}
		`;

		this.appendChild(this.canvas);
		this.appendChild(this.stats);
		this.appendChild(style);
		console.log(this.c);
	}

	connectedCallback() {
		this.render();
	}
}