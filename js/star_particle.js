function StarParticle(x, y, ttl, id)
{
	Particle.call(this, x, y, "star", ttl, "star-" + id);
}

StarParticle.prototype = Object.create(Particle.prototype);

StarParticle.prototype.draw = function(ctx, scale)
{
	ctx.beginPath();
	ctx.arc(this.pos.x * scale, this.pos.y * scale, this.radius * scale, 0, 2 * Math.PI);

	let rnd = parseInt(Math.random() * 100);
	ctx.fillStyle = "#ffffff";
	if ([0, 1, 2, 3, 4, 5, 6].indexOf((this.rendercount + rnd) % 20) >= 0)
		ctx.fillStyle = "#ffff00";

	ctx.fill();
	this.after_draw();
};

