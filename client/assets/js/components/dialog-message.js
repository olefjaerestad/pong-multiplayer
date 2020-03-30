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
			</dialog>
			<style>
				dialog-message dialog {
					position: fixed;
    			top: 20px;
				}
			</style>`;

		this.timeoutId = setTimeout(() => this.unrender(), 5000);
	}

	unrender() {
		clearTimeout(this.timeoutId);
		this.dispatchEvent(new CustomEvent('close'));
		this.remove();
	}

	connectedCallback() {
		this.render();
	}
}