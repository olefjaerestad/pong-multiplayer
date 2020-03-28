export class DialogMessage extends HTMLElement {
	get message() {
		return this.getAttribute('message');
	}

	render() {
		this.innerHTML = /*html*/`
			<dialog open>
				<p>${this.message}</p>
				<form method="dialog">
					<button value="close">Close</button>
				</form>
			</dialog>`;

		this.timeoutId = setTimeout(() => this.unrender(), 5000);
	}

	unrender() {
		this.remove();
	}

	connectedCallback() {
		this.render();
	}
}