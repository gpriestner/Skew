const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;
const image = new Image();
image.onload = () => {
    drawSquare({ x: 100, y: 100 }, { x: 300, y: 300}, { x: 100, y: 300 });
}
image.src = 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-1.2.1&q=80&fm=jpg';
const controls = [];
let triangles = [];
let dirtyTriangles = false;

const rand = function(s,e) {
	return Math.random() * (e-s) + s;
}
  
function init() {
	for (var i = 0; i < 4; ++i) {
		var control = document.createElement('div');
        control.classList.add('node');
        document.body.append(control);
		controls.push(control);
	}

    controls[0].style.left = rand(25, 225) + "px";
    controls[0].style.top = rand(25, 225) + "px";
    controls[1].style.left = rand(250, 475) + "px";
    controls[1].style.top = rand(25, 225) + "px";
    controls[2].style.left = rand(250, 475) + "px";
    controls[2].style.top = rand(250, 475) + "px";
    controls[3].style.left = rand(25, 225) + "px";
    controls[3].style.top = rand(250, 475) + "px";

	document.body.onmousedown = (e) => {
		if (e.target.classList.contains('node')) {
			var node = e.target;

			document.body.onmousemove = (e) => {
				var x = e.pageX;
				var y = e.pageY;
                node.style.left = x + "px";
                node.style.top = y + "px";
				dirtyTriangles = true;
			};

			document.body.onmouseup = (e) => {
                document.body.onmousemove = null;
                document.body.onmpuseup = null;
			};
		}
	}
}

var calculateGeometry = function() {
	// clear triangles out
	triangles = [];

	// generate subdivision
	var subs = 1; // vertical subdivisions
	var divs = 1; // horizontal subdivisions

	var p1 = new Point(parseInt(controls[0].style.left) + 6, parseInt(controls[0].style.top + 6));
	var p2 = new Point(parseInt(controls[1].style.left) + 6, parseInt(controls[1].style.top + 6));
	var p3 = new Point(parseInt(controls[2].style.left) + 6, parseInt(controls[2].style.top + 6));
	var p4 = new Point(parseInt(controls[3].style.left) + 6, parseInt(controls[3].style.top + 6));

	var dx1 = p4.x - p1.x;
	var dy1 = p4.y - p1.y;
	var dx2 = p3.x - p2.x;
	var dy2 = p3.y - p2.y;

	var imgW = image.naturalWidth;
	var imgH = image.naturalHeight;

	for (var sub = 0; sub < subs; ++sub) {
		var curRow = sub / subs;            // 0
		var nextRow = (sub + 1) / subs;     // 1

		var curRowX1 = p1.x + dx1 * curRow; // p1.x
		var curRowY1 = p1.y + dy1 * curRow; // p1.y
		
		var curRowX2 = p2.x + dx2 * curRow; // p2.x
		var curRowY2 = p2.y + dy2 * curRow; // p2.y

		var nextRowX1 = p1.x + dx1 * nextRow;  // p4.x
		var nextRowY1 = p1.y + dy1 * nextRow;  // p4.y
		
		var nextRowX2 = p2.x + dx2 * nextRow;  // p3.x
		var nextRowY2 = p2.y + dy2 * nextRow;  // p3.y

		for (var div = 0; div < divs; ++div) {
			var curCol = div / divs;              // 0
			var nextCol = (div + 1) / divs;       // 1

			var dCurX = curRowX2 - curRowX1;      // p2.x - p1.x
			var dCurY = curRowY2 - curRowY1;      // p2.y - p1.y
			var dNextX = nextRowX2 - nextRowX1;   // p3.x - p4.x
			var dNextY = nextRowY2 - nextRowY1;   // p3.y - p4.y

			var p1x = curRowX1 + dCurX * curCol;  // p1.x
			var p1y = curRowY1 + dCurY * curCol;  // p1.y

			var p2x = curRowX1 + (curRowX2 - curRowX1) * nextCol;  // p2.x
			var p2y = curRowY1 + (curRowY2 - curRowY1) * nextCol;  // p2.y

			var p3x = nextRowX1 + dNextX * nextCol; // p3.x
			var p3y = nextRowY1 + dNextY * nextCol; // p3.y

			var p4x = nextRowX1 + dNextX * curCol; // p4.x
			var p4y = nextRowY1 + dNextY * curCol; // p4.y

			var u1 = curCol * imgW;               // 0
			var u2 = nextCol * imgW;              // image.naturalWidth
			var v1 = curRow * imgH;               // 0
			var v2 = nextRow * imgH;              // imgage.naturalHeight

			var triangle1 = new Triangle(
				new Point(p1x-1, p1y),
				new Point(p3x+2, p3y+1),
				new Point(p4x-1, p4y+1),
				new TextCoord(u1, v1),   // 0, 0
				new TextCoord(u2, v2),   // image.width, image.height
				new TextCoord(u1, v2)    // 0, image.height
			);

			var triangle2 = new Triangle(
				new Point(p1x-2, p1y),
				new Point(p2x+1, p2y),
				new Point(p3x+1, p3y+1),
				new TextCoord(u1, v1),  // 0, 0
				new TextCoord(u2, v1),  // image.width, 0
				new TextCoord(u2, v2)   // image.width, image.height
			);

			triangles.push(triangle1);
			triangles.push(triangle2);
		}
	}
}
var drawTriangle = function(ctx, im, x0, y0, x1, y1, x2, y2, sx0, sy0, sx1, sy1, sx2, sy2) {
    ctx.save();
    // Clip the output to the on-screen triangle boundaries.
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    //ctx.stroke(); // for wireframe
    //ctx.clip();

    /*
    ctx.transform(m11, m12, m21, m22, dx, dy) sets the context transform matrix.

    The context matrix is:

    [ m11 m21 dx ]
    [ m12 m22 dy ]
    [  0   0   1 ]

    Coords are column vectors with a 1 in the z coord, so the transform is:
    x_out = m11 * x + m21 * y + dx;
    y_out = m12 * x + m22 * y + dy;

    From Maxima, these are the transform values that map the source
    coords to the dest coords:

    sy0 (x2 - x1) - sy1 x2 + sy2 x1 + (sy1 - sy2) x0
    [m11 = - -----------------------------------------------------,
    sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

    sy1 y2 + sy0 (y1 - y2) - sy2 y1 + (sy2 - sy1) y0
    m12 = -----------------------------------------------------,
    sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

    sx0 (x2 - x1) - sx1 x2 + sx2 x1 + (sx1 - sx2) x0
    m21 = -----------------------------------------------------,
    sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

    sx1 y2 + sx0 (y1 - y2) - sx2 y1 + (sx2 - sx1) y0
    m22 = - -----------------------------------------------------,
    sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

    sx0 (sy2 x1 - sy1 x2) + sy0 (sx1 x2 - sx2 x1) + (sx2 sy1 - sx1 sy2) x0
    dx = ----------------------------------------------------------------------,
    sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

    sx0 (sy2 y1 - sy1 y2) + sy0 (sx1 y2 - sx2 y1) + (sx2 sy1 - sx1 sy2) y0
    dy = ----------------------------------------------------------------------]
    sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
  */

    // TODO: eliminate common subexpressions.
    var denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
    if (denom == 0) return;

    var m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
    var m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
    var m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
    var m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
    var dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
    var dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;

    ctx.transform(m11, m12, m21, m22, dx, dy);

    // Draw the whole image.  Transform and clip will map it onto the
    // correct output triangle.
    //
    // TODO: figure out if drawImage goes faster if we specify the rectangle that
    // bounds the source coords.
    ctx.drawImage(im, 0, 0);
    ctx.restore();
}
function drawSquare(p1, p2, p3) {
    const x0 = p1.x;
    const y0 = p1.y;
    const x1 = p2.x;
    const y1 = p2.y;
    const x2 = p3.x;
    const y2 = p3.y;
    const sx0 = 0;
    const sy0 = 0;
    const sx1 = image.naturalWidth;
    const sy1 = image.naturalHeight;
    const sx2 = 0;
    const sy2 = image.naturalHeight;
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    //const denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
    const denom = -w * h;
    if (denom == 0) return;

    // var m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
    // var m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
    // var m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
    // var m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
    // var dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
    // var dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;


    var m11 = h * (p3.x - p2.x) / denom;
    var m12 = h * (p3.y - p2.y) / denom;
    var m21 = w * (p1.x - p3.x) / denom;
    var m22 = w * (p1.y - p3.y) / denom;
    var dx = p1.x; //(-w * h * x0) / denom;
    var dy = p1.y; //(-w * h * y0) / denom;





    // var m11 = (sy2 * x0 - sy2 * x1) / denom;
    // var m12 = (sy2 * y0 - sy2 * y1) / denom;
    // var m21 = (-sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
    // var m22 = (sx2 * y1 - sx1 * y2 + (sx2 - sx1) * y0) / denom;
    // var dx = x0; // (-sx1 * sy2) * x0 / denom;
    // var dy = y0; // (-sx1 * sy2) * y0 / denom;

    context.save();
    context.transform(m11, m12, m21, m22, dx, dy);
    context.drawImage(image, 0, 0);
    context.restore();
}
function drawSkew(p1, p2, p3) {
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const a = -w * h;
    if (a == 0) return;

    var m11 = (h * p1.x - h * p2.x) / a;
    var m12 = (h * p1.y - h * p2.y) / a;
    var m21 = (w * p2.x - w * p3.x) / a;
    var m22 = (w * p2.y - w * p3.y) / a;

    context.save();
    context.transform(m11, m12, m21, m22, p1.x, p1.y);
    context.drawImage(image, 0, 0);
    context.restore();
}
class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
class TextCoord {
    constructor(u = 0, v = 0) {
        this.u = u;
        this.v = v;
    }
}
class Triangle {
    constructor(p0, p1, p2, t0, t1, t2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.t0 = t0;
        this.t1 = t1;
        this.t2 = t2;
    }
}

//init();
function animate() {
	context.clearRect(0,0,canvas.width,canvas.height);

	if (dirtyTriangles) {
        calculateGeometry();
		dirtyTriangles = false;
	}

	for (const triangle of triangles)
        drawTriangle(context, image,
            triangle.p0.x, triangle.p0.y,
            triangle.p1.x, triangle.p1.y,
            triangle.p2.x, triangle.p2.y,
            triangle.t0.u, triangle.t0.v,
            triangle.t1.u, triangle.t1.v,
            triangle.t2.u, triangle.t2.v);

    requestAnimationFrame(animate);
}
//animate();
