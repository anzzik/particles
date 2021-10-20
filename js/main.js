var canvas;
var ctx;
var h;
var w;
var scl_h;
var scl_w;
var p_map;
var scale = 2;
var g_id_counter = 1;
var g_frames = 0;
var g_prev_frames = 0;
var g_timestamp = 0;
var g_fps_store = [];
var g_avg_fps = 0;
var m_xy = {
	x: 0,
	scl_x: 0,
	y: 0,
	scl_y: 0,
	down: false
};

var g_particles = [];

function window_init()
{
	console.log("starting loop");
	canvas = document.getElementById('canvas');
	w = $(canvas).attr('width');
	h = $(canvas).attr('height');
	scl_w = parseInt(w/scale);
	scl_h = parseInt(h/scale);
	ctx = canvas.getContext("2d");

	$(canvas).bind('touchstart', on_touch_start);
	$(canvas).bind('touchmove', on_touch_move);
	$(canvas).bind('touchend', on_touch_end);
	$(canvas).mousemove(on_mouse_move);
	$(canvas).mousedown(on_mouse_down);
	$(canvas).mouseup(on_mouse_up);

	init_p_map(scl_w, scl_h);
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
	if (y < 0 || y >= scl_h || x < 0 || x >= scl_w)
	{
		let boundary_x = 0;
		let boundary_y = 0;

		if (x >= scl_w)
			boundary_x = scl_w - 1;

		if (y >= scl_h)
			boundary_y = scl_h - 1;

		return true;
	}

	let map_row = p_map[y];
	return map_row[x];
}

function p_map_set(x, y, p)
{
	let old_p = p_map_get(x, y);
	if (old_p === true)
	{
		console.log("p_map_set: out of bounds (" + x + ", " + y + ")");
		console.log(p);
		return;
	}

	p_map[y][x] = p;
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
	m_xy.scl_x = xy.x;
	m_xy.scl_y = xy.y;
}

function on_mouse_down(e)
{
	let xy = getMousePos(canvas, e);
	m_xy.x = xy.x;
	m_xy.y = xy.y;
	m_xy.scl_x = xy.x;
	m_xy.scl_y = xy.y;
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
	let range = 30;
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
		if (r_x >= scl_w)
			r_x = scl_w - 1;
		if (r_y >= scl_h)
			r_y = scl_h - 1;

		let p = new Particle(r_x, r_y, 'salt', 300, 'salt-' + g_id_counter++);
		p_map_set(r_x, r_y, p);
		g_particles.push(p);
	}

	for (let i = 0; i < n / 2; i++)
	{
		let r_x = parseInt(Math.random() * range - (range/2));
		let r_y = parseInt(Math.random() * range - (range/2));
		r_x += x;
		r_y += y;

		if (r_x < 0)
			r_x = 0;
		if (r_y < 0)
			r_y = 0;
		if (r_x >= scl_w)
			r_x = scl_w - 1;
		if (r_y >= scl_h)
			r_y = scl_h - 1;

		if (p_map_get(r_x, r_y))
			continue;

		let p = new Particle(r_x, r_y, 'smoke', 500, 'smoke-' + g_id_counter++);
		p_map_set(r_x, r_y, p);
		g_particles.push(p);
	}
}

function draw_particles(particles)
{
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, w, h);

	for (let y = scl_h - 1; y >= 0; y--)
	{
		for (let x = 0; x < scl_w; x++)
		{
			let draw_only = false;

			let p = p_map_get(x, y);
			if (!p)
				continue;

			if (!p.ttl)
			{
				p_map_set(x, y, false);
				continue;
			}

			if (p.drawn)
				continue;

			let current_pos = p.pos;

			if (y == scl_h - 1 || (p.type == 'smoke' && y == 0))
				draw_only = true;

			if (p.type == 'salt' && p_map_get(x, y+1))
				if (p_map_get(x-1, y+1) && p_map_get(x+1, y+1))
					draw_only = true;

			if (p.type == 'smoke' && p_map_get(x, y-1))
				if (p_map_get(x-1, y-1) && p_map_get(x+1, y-1))
					draw_only = true;

			if (draw_only)
			{
				p.vel.set(0, 0);
				p.draw(ctx, scale);
				continue;
			}

			let g = null;
			if (p.type == 'salt')
			{
				g = new Vector(0, 11);
				p.apply_force(g);
			}

			if (p.type == 'smoke')
			{
				g = new Vector(0, -2);
				p.vel.set(0, -2);
			}

			let new_pos = p.get_next_position();
			sanitize_vector(new_pos);

			let y_inc = 0;
			let x_inc = 0;

			let next_pos = new Vector(current_pos.x, current_pos.y);
			if (new_pos.y != current_pos.y)
				y_inc = parseInt((new_pos.y - current_pos.y) / Math.abs(new_pos.y - current_pos.y));

			if (new_pos.x != current_pos.x)
				x_inc = parseInt((new_pos.x - current_pos.x) / Math.abs(new_pos.x - current_pos.x));

			let inc_v = new Vector(x_inc, y_inc);
			next_pos.add(inc_v);

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
						if (p_map_get(f_x - x_inc, f_y - y_inc))
							next_pos.set(current_pos.x, current_pos.y);
						else
							next_pos.set(f_x - x_inc, f_y - y_inc);
					}

					break;
				}

				next_pos.add(inc_v);
			}

			sanitize_vector(next_pos);

			p_map_set(p.pos.x, p.pos.y, false);
			p.pos.set(next_pos.x, next_pos.y);
			p_map_set(next_pos.x, next_pos.y, p);
			p.draw(ctx, scale);
		}
	}

	reset_draw_status(g_particles);
}

function sanitize_vector(v)
{
	if (v.x < 0)
		v.x = 0;
	if (v.x >= scl_w)
		v.x = scl_w - 1;
	if (v.y < 0)
		v.y = 0;
	if (v.y >= scl_h)
		v.y = scl_h - 1;
}

function reset_draw_status(particles)
{
	for (let i in particles)
		particles[i].drawn = false;
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
		generate_particles(m_xy.scl_x, m_xy.scl_y, 30)

	draw_particles(g_particles);
	if (g_particles.length > 5000)
		free_particles(g_particles, 50);

	let now = performance.now();
	if (g_timestamp > 0 && g_prev_frames > 0)
	{
		let delta_ms = now - g_timestamp;
		let delta_f = g_frames - g_prev_frames;
		fps = delta_f / delta_ms * 1000;
		g_fps_store.push(fps);
	}

	if (g_fps_store.length == 50)
	{
		let total_fps = g_fps_store.reduce(function(prev, current) {
			return prev + current;
		});

		g_avg_fps = parseInt(total_fps / g_fps_store.length);
		g_fps_store = [];

		$('#particle-debug').text('Currently ' + g_particles.length + ' particles on screen');
	}

	$('#fps-debug').text('Frames ' + g_frames + ' (' + parseInt(g_avg_fps) + ' avg FPS)');

	g_prev_frames = g_frames;
	g_timestamp = now;
	g_frames++;
	setTimeout(start_loop, 16);
}

function getMousePos(canvas, evt)
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: parseInt((evt.clientX - rect.left) / scale),
		y: parseInt((evt.clientY - rect.top) / scale)
	};
}

$(document).ready(window_init);

