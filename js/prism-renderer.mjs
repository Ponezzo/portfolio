/**
 * Aerukart hero — rotating glass prism video (AERUK-BG-ANIM.webm)
 */
const PrismRenderer = {
  _inited: false,
  _video: null,

  init(containerId = 'hero-canvas') {
    if (this._inited) return Promise.resolve();
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    container.innerHTML = '';
    container.classList.add('prism-hero');

    const wrap = document.createElement('div');
    wrap.className = 'prism-hero__wrap';

    const video = document.createElement('video');
    video.className = 'prism-hero__video';
    video.src = this._videoSrc(containerId);
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');

    const glow = document.createElement('div');
    glow.className = 'prism-hero__glow';
    glow.setAttribute('aria-hidden', 'true');

    wrap.appendChild(video);
    wrap.appendChild(glow);
    container.appendChild(wrap);

    video.play().catch(() => {});
    this._video = video;
    this._inited = true;
    return Promise.resolve();
  },

  _videoSrc(containerId) {
    const base = containerId === 'hero-canvas' ? '' : '../';
    return `${base}assets/hero/aeruk-prism.webm`;
  },
};

window.PrismRenderer = PrismRenderer;
export default PrismRenderer;
