function Particle(x, y)
{
	this.pos  = new Vector(x, y);
	this.vel  = new Vector(0, 0);
	this.acc  = new Vector(0, 0);
	this.mass = 10.2;

	this.applyForce = function(f_vec)
	{
		f_vec.div(this.mass);
		this.acc.add(f_vec);
		this.acc.x = parseInt(this.acc.x);
		this.acc.y = parseInt(this.acc.y);
	};

	this.get_next_position = function()
	{
		this.vel.add(this.acc);
		this.acc.set(0, 0);

		let new_pos = new Vector(this.pos.x, this.pos.y);
		new_pos.add(this.vel);

		return new_pos;
	};

	this.draw = function(ctx, scale)
	{
		ctx.beginPath();
		ctx.arc(this.pos.x * scale, this.pos.y * scale, 1 * scale, 0, 2 * Math.PI);
		ctx.fillStyle = "#ffffff";
		ctx.fill();
	};
}

