function SnowParticle(x, y, ttl, id)
{
	Particle.call(this, x, y, "snow", ttl, "snow-" + id);
}

SnowParticle.prototype = Object.create(Particle.prototype);

SnowParticle.prototype.draw = function(ctx, scale)
{
	ctx.beginPath();
	ctx.arc(this.pos.x * scale, this.pos.y * scale, this.radius * scale, 0, 2 * Math.PI);
	ctx.fillStyle = "#ffffff";
	ctx.fill();

	this.after_draw();
};

