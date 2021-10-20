function Particle(x, y, type, ttl, id)
{
	this.pos  = new Vector(x, y);
	this.vel  = new Vector(0, 0);
	this.acc  = new Vector(0, 0);
	this.ttl  = ttl;
	this.rendercount = 0;
	this.type = type;
	this.id   = id;
	this.mass = 10.2;
	this.radius = 1;
	this.drawn = false;

	this.apply_force = function(f_vec)
	{
		this.acc.set(0, 0);

		f_vec.div(this.mass);
		this.acc.add(f_vec);
		this.acc.x = this.acc.x;
		this.acc.y = this.acc.y;
		this.vel.add(this.acc);
	};

	this.get_next_position = function()
	{
		let new_pos = new Vector(this.pos.x, this.pos.y);
		new_pos.add(this.vel);
		new_pos.x = parseInt(new_pos.x);
		new_pos.y = parseInt(new_pos.y);

		if (this.type == 'smoke')
		{
			let r = parseInt(Math.random() * 100);
			if (r > 50)
			{
				if (r > 75)
					new_pos.x += 1;
				else
					new_pos.x -= 1;
			}
		}

		return new_pos;
	};

	this.draw = function(ctx, scale)
	{
		ctx.beginPath();
		ctx.arc(this.pos.x * scale, this.pos.y * scale, this.radius * scale, 0, 2 * Math.PI);

		switch (this.type)
		{
			case 'salt':
				ctx.fillStyle = "#ffffff";
				break;
			case 'snow':
				ctx.fillStyle = "#ffffff";
				break;
			case 'smoke':
				ctx.fillStyle = "#999999";
				break;
			case 'moon':
				ctx.fillStyle = "#ffff00";
				break;
			case 'antimoon':
				ctx.fillStyle = "#000000";
				break;
			case 'star':
				let r = parseInt(Math.random() * 100);
				ctx.fillStyle = "#ffffff";
				if ([0, 1, 2, 3, 4, 5, 6].indexOf((this.rendercount + r) % 20) >= 0)
					ctx.fillStyle = "#ffff00";

				break;
			default:
				ctx.fillStyle = "#ff00ff";
		}

		ctx.fill();
		this.drawn = true;

		this.rendercount++;
		if (this.ttl > 0)
			this.ttl--;
	};
}

