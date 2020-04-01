/**
 * The Ball that moves across the screen
 * @param {HTMLCanvasElement} canvas the canvas element this Ball belongs to
 */
function Ball (/* canvas */) {
	// this.canvas = canvas;
	// this.getCalculatedRadius = () => {
	// 	return Math.max(canvas.width / 50, 15);
	// }
	// this.radius = Math.max(canvas.width / 50, 15);
	// this.radius = this.getCalculatedRadius();
	// this.x = canvas.width / 2;
	// this.y = canvas.height / 2;
	this.radius = .1;
	this.x = .5;
	this.y = .5;
	this.velocity = {
		x: 0,
		y: .05,
	}
	// this.c = this.canvas.getContext('2d');

	// this.update = () => {
	// 	this.draw();
	// }

	// this.draw = () => {
	// 	this.c.beginPath();
	// 	this.c.fillStyle = colors.primary;
	// 	this.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
	// 	this.c.fill();
	// 	this.c.closePath();
	// }
}
Ball.prototype.getDefaultPos = function() {
	return {
		x: .5,
		y: .5,
	}
}
Ball.prototype.getDefaultVelocity = function() {
	return {
		x: 0,
		y: .05,
	}
}