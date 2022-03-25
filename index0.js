// vertex shader 
src_vert = `#version 300 es
precision highp float;

in vec2 a;
out vec2 u;

void main() {
  u = a * 2. - 1.;
  gl_Position = vec4(u,0,1);
}`;

// fragment shader
src_frag = `#version 300 es
precision highp float;

in vec2 u;
out vec4 cc;
uniform vec2 res;
uniform float time;

void main() {    
    vec2 uv = u;
    vec3 col = vec3(sin(uv.x*8.+4.*time), uv.y, 0.5);
    cc = vec4(pow(clamp(col,0.,1.), vec3(1. / 2.2)), 1.);
}`;

// make a canvas and gl context
C=({body}=D=document).createElement('canvas');
body.appendChild(C);
gl=C.getContext('webgl2');

// initialize all the GL things
Shader=(typ, src)=>{
  const s=gl.createShader(typ);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// compile the shaders and create the program
program = gl.createProgram();
vs = Shader(gl.VERTEX_SHADER, src_vert);
fs = Shader(gl.FRAGMENT_SHADER, src_frag);
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`Link failed:\n${gl.getProgramInfoLog(program)}`);
    console.log(`VS LOG:\n${gl.getShaderInfoLog(vs)}`);
    console.log(`FS LOG:\n${gl.getShaderInfoLog(fs)}`);
    throw 'AARG DED';
}

// get the uniform locs
loc_res = gl.getUniformLocation(program,'res');
loc_time = gl.getUniformLocation(program,'time');

// This loads a bunch of coordinates and connects them to the`a`-attribute.
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, Float32Array.of(0,1, 0,0, 1,1, 1,0), gl.STATIC_DRAW);
loc_a = gl.getAttribLocation(program, 'a');
gl.enableVertexAttribArray(loc_a);
gl.vertexAttribPointer(loc_a, 2, gl.FLOAT, false, 0, 0);

let M=1; // resolution multiplier
let resx,resy;
function resize_render() { 
  // resize and render
  let w = innerWidth, h = innerHeight, dpr = devicePixelRatio;
  resx = C.width = M*w*dpr|0; 
  resy = C.height = M*h*dpr|0;
  C.style.width = w+'px';
  C.style.height = h+'px';
  gl.viewport(0, 0, resx, resy);
  render();
}

let running = true;
function render() {
  if (running) {
    let time = performance.now() * .001;
    gl.uniform1f(loc_time, time);
    gl.uniform2f(loc_res, resx, resy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  requestAnimationFrame(render);
}

// resize event to resize when resized
tid=0;
onresize=_=>{
  clearTimeout(tid);
  tid=setTimeout(resize_render,150)
};

// keyboard event 
onkeyup=e=>{
  if (e.key==' ') running = !running;
}

resize_render(); // start the program!

