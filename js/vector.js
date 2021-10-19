function Vector(x, y)
{
	this.x = parseInt(x);
	this.y = parseInt(y);

	this.orig_x = parseInt(x);
	this.orig_y = parseInt(y);

	this.set = function(x, y)
	{
		this.x = parseInt(x);
		this.y = parseInt(y);
	};

	this.reset = function()
	{
		this.x = this.orig_x;
		this.y = this.orig_y;
	};

	this.add = function(v)
	{
		this.x += v.x;
		this.y += v.y;
	};

	this.sub = function(v)
	{
		this.x -= v.x;
		this.y -= v.y;
	};

	this.rotate = function(a)
	{
		var mat = [
			Math.cos(a), Math.sin(a) * -1,
			Math.sin(a), Math.cos(a)
		];

		var t_x = this.x * mat[0] + this.y * mat[1];
		var t_y = this.x * mat[2] + this.y * mat[3];

		this.x = Math.round(t_x * 100000) / 100000;
		this.y = Math.round(t_y * 100000) / 100000;
	};

	this.mul = function(a)
	{
		this.x *= a;
		this.y *= a;
	};

	this.div = function(a)
	{
		this.x /= a;
		this.y /= a;
	};

	this.getMag = function()
	{
		return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
	};

	this.setMag = function(m)
	{
		this.div(this.getMag());
		this.mul(m);
	};

	this.copy = function()
	{
		var v = new Vector();

		v.x = this.x;
		v.y = this.y;
		v.orig_x = this.orig_x;
		v.orig_y = this.orig_y;

		return v;
	}

	this.drawLine = function(ctx, from_x, from_y)
	{
		ctx.beginPath();
		ctx.moveTo(from_x, from_y);
		ctx.lineTo(from_x + this.x, from_y + this.y);
		ctx.stroke();
	}
}

