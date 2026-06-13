/**
 * Aerukart-style rotating glass prism letters — T + G
 */
import * as THREE from './vendor/three.module.min.js';

const PrismRenderer = {
  _inited: false,
  _renderer: null,
  _scene: null,
  _camera: null,
  _letters: null,
  _bg: null,
  _raf: 0,
  _mouse: { x: 0, y: 0 },
  _container: null,

  init(containerId = 'hero-canvas') {
    if (this._inited) return Promise.resolve();
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    this._container = container;
    container.innerHTML = '';
    container.classList.add('prism-hero');

    const wrap = document.createElement('div');
    wrap.className = 'prism-hero__wrap';

    const canvasHost = document.createElement('div');
    canvasHost.className = 'prism-hero__canvas-host';
    wrap.appendChild(canvasHost);

    const glow = document.createElement('div');
    glow.className = 'prism-hero__glow';
    glow.setAttribute('aria-hidden', 'true');
    wrap.appendChild(glow);

    container.appendChild(wrap);

    const w = canvasHost.clientWidth || Math.min(window.innerWidth * 0.42, 520);
    const h = canvasHost.clientHeight || Math.min(window.innerHeight * 0.55, 640);

    this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(w, h);
    this._renderer.setClearColor(0x000000, 0);
    canvasHost.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    this._camera.position.set(0, 0, 5.2);

    const mat = this._glassMaterial();

    this._letters = new THREE.Group();
    const letterT = this._buildLetterT(mat);
    letterT.position.set(-0.72, 0, 0);
    const letterG = this._buildLetterG(mat);
    letterG.position.set(0.78, 0, 0);
    this._letters.add(letterT, letterG);
    this._letters.scale.setScalar(0.92);
    this._scene.add(this._letters);

    const lightMagenta = new THREE.DirectionalLight(0xff00aa, 1.4);
    lightMagenta.position.set(4, 3, 2);
    this._scene.add(lightMagenta);

    const lightCyan = new THREE.DirectionalLight(0x00f0ff, 1.1);
    lightCyan.position.set(-4, -1, 3);
    this._scene.add(lightCyan);

    const lightYellow = new THREE.DirectionalLight(0xd4ff00, 0.65);
    lightYellow.position.set(0, -4, 2);
    this._scene.add(lightYellow);

    this._scene.add(new THREE.AmbientLight(0x404060, 0.35));

    const bgGeo = new THREE.PlaneGeometry(14, 14);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - 0.5;
          float d = length(p - uMouse * 0.12);
          vec3 c1 = vec3(1.0, 0.0, 0.67);
          vec3 c2 = vec3(0.0, 0.94, 1.0);
          vec3 c3 = vec3(0.83, 1.0, 0.0);
          float t = uTime * 0.12 + atan(p.y, p.x);
          vec3 col = mix(mix(c1, c2, sin(t) * 0.5 + 0.5), c3, cos(t * 1.2) * 0.5 + 0.5);
          col *= 0.08 + smoothstep(0.45, 0.0, d) * 0.22;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
    });
    this._bg = new THREE.Mesh(bgGeo, bgMat);
    this._bg.position.z = -2.5;
    this._scene.add(this._bg);

    this._onMouseMove = (e) => {
      this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this._onResize = () => this._resize(canvasHost);

    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('resize', this._onResize);

    this._inited = true;
    this._loop();
    return Promise.resolve();
  },

  _glassMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.04,
      transmission: 0.94,
      thickness: 0.75,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.1,
    });
  },

  _buildLetterT(mat) {
    const group = new THREE.Group();
    const depth = 0.26;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, depth), mat);
    top.position.y = 0.38;
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.82, depth), mat);
    stem.position.y = -0.02;
    group.add(top, stem);
    return group;
  },

  _buildLetterG(mat) {
    const group = new THREE.Group();
    const depth = 0.26;
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.84, depth), mat);
    left.position.set(-0.3, 0, 0);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.16, depth), mat);
    top.position.set(0.02, 0.34, 0);
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.52, depth), mat);
    right.position.set(0.3, 0.1, 0);
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, depth), mat);
    bottom.position.set(-0.02, -0.34, 0);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, depth), mat);
    bar.position.set(0.14, -0.02, 0);
    group.add(left, top, right, bottom, bar);
    return group;
  },

  _resize(host) {
    const w = host.clientWidth || Math.min(window.innerWidth * 0.42, 520);
    const h = host.clientHeight || Math.min(window.innerHeight * 0.55, 640);
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(w, h);
  },

  _loop() {
    const t = performance.now() * 0.001;
    if (this._letters) {
      this._letters.rotation.x = t * 0.28 + this._mouse.y * 0.35;
      this._letters.rotation.y = t * 0.42 + this._mouse.x * 0.45;
      this._letters.rotation.z = Math.sin(t * 0.25) * 0.12;
    }
    if (this._bg) {
      this._bg.material.uniforms.uTime.value = t;
      this._bg.material.uniforms.uMouse.value.set(this._mouse.x, this._mouse.y);
    }
    this._renderer.render(this._scene, this._camera);
    this._raf = requestAnimationFrame(() => this._loop());
  },

  destroy() {
    cancelAnimationFrame(this._raf);
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    this._inited = false;
  },
};

window.PrismRenderer = PrismRenderer;
export default PrismRenderer;
