function SaltParticle(x, y, ttl, id)
{
	Particle.call(this, x, y, "salt", ttl, "salt-" + id);
}

SaltParticle.prototype = Object.create(Particle.prototype);

SaltParticle.prototype.draw = function(ctx, scale)
{
	ctx.beginPath();
	ctx.arc(this.pos.x * scale, this.pos.y * scale, this.radius * scale, 0, 2 * Math.PI);
	ctx.fillStyle = "#ffffff";
	ctx.fill();

	this.after_draw();
};

