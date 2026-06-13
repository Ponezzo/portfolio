import * as THREE from './vendor/three.module.min.js';

const PrismRenderer = {
  _inited: false,
  _renderer: null,
  _scene: null,
  _camera: null,
  _mesh: null,
  _bg: null,
  _raf: 0,
  _mouse: { x: 0, y: 0 },
  _containerId: 'hero-canvas',

  init(containerId = 'hero-canvas') {
    if (this._inited) return Promise.resolve();
    this._containerId = containerId;
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(w, h);
    container.innerHTML = '';
    container.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this._camera.position.set(0, 0, 4.2);

    const geo = new THREE.OctahedronGeometry(1.15, 0);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 1.4,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    this._mesh = new THREE.Mesh(geo, mat);
    this._scene.add(this._mesh);

    const light1 = new THREE.DirectionalLight(0xff6ec7, 1.2);
    light1.position.set(3, 4, 2);
    this._scene.add(light1);
    const light2 = new THREE.DirectionalLight(0x22d3ee, 1);
    light2.position.set(-3, -2, 3);
    this._scene.add(light2);
    this._scene.add(new THREE.AmbientLight(0x7873f5, 0.35));

    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
        void main(){
          vec2 p=vUv-0.5; float d=length(p-uMouse*0.15);
          vec3 c1=vec3(1.0,0.43,0.78), c2=vec3(0.47,0.45,0.96), c3=vec3(0.13,0.83,0.93);
          float t=uTime*0.15+atan(p.y,p.x);
          vec3 col=mix(mix(c1,c2,sin(t)*0.5+0.5),c3,cos(t*1.3)*0.5+0.5);
          col*=0.12+smoothstep(0.5,0.0,d)*0.25;
          gl_FragColor=vec4(col,1.0);
        }`,
      depthWrite: false,
    });
    this._bg = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), bgMat);
    this._bg.position.z = -2;
    this._scene.add(this._bg);

    window.addEventListener('mousemove', (e) => {
      this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
    window.addEventListener('resize', () => this._resize(container));

    this._inited = true;
    this._loop();
    return Promise.resolve();
  },

  _resize(container) {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(w, h);
  },

  _loop() {
    const t = performance.now() * 0.001;
    if (this._mesh) {
      this._mesh.rotation.x = t * 0.35 + this._mouse.y * 0.4;
      this._mesh.rotation.y = t * 0.55 + this._mouse.x * 0.5;
      this._mesh.rotation.z = Math.sin(t * 0.2) * 0.15;
    }
    if (this._bg) {
      this._bg.material.uniforms.uTime.value = t;
      this._bg.material.uniforms.uMouse.value.set(this._mouse.x, this._mouse.y);
    }
    this._renderer.render(this._scene, this._camera);
    this._raf = requestAnimationFrame(() => this._loop());
  },
};

window.PrismRenderer = PrismRenderer;
export default PrismRenderer;
