function SmokeParticle(x, y, ttl, id)
{
	Particle.call(this, x, y, "smoke", ttl, "smoke-" + id);
}

SmokeParticle.prototype = Object.create(Particle.prototype);

SmokeParticle.prototype.draw = function(ctx, scale)
{
	ctx.beginPath();
	ctx.arc(this.pos.x * scale, this.pos.y * scale, this.radius * scale, 0, 2 * Math.PI);

	let brightness = 183;
	let dim_limit = 50;
	let dim = 0;

	if (this.ttl < dim_limit)
	{
		dim = (dim_limit - this.ttl) * parseInt(brightness / dim_limit);
		if (dim > brightness)
			dim = brightness;
	}

	let r = brightness - dim;
	let g = brightness - dim;
	let b = brightness - dim;
	ctx.fillStyle = `rgb(${r}, ${b}, ${g})`;
	ctx.fill();

	this.after_draw();
};

