<template>
  <canvas ref="cv" class="hero-fluid" aria-hidden="true"></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const cv = ref();
let dispose = () => {};
onMounted(() => { try { dispose = init(cv.value); } catch (e) { /* leaves the CSS fallback image */ } });
onBeforeUnmount(() => dispose());

// A GPU fluid field used as a mask that tints the hero photo purple where the cursor stirs it.
function init(canvas) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const config = {
    SIM_RESOLUTION: 100, DYE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 1.0, VELOCITY_DISSIPATION: 2.0,
    PRESSURE: 0.8, PRESSURE_ITERATIONS: 18, CURL: 5,
    SPLAT_RADIUS: 0.42, SPLAT_FORCE: 2000, TINT: 0.9, IDLE: !reduced
  };

  const params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
  let gl = canvas.getContext('webgl2', params);
  const isWebGL2 = !!gl;
  if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
  if (!gl) throw new Error('no webgl');

  let halfFloat, linear;
  if (isWebGL2) { gl.getExtension('EXT_color_buffer_float'); linear = gl.getExtension('OES_texture_float_linear'); }
  else { halfFloat = gl.getExtension('OES_texture_half_float'); linear = gl.getExtension('OES_texture_half_float_linear'); }
  const texType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : null);
  const supportLinear = !!linear;
  if (!supportLinear) config.DYE_RESOLUTION = 384;

  function supported(internalFormat, format, type) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }
  function pickFormat(internalFormat, format, type) {
    if (!supported(internalFormat, format, type)) {
      if (!isWebGL2) return { internalFormat: gl.RGBA, format: gl.RGBA };
      if (internalFormat === gl.R16F) return pickFormat(gl.RG16F, gl.RG, type);
      if (internalFormat === gl.RG16F) return pickFormat(gl.RGBA16F, gl.RGBA, type);
      return { internalFormat: gl.RGBA, format: gl.RGBA };
    }
    return { internalFormat, format };
  }
  const fRGBA = isWebGL2 ? pickFormat(gl.RGBA16F, gl.RGBA, texType) : pickFormat(gl.RGBA, gl.RGBA, texType);
  const fRG = isWebGL2 ? pickFormat(gl.RG16F, gl.RG, texType) : fRGBA;
  const fR = isWebGL2 ? pickFormat(gl.R16F, gl.RED, texType) : fRGBA;

  function compile(type, src, kw) {
    if (kw) { let p = ''; kw.forEach(k => p += '#define ' + k + '\n'); src = p + src; }
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  const vsrc = `precision highp float; attribute vec2 aPosition; varying vec2 vUv, vL, vR, vT, vB; uniform vec2 texelSize;
    void main(){ vUv = aPosition * 0.5 + 0.5; vL = vUv - vec2(texelSize.x,0.0); vR = vUv + vec2(texelSize.x,0.0);
    vT = vUv + vec2(0.0,texelSize.y); vB = vUv - vec2(0.0,texelSize.y); gl_Position = vec4(aPosition,0.0,1.0); }`;
  const baseVertex = compile(gl.VERTEX_SHADER, vsrc);
  const fs = (s, kw) => compile(gl.FRAGMENT_SHADER, s, kw);

  const clearShader = fs(`precision mediump float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uTexture; uniform float value; void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`);
  const splatShader = fs(`precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){ vec2 p = vUv - point.xy; p.x *= aspectRatio; vec3 splat = exp(-dot(p,p)/radius) * color; vec3 base = texture2D(uTarget, vUv).xyz; gl_FragColor = vec4(base + splat, 1.0); }`);
  const advectionShader = fs(`precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uVelocity, uSource; uniform vec2 texelSize, dyeTexelSize; uniform float dt, dissipation;
    vec4 bilerp(sampler2D s, vec2 uv, vec2 ts){ vec2 st = uv/ts - 0.5; vec2 i = floor(st); vec2 f = fract(st); vec2 b = (i+0.5)*ts;
      vec4 a=texture2D(s,b); vec4 bb=texture2D(s,b+vec2(ts.x,0.0)); vec4 c=texture2D(s,b+vec2(0.0,ts.y)); vec4 d=texture2D(s,b+ts); return mix(mix(a,bb,f.x),mix(c,d,f.x),f.y); }
    void main(){
    #ifdef MANUAL_FILTERING
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize; vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize; vec4 result = texture2D(uSource, coord);
    #endif
      gl_FragColor = result / (1.0 + dissipation * dt); }`, supportLinear ? null : ['MANUAL_FILTERING']);
  const divergenceShader = fs(`precision mediump float; precision mediump sampler2D; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main(){ float L=texture2D(uVelocity,vL).x; float R=texture2D(uVelocity,vR).x; float T=texture2D(uVelocity,vT).y; float B=texture2D(uVelocity,vB).y; vec2 C=texture2D(uVelocity,vUv).xy;
    if(vL.x<0.0)L=-C.x; if(vR.x>1.0)R=-C.x; if(vT.y>1.0)T=-C.y; if(vB.y<0.0)B=-C.y; gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`);
  const curlShader = fs(`precision mediump float; precision mediump sampler2D; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main(){ float L=texture2D(uVelocity,vL).y; float R=texture2D(uVelocity,vR).y; float T=texture2D(uVelocity,vT).x; float B=texture2D(uVelocity,vB).x; gl_FragColor=vec4(R-L-T+B,0.0,0.0,1.0); }`);
  const vorticityShader = fs(`precision highp float; precision highp sampler2D; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
    void main(){ float L=texture2D(uCurl,vL).x; float R=texture2D(uCurl,vR).x; float T=texture2D(uCurl,vT).x; float B=texture2D(uCurl,vB).x; float C=texture2D(uCurl,vUv).x;
    vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L)); force/=length(force)+0.0001; force*=curl*C; force.y*=-1.0; vec2 v=texture2D(uVelocity,vUv).xy; v+=force*dt; v=clamp(v,-1000.0,1000.0); gl_FragColor=vec4(v,0.0,1.0); }`);
  const pressureShader = fs(`precision mediump float; precision mediump sampler2D; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uPressure, uDivergence;
    void main(){ float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x; float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x; float d=texture2D(uDivergence,vUv).x; gl_FragColor=vec4((L+R+B+T-d)*0.25,0.0,0.0,1.0); }`);
  const gradientShader = fs(`precision mediump float; precision mediump sampler2D; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uPressure, uVelocity;
    void main(){ float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x; float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x; vec2 v=texture2D(uVelocity,vUv).xy; v-=vec2(R-L,T-B); gl_FragColor=vec4(v,0.0,1.0); }`);
  // Tints the hero photo toward purple by the fluid density, instead of drawing opaque dye.
  const displayShader = fs(`precision highp float; precision highp sampler2D; varying vec2 vUv;
    uniform sampler2D uDye, uBg; uniform vec2 bgScale, bgFocal; uniform float tintAmount;
    void main(){
      vec2 bgUv = (vUv - 0.5) * bgScale + bgFocal;
      vec3 bg = texture2D(uBg, bgUv).rgb;
      vec3 dye = texture2D(uDye, vUv).rgb;
      float m = clamp(length(dye) * 2.4, 0.0, 1.0) * tintAmount;
      float lum = dot(bg, vec3(0.299, 0.587, 0.114));
      vec3 purple = vec3(0.55, 0.2, 0.98);
      vec3 tinted = mix(bg, purple * (lum * 1.35 + 0.08), m * 0.85);
      tinted += dye * 0.14;
      gl_FragColor = vec4(tinted, 1.0); }`);

  function Program(frag) {
    const program = gl.createProgram(); gl.attachShader(program, baseVertex); gl.attachShader(program, frag); gl.linkProgram(program);
    const u = {}; const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(program, i).name; u[name] = gl.getUniformLocation(program, name); }
    return { program, u, bind() { gl.useProgram(program); } };
  }
  const P = {
    clear: Program(clearShader), splat: Program(splatShader), advection: Program(advectionShader),
    divergence: Program(divergenceShader), curl: Program(curlShader), vorticity: Program(vorticityShader),
    pressure: Program(pressureShader), gradient: Program(gradientShader), display: Program(displayShader)
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);
  function draw(target) {
    if (!target) { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    else { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  function createFBO(w, h, iF, f, param) {
    gl.activeTexture(gl.TEXTURE0); const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, iF, w, h, 0, f, texType, null);
    const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, fbo, width: w, height: h, texelX: 1/w, texelY: 1/h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; } };
  }
  function createDouble(w, h, iF, f, param) {
    let a = createFBO(w, h, iF, f, param), b = createFBO(w, h, iF, f, param);
    return { width: w, height: h, texelX: 1/w, texelY: 1/h,
      get read(){ return a; }, get write(){ return b; }, swap(){ const t = a; a = b; b = t; } };
  }
  function resolution(r) {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight; if (aspect < 1) aspect = 1/aspect;
    const min = Math.round(r), max = Math.round(r * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
  }
  let dye, velocity, divergence, curlFbo, pressure;
  function initFBOs() {
    const sim = resolution(config.SIM_RESOLUTION), dyeRes = resolution(config.DYE_RESOLUTION);
    const filt = supportLinear ? gl.LINEAR : gl.NEAREST;
    dye = createDouble(dyeRes.width, dyeRes.height, fRGBA.internalFormat, fRGBA.format, filt);
    velocity = createDouble(sim.width, sim.height, fRG.internalFormat, fRG.format, filt);
    divergence = createFBO(sim.width, sim.height, fR.internalFormat, fR.format, gl.NEAREST);
    curlFbo = createFBO(sim.width, sim.height, fR.internalFormat, fR.format, gl.NEAREST);
    pressure = createDouble(sim.width, sim.height, fR.internalFormat, fR.format, gl.NEAREST);
  }

  // background photo texture
  const bgTex = gl.createTexture(); let bgReady = false; const bgSize = { w: 1920, h: 1080 };
  gl.bindTexture(gl.TEXTURE_2D, bgTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([12, 10, 16, 255]));
  const img = new Image(); img.crossOrigin = 'anonymous'; img.src = '/img/frontier-castle.webp';
  img.onload = () => { gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    bgSize.w = img.naturalWidth; bgSize.h = img.naturalHeight; bgReady = true; };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr)), h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; initFBOs(); return true; }
    return false;
  }
  resize();

  // emulate CSS `center 42% / cover`
  function bgTransform() {
    const ca = canvas.width / canvas.height, ia = bgSize.w / bgSize.h;
    return ca > ia ? [1, ia / ca] : [ca / ia, 1];
  }

  function HSVtoRGB(h, s, v) { let i = Math.floor(h*6), f = h*6-i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s), r, g, b;
    switch (i % 6) { case 0: r=v,g=t,b=p; break; case 1: r=q,g=v,b=p; break; case 2: r=p,g=v,b=t; break; case 3: r=p,g=q,b=v; break; case 4: r=t,g=p,b=v; break; default: r=v,g=p,b=q; } return [r, g, b]; }
  function purple() { const lilac = Math.random() < 0.26; const h = lilac ? 0.77 : 0.73 + (Math.random()-0.5)*0.06;
    const s = lilac ? 0.4 + Math.random()*0.2 : 0.72 + Math.random()*0.2; const c = HSVtoRGB(h, s, 1.0); const k = lilac ? 0.3 : 0.2; return [c[0]*k, c[1]*k, c[2]*k]; }

  function splat(x, y, dx, dy, color) {
    P.splat.bind();
    gl.uniform1i(P.splat.u.uTarget, velocity.read.attach(0));
    gl.uniform1f(P.splat.u.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(P.splat.u.point, x, y);
    gl.uniform3f(P.splat.u.color, dx, dy, 0);
    const aspect = canvas.width / canvas.height; const radius = aspect > 1 ? (config.SPLAT_RADIUS/100)*aspect : config.SPLAT_RADIUS/100;
    gl.uniform1f(P.splat.u.radius, radius);
    draw(velocity.write); velocity.swap();
    gl.uniform1i(P.splat.u.uTarget, dye.read.attach(0)); gl.uniform3f(P.splat.u.color, color[0], color[1], color[2]);
    draw(dye.write); dye.swap();
  }

  // pointer (window-level, only within the hero canvas)
  const pointer = { x: 0, y: 0, px: 0, py: 0, init: false };
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    const nx = (e.clientX - r.left) / r.width, ny = 1 - (e.clientY - r.top) / r.height;
    if (!pointer.init) { pointer.x = nx; pointer.y = ny; pointer.init = true; return; }
    const dx = (nx - pointer.x) * 1.9, dy = (ny - pointer.y) * 1.9; pointer.x = nx; pointer.y = ny;
    if (dx || dy) splat(nx, ny, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, purple());
  }
  const onTouch = e => { const t = e.touches && e.touches[0]; if (t) onMove(t); };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });

  let nextIdle = performance.now() + 2200;
  function idle(t) {
    if (!config.IDLE || t < nextIdle) return; nextIdle = t + 2600 + Math.random() * 2600;
    const x = 0.2 + Math.random()*0.6, y = 0.25 + Math.random()*0.5, a = Math.random()*Math.PI*2, s = 150 + Math.random()*180;
    splat(x, y, Math.cos(a)*s, Math.sin(a)*s, purple());
  }

  function step(dt) {
    gl.disable(gl.BLEND);
    P.curl.bind(); gl.uniform2f(P.curl.u.texelSize, velocity.texelX, velocity.texelY); gl.uniform1i(P.curl.u.uVelocity, velocity.read.attach(0)); draw(curlFbo);
    P.vorticity.bind(); gl.uniform2f(P.vorticity.u.texelSize, velocity.texelX, velocity.texelY);
    gl.uniform1i(P.vorticity.u.uVelocity, velocity.read.attach(0)); gl.uniform1i(P.vorticity.u.uCurl, curlFbo.attach(1));
    gl.uniform1f(P.vorticity.u.curl, config.CURL); gl.uniform1f(P.vorticity.u.dt, dt); draw(velocity.write); velocity.swap();
    P.divergence.bind(); gl.uniform2f(P.divergence.u.texelSize, velocity.texelX, velocity.texelY); gl.uniform1i(P.divergence.u.uVelocity, velocity.read.attach(0)); draw(divergence);
    P.clear.bind(); gl.uniform1i(P.clear.u.uTexture, pressure.read.attach(0)); gl.uniform1f(P.clear.u.value, config.PRESSURE); draw(pressure.write); pressure.swap();
    P.pressure.bind(); gl.uniform2f(P.pressure.u.texelSize, velocity.texelX, velocity.texelY); gl.uniform1i(P.pressure.u.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) { gl.uniform1i(P.pressure.u.uPressure, pressure.read.attach(1)); draw(pressure.write); pressure.swap(); }
    P.gradient.bind(); gl.uniform2f(P.gradient.u.texelSize, velocity.texelX, velocity.texelY); gl.uniform1i(P.gradient.u.uPressure, pressure.read.attach(0)); gl.uniform1i(P.gradient.u.uVelocity, velocity.read.attach(1)); draw(velocity.write); velocity.swap();
    P.advection.bind(); gl.uniform2f(P.advection.u.texelSize, velocity.texelX, velocity.texelY);
    if (!supportLinear) gl.uniform2f(P.advection.u.dyeTexelSize, velocity.texelX, velocity.texelY);
    const vid = velocity.read.attach(0); gl.uniform1i(P.advection.u.uVelocity, vid); gl.uniform1i(P.advection.u.uSource, vid);
    gl.uniform1f(P.advection.u.dt, dt); gl.uniform1f(P.advection.u.dissipation, config.VELOCITY_DISSIPATION); draw(velocity.write); velocity.swap();
    if (!supportLinear) gl.uniform2f(P.advection.u.dyeTexelSize, dye.texelX, dye.texelY);
    gl.uniform1i(P.advection.u.uVelocity, velocity.read.attach(0)); gl.uniform1i(P.advection.u.uSource, dye.read.attach(1));
    gl.uniform1f(P.advection.u.dissipation, config.DENSITY_DISSIPATION); draw(dye.write); dye.swap();
  }
  function render() {
    P.display.bind();
    gl.uniform1i(P.display.u.uDye, dye.read.attach(0));
    gl.uniform1i(P.display.u.uBg, (gl.activeTexture(gl.TEXTURE1), gl.bindTexture(gl.TEXTURE_2D, bgTex), 1));
    const s = bgTransform(); gl.uniform2f(P.display.u.bgScale, s[0], s[1]); gl.uniform2f(P.display.u.bgFocal, 0.5, 0.42);
    gl.uniform1f(P.display.u.tintAmount, config.TINT);
    draw(null);
  }

  let visible = true, raf = 0, last = performance.now();
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }) : null;
  if (io) io.observe(canvas);
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.016666); last = now;
    if (visible && !document.hidden) { resize(); idle(now); step(dt); render(); }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove); window.removeEventListener('touchmove', onTouch);
    if (io) io.disconnect();
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
  };
}
</script>
