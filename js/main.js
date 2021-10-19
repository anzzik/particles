var canvas;
var ctx;
var h;
var w;
var p_map;
var m_xy = {
	x: 0,
	y: 0,
	down: false
};

var g_particles = [];

function window_init()
{
	console.log("starting loop");
	canvas = document.getElementById('canvas');
	w = $(canvas).attr('width');
	h = $(canvas).attr('height');
	ctx = canvas.getContext("2d");

	$(canvas).bind('touchstart', on_touch_start);
	$(canvas).bind('touchmove', on_touch_move);
	$(canvas).bind('touchend', on_touch_end);
	$(canvas).mousemove(on_mouse_move);
	$(canvas).mousedown(on_mouse_down);
	$(canvas).mouseup(on_mouse_up);

	init_p_map(w, h);
	start_loop();
}

function on_touch_start(e)
{
	$('#touch-debug').text("touch start");
	var touch = e.touches[0];
	var mouseEvent = new MouseEvent("mousedown", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});

	canvas.dispatchEvent(mouseEvent);
}

function on_touch_move(e)
{
	$('#touch-debug').text("touch move");
	var touch = e.touches[0];
	var mouseEvent = new MouseEvent("mousemove", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});

	canvas.dispatchEvent(mouseEvent);
}

function on_touch_end(e)
{
	$('#touch-debug').text("touch end");
	var mouseEvent = new MouseEvent("mouseup", {});
	canvas.dispatchEvent(mouseEvent);
}

function p_map_get(x, y)
{
	if (y < 0 || y >= h || x < 0 || x >= w)
	{
		let boundary_x = 0;
		let boundary_y = 0;

		if (x >= w)
			boundary_x = w - 1;

		if (y >= h)
			boundary_y = h - 1;

		return true;
	}

	let map_row = p_map[y];
	return map_row[x];
}

function init_p_map(map_w, map_h)
{
	p_map = [];

	for (let y = 0; y < map_h; y++)
	{
		let map_row = [];
		for (let x = 0; x < map_w; x++)
			map_row.push(false);

		p_map.push(map_row);
	}
}

function on_mouse_move(e)
{
	let xy = getMousePos(canvas, e);
	m_xy.x = xy.x;
	m_xy.y = xy.y;
}

function on_mouse_down(e)
{
	let xy = getMousePos(canvas, e);
	m_xy.x = xy.x;
	m_xy.y = xy.y;
	m_xy.down = true;
}

function on_mouse_up(e)
{
	m_xy.down = false;
}

function print_debug_info()
{
	$('#mouse-move-debug').text('Mouse: x: ' + m_xy.x + ', y: ' + m_xy.y);
	if (m_xy.down)
		$('#mouse-click-debug').text("Mouse down");
	else
		$('#mouse-click-debug').text("Mouse up");
}

function generate_particles(x, y, n)
{
	let range = 50;
	for (let i = 0; i < n; i++)
	{
		let r_x = parseInt(Math.random() * range - (range/2));
		let r_y = parseInt(Math.random() * range - (range/2));
		r_x += x;
		r_y += y;

		if (r_x < 0)
			r_x = 0;
		if (r_y < 0)
			r_y = 0;
		if (r_x >= w)
			r_x = w - 1;
		if (r_y >= h)
			r_y = h - 1;

		let p = new Particle(r_x, r_y);
		p_map[r_y][r_x] = p;
		g_particles.push(p);
	}
}

function draw_particles(particles)
{
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, w, h);

	for (let y = h - 1; y >= 0; y--)
	{
		for (let x = 0; x < w; x++)
		{
			let draw_only = false;

			let p = p_map_get(x, y);
			if (!p)
				continue;

			if (y == h - 1)
				draw_only = true;

			if (p_map_get(x, y+1))
				if (p_map_get(x-1, y+1) && p_map_get(x+1, y+1))
					draw_only = true;

			if (draw_only)
			{
				p.vel.set(0, 0);
				p.draw(ctx);
				continue;
			}

			let g = new Vector(0, 11);
			let current_pos = p.pos;

			p.applyForce(g);
			let new_pos = p.get_next_position();
			let inc = parseInt((new_pos.y - current_pos.y) / Math.abs(new_pos.y - current_pos.y));
			let next_pos = new Vector(current_pos.x, current_pos.y + inc);

			while (next_pos.y != new_pos.y)
			{
				let f_y = next_pos.y;
				let f_x = next_pos.x;

				if (p_map_get(f_x, f_y))
				{
					if (!p_map_get(f_x - 1, f_y))
					{
						next_pos.set(f_x - 1, f_y);
					}
					else if (!p_map_get(f_x + 1, f_y))
					{
						next_pos.set(f_x + 1, f_y);
					}
					else
					{
						next_pos.set(f_x, f_y - inc);
					}

					break;
				}

				next_pos.y += inc;
			}

			let old_pos = new Vector(p.pos.x, p.pos.y);
			p_map[old_pos.y][old_pos.x] = false;

			if (next_pos.y >= h)
				next_pos.y = h - 1;

			p.pos.set(next_pos.x, next_pos.y);
			p_map[next_pos.y][next_pos.x] = p;
			p.draw(ctx);
		}
	}
}

function free_particles(particles, n)
{
	for (let i = 0; i < n; i++)
	{
		let x = particles[i].pos.x;
		let y = particles[i].pos.y;

		p_map[y][x] = false;
	}

	particles.splice(0, n);
}

function start_loop()
{
	print_debug_info();

	if (m_xy.down)
		generate_particles(m_xy.x, m_xy.y, 30)

	draw_particles(g_particles);
	if (g_particles.length > 5000)
		free_particles(g_particles, 50);

	setTimeout(start_loop, 16);
}

function getMousePos(canvas, evt)
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: parseInt(evt.clientX - rect.left),
		y: parseInt(evt.clientY - rect.top)
	};
}

$(document).ready(window_init);

