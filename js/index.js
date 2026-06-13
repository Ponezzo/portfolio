

const shouldSkipLongIntro = !!sessionStorage.getItem('index-return-fade');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const mustSkip = shouldSkipLongIntro || prefersReducedMotion;

if (history.scrollRestoration) {
  history.scrollRestoration = mustSkip ? 'auto' : 'manual';
}

const isMobile = navigator.maxTouchPoints > 1;
const isSlowHardware = isMobile || (navigator.hardwareConcurrency || 8) <= 4;

function isMobileViewport() {
  return (document.documentElement.clientWidth || window.innerWidth) <= 768;
}

function isCompactProjectsLayout() {
  return (document.documentElement.clientWidth || window.innerWidth) <= 900;
}

let _isForcingScroll = false;
function _forceScrollTop() {
  if (_isForcingScroll) return;
  _isForcingScroll = true;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  _isForcingScroll = false;
}

function _preventTouchScroll(e) { e.preventDefault(); }

if (!mustSkip) {
  _forceScrollTop();
  window.addEventListener('scroll', _forceScrollTop);
  
  if (isMobile) {
    document.addEventListener('touchmove', _preventTouchScroll, { passive: false });
  } else {
    document.documentElement.style.overflow = 'hidden';
  }

  requestAnimationFrame(() => _forceScrollTop());
  window.addEventListener('load', () => {
    _forceScrollTop();
  }, { once: true });
}


gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

const introBg = document.getElementById('intro-bg');
const tPanelRed = document.getElementById('t-panel-red');
const tPanelDark = document.getElementById('t-panel-dark');

gsap.set([tPanelRed, tPanelDark], { willChange: 'transform' });

function showSiteHeaderLanding() {
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    siteHeader.style.visibility = 'visible';
    siteHeader.classList.add('site-header--ready');
  }
}

function setupSiteHeader() {
  if (!window.setupFooterRevealBlock) return;
  window.setupFooterRevealBlock({
    transition: '#site-header-transition',
    footer: '#site-header',
    asciiLeftId: 'header-ascii-left',
    asciiRightId: 'header-ascii-right',
    staticLanding: true,
    holdRatio: 0.88,
    readyClass: 'site-header--ready',
  });
}

const master = gsap.timeline({ delay: 0.15 });

master
  .to(tPanelDark, {
    y: '0%',
    duration: 0.45,
    ease: 'power3.inOut',
  })
  .to(tPanelRed, {
    y: '0%',
    duration: 0.45,
    ease: 'power3.inOut',
  }, '-=0.3')
  .set(introBg, { display: 'none' })
  .to(tPanelRed, {
    y: '-100%',
    duration: 0.55,
    ease: 'power3.inOut',
  }, '+=0.05')
  .to(tPanelDark, {
    y: '-100%',
    duration: 0.55,
    ease: 'power3.inOut',
  }, '-=0.4')
  .add(showSiteHeaderLanding);

const lenis = new Lenis({
  lerp: isMobile ? 0.085 : 0.07,
  smoothWheel: true,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.15,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));

lenis.stop();
lenis.scrollTo(0, { immediate: true });
let revealSetupStarted = false;

master.add(() => {

  window.removeEventListener('scroll', _forceScrollTop);
  if (isMobile) {
    document.removeEventListener('touchmove', _preventTouchScroll);
  } else {
    document.documentElement.style.overflow = '';
  }
  _forceScrollTop();
  requestAnimationFrame(_forceScrollTop);
  lenis.start();
  lenis.scrollTo(0, { immediate: true });

  gsap.set([tPanelRed, tPanelDark], { willChange: 'auto' });

  
  const tPanel = document.getElementById('transition-panel');
  if (tPanel) tPanel.remove();
  const iBg = document.getElementById('intro-bg');
  if (iBg) iBg.remove();

  
  requestAnimationFrame(() => {
    if (revealSetupStarted) return;
    revealSetupStarted = true;
    showSiteHeaderLanding();
    setupSiteHeader();
    setupAboutSection();
  });
});

if (mustSkip) {
  showSiteHeaderLanding();
  setupSiteHeader();
  master.progress(1);
  master.pause();
  if (!shouldSkipLongIntro) {
    lenis.scrollTo(0, { immediate: true });
    _forceScrollTop();
    requestAnimationFrame(() => {
      _forceScrollTop();
      scheduleScrollRefresh();
    });
  }
}

function setupAboutSection() {
  const aboutText = document.getElementById('about-text');
  const photoWrap = document.getElementById('about-photo-wrap');

  
  function wrapWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
        } else if (w) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  const aboutSub = document.getElementById('about-sub');
  wrapWords(aboutText);

  const aboutWords = [...aboutText.querySelectorAll('.word')];

  if (isMobile || isSlowHardware) {
    aboutWords.forEach(w => { w.style.filter = 'none'; });
  }

  if (aboutWords.length) {
    gsap.fromTo(aboutWords,
      isMobile || isSlowHardware ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' },
      {
        opacity: 1,
        ...(isMobile || isSlowHardware ? {} : { filter: 'blur(0px)' }),
        ease: 'none',
        stagger: { each: 0.055, ease: 'none' },
        scrollTrigger: {
          trigger: aboutText,
          start: 'top 78%',
          end: 'top 48%',
          scrub: 0.35,
        },
      },
    );
  }

  const aboutSubFrom = isMobile || isSlowHardware
    ? { opacity: 0 }
    : { opacity: 0, filter: 'blur(12px)' };
  gsap.set(aboutSub, aboutSubFrom);
  gsap.to(aboutSub, {
    opacity: 1,
    ...(isMobile || isSlowHardware ? {} : { filter: 'blur(0px)' }),
    ease: 'none',
    scrollTrigger: {
      trigger: aboutSub,
      start: 'top 80%',
      end: 'top 60%',
      scrub: 0.35,
    },
  });

  
  const photo = photoWrap.querySelector('.about-photo');
  const usePhotoBlur = !isMobile && !isSlowHardware;
  function initPhotoScroll() {
    const photoHidden = usePhotoBlur
      ? { opacity: 0, x: 48, filter: 'blur(20px)' }
      : { opacity: 0, x: 48 };
    const photoVisible = usePhotoBlur
      ? { opacity: 1, x: 0, filter: 'blur(0px)' }
      : { opacity: 1, x: 0 };
    const photoExit = usePhotoBlur
      ? { opacity: 0, x: 24, filter: 'blur(16px)' }
      : { opacity: 0, x: 24 };

    gsap.set(photo, photoHidden);

    gsap.timeline({
      scrollTrigger: {
        trigger: '#about-body',
        start: 'top 88%',
        end: 'bottom top',
        scrub: 0.35,
      },
    })
      .fromTo(photo, photoHidden, { ...photoVisible, ease: 'none', duration: 0.28 })
      .to(photo, { ...photoVisible, ease: 'none', duration: 0.44 })
      .to(photo, { ...photoExit, ease: 'none', duration: 0.28 });
  }
  if (photo.decode) {
    photo.decode().then(initPhotoScroll).catch(initPhotoScroll);
  } else {
    photo.onload = initPhotoScroll;
    if (photo.complete) initPhotoScroll();
  }

  setupProjectsSection();
}

function setupProjectsSection() {
  const items = document.querySelectorAll('.proj-item');
  const card = document.getElementById('proj-card');
  const cover = document.getElementById('proj-cover');
  const dateEl = document.getElementById('proj-date');
  const preview = document.getElementById('proj-preview');
  if (!items.length || !card || !cover || !preview) return;

  let currentIdx = -1;
  let _projectsInView = false;
  let _skillsInView = false;
  let _lineReady = false;
  const LINE_FIRST_PROJECT_PROGRESS = 0.25;
  gsap.set(card, { opacity: 0 });
  gsap.set(preview, { opacity: 0 });

  function isInSkillsSection() {
    const skills = document.getElementById('skills');
    if (!skills) return _skillsInView;
    const rect = skills.getBoundingClientRect();
    return rect.top < window.innerHeight;
  }

  function updateLineReady(progress) {
    const ready = progress >= LINE_FIRST_PROJECT_PROGRESS;
    if (ready === _lineReady) return;
    _lineReady = ready;
    if (_lineReady && _projectsInView && !isInSkillsSection()) {
      onProjectsScroll();
    } else if (!_lineReady) {
      forceHidePreview();
    }
  }

  function showPreviewPanel() {
    if (isCompactProjectsLayout()) return;
    if (!_projectsInView || isInSkillsSection() || !_lineReady) return;
    preview.classList.add('visible');
    gsap.to(preview, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(card, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  }

  function forceHidePreview() {
    preview.classList.remove('visible');
    gsap.set(preview, { opacity: 0 });
    gsap.set(card, { opacity: 0 });
  }

  function syncPreviewVisibility() {
    if (_projectsInView && !isInSkillsSection() && currentIdx >= 0 && _lineReady) {
      showPreviewPanel();
    } else {
      forceHidePreview();
    }
  }

  
  const _coverCache = [];
  items.forEach(item => {
    const img = new Image();
    img.src = item.dataset.img;
    if (img.decode) img.decode().catch(() => { });
    _coverCache.push(img);
  });

  
  const projectsEl = document.getElementById('projects');

  ScrollTrigger.create({
    trigger: projectsEl,
    start: 'top 80%',
    end: 'bottom top',
    onEnter: () => {
      _projectsInView = true;
      onProjectsScroll();
    },
    onLeave: () => {
      _projectsInView = false;
      forceHidePreview();
    },
    onEnterBack: () => {
      _projectsInView = true;
      onProjectsScroll();
    },
    onLeaveBack: () => {
      _projectsInView = false;
      forceHidePreview();
    },
  });

  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => {
      _skillsInView = true;
      forceHidePreview();
    },
    onEnterBack: () => {
      _skillsInView = true;
      forceHidePreview();
    },
    onLeaveBack: () => {
      _skillsInView = false;
      if (_projectsInView) onProjectsScroll();
    },
  });

  
  const itemQuickX = [...items].map(item =>
    gsap.quickTo(item, 'x', { duration: 0.6, ease: 'power2.out' })
  );

  
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (!_lineReady) return;
      if (item.classList.contains('active')) {
        openProject(item.dataset.id, item);
      } else {
        activateProject(i);
        
        let docTop = 0, el = item;
        while (el) { docTop += el.offsetTop; el = el.offsetParent; }
        lenis.scrollTo(docTop - window.innerHeight / 2 + item.offsetHeight / 2, { duration: 1.2 });
      }
    });
  });
  cover.addEventListener('click', () => {
    if (currentIdx >= 0) openProject(items[currentIdx].dataset.id, items[currentIdx]);
  });

  function onProjectsScrollImpl() {
    if (isInSkillsSection()) {
      forceHidePreview();
      return;
    }
    if (!_projectsInView) {
      forceHidePreview();
      return;
    }
    const cy = window.innerHeight / 2;
    const halfH = window.innerHeight / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const itemCy = rect.top + rect.height / 2;
      const dist = Math.abs(itemCy - cy);
      itemQuickX[i](Math.min(dist / halfH, 1) * 80);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });
    if (closestIdx !== currentIdx) {
      activateProject(closestIdx);
    }
  }

  let _projectsScrollQueued = false;
  function onProjectsScroll() {
    if (_projectsScrollQueued) return;
    _projectsScrollQueued = true;
    requestAnimationFrame(() => {
      _projectsScrollQueued = false;
      onProjectsScrollImpl();
    });
  }
  lenis.on('scroll', onProjectsScroll);
  onProjectsScrollImpl();

  let _wasCompactLayout = isCompactProjectsLayout();
  window.addEventListener('resize', () => {
    const compact = isCompactProjectsLayout();
    if (compact === _wasCompactLayout) return;
    _wasCompactLayout = compact;
    if (compact) forceHidePreview();
    else if (_projectsInView) onProjectsScrollImpl();
    scheduleScrollRefresh();
  }, { passive: true });

  function activateProject(i) {
    if (!_projectsInView || isInSkillsSection()) return;
    if (i === currentIdx) {
      syncPreviewVisibility();
      return;
    }
    if (currentIdx >= 0) items[currentIdx].classList.remove('active');
    items[i].classList.add('active');

    if (currentIdx === -1) {
      cover.src = items[i].dataset.img;
      if (dateEl) dateEl.textContent = items[i].dataset.date;
    } else {
      cover.src = items[i].dataset.img;
      if (dateEl) dateEl.textContent = items[i].dataset.date;
    }
    currentIdx = i;
    syncPreviewVisibility();
  }

  const projCursor = document.getElementById('proj-cursor');
  const qCursorX = gsap.quickTo(projCursor, 'left', { duration: 0.35, ease: 'power3.out' });
  const qCursorY = gsap.quickTo(projCursor, 'top', { duration: 0.35, ease: 'power3.out' });
  let _tiltTargetRY = 0, _tiltTargetRX = 0, _tiltRY = 0, _tiltRX = 0;
  
  let _detTiltTargetRY = 0, _detTiltTargetRX = 0, _detTiltRY = 0, _detTiltRX = 0;

  cover.addEventListener('mouseenter', () => {
    projCursor.classList.add('active');
  });

  cover.addEventListener('mouseleave', () => {
    projCursor.classList.remove('active');
  });

  
  let _cachedSelImg = null;

  
  document.addEventListener('mousemove', (e) => {
    
    if (_projectsInView) {
      qCursorX(e.clientX);
      qCursorY(e.clientY);
    }
    
    if (_projectsInView) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      
      const ry = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      const rx = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      _tiltTargetRY = ry * 6;
      _tiltTargetRX = -rx * 5;
    }

    if (projectOpen && _cachedSelImg) {
      var sr = _cachedSelImg.getBoundingClientRect();
      var scx = sr.left + sr.width / 2;
      var scy = sr.top + sr.height / 2;
      const dry = Math.max(-1, Math.min(1, (e.clientX - scx) / (sr.width / 2)));
      const drx = Math.max(-1, Math.min(1, (e.clientY - scy) / (sr.height / 2)));
      _detTiltTargetRY = dry * 8;
      _detTiltTargetRX = -drx * 6;
    }
  });

  
  gsap.ticker.add(() => {
    if (_projectsInView && _lineReady && preview.classList.contains('visible')) {
      _tiltRY += (_tiltTargetRY - _tiltRY) * 0.12;
      _tiltRX += (_tiltTargetRX - _tiltRX) * 0.12;
      card.style.transform = 'rotateY(' + _tiltRY.toFixed(2) + 'deg) rotateX(' + _tiltRX.toFixed(2) + 'deg)';
    }
    if (projectOpen && _cachedSelImg) {
      _detTiltRY += (_detTiltTargetRY - _detTiltRY) * 0.1;
      _detTiltRX += (_detTiltTargetRX - _detTiltRX) * 0.1;
      _cachedSelImg.style.transform = 'rotateY(' + _detTiltRY.toFixed(2) + 'deg) rotateX(' + _detTiltRX.toFixed(2) + 'deg)';
    }
  });

  
  ScrollTrigger.create({
    trigger: projectsEl,
    start: 'top 58%',
    end: 'bottom 42%',
    onEnter: () => { if (lenis?.options) lenis.options.lerp = 0.045; },
    onLeave: () => { if (lenis?.options) lenis.options.lerp = isMobile ? 0.085 : 0.07; },
    onEnterBack: () => { if (lenis?.options) lenis.options.lerp = 0.045; },
    onLeaveBack: () => { if (lenis?.options) lenis.options.lerp = isMobile ? 0.085 : 0.07; },
  });

  
  const linePath = document.getElementById('fluid-line');
  const lineDrawTrigger = document.getElementById('projects-list') || projectsEl;
  if (!linePath) return;
  const lineLen = linePath.getTotalLength();

  gsap.set(linePath, { strokeDasharray: lineLen, strokeDashoffset: lineLen });

  gsap.to(linePath, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: lineDrawTrigger,
      start: 'top 70%',
      end: 'bottom top',
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  ScrollTrigger.create({
    trigger: '#projects',
    start: 'top 70%',
    end: 'bottom top',
    onUpdate: (self) => updateLineReady(self.progress),
  });

  
  ; (function () {
    var timeline = document.getElementById('scroll-timeline');
    var bar = document.getElementById('st-bar');
    var label = document.getElementById('st-label');

    var sections = [
      { id: 'about', name: 'About' },
      { id: 'projects', name: 'Projects' },
      { id: 'skills', name: 'Skills' },
    ];

    var scrollY0 = window.scrollY || window.pageYOffset;
    var zoneTop = document.getElementById(sections[0].id).getBoundingClientRect().top + scrollY0;
    var lastEl = document.getElementById(sections[sections.length - 1].id);
    var zoneBottom = lastEl.getBoundingClientRect().top + lastEl.offsetHeight + scrollY0;
    var zoneH = zoneBottom - zoneTop;

    
    var segEls = [];
    sections.forEach(function (sec) {
      var el = document.getElementById(sec.id);
      var elTop = el.getBoundingClientRect().top + scrollY0;
      sec.top = elTop;
      sec.bottom = elTop + el.offsetHeight;
      sec.ratio = el.offsetHeight / zoneH;

      var seg = document.createElement('div');
      seg.className = 'st-seg';
      seg.style.flex = sec.ratio.toFixed(4);
      seg.title = sec.name;
      var fill = document.createElement('div');
      fill.className = 'st-seg-fill';
      seg.appendChild(fill);
      bar.appendChild(seg);
      seg.addEventListener('click', (function (targetId) {
        return function () {
          var target = document.getElementById(targetId);
          if (!target) return;
          if (typeof lenis !== 'undefined' && lenis && lenis.scrollTo) {
            lenis.scrollTo(target, { offset: 0, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        };
      })(sec.id));
      segEls.push({ seg: seg, fill: fill });
    });

    ScrollTrigger.create({
      trigger: '#' + sections[0].id,
      start: 'top bottom',
      endTrigger: '#' + sections[sections.length - 1].id,
      end: 'bottom bottom',
      onUpdate: function (self) {
        var progress = self.progress;

        if (progress <= 0 || progress >= 0.90) {
          timeline.classList.remove('visible');
          timeline.style.opacity = '';
          return;
        }
        timeline.classList.add('visible');

        var activeIdx = 0;
        var cumul = 0;
        for (var i = 0; i < sections.length; i++) {
          var segStart = cumul;
          var segEnd = cumul + sections[i].ratio;

          if (progress < segEnd) {
            
            var inner = (progress - segStart) / sections[i].ratio;
            segEls[i].fill.style.height = (Math.min(1, Math.max(0, inner)) * 100).toFixed(1) + '%';
            activeIdx = i;
            
            for (var j = i + 1; j < sections.length; j++) {
              segEls[j].fill.style.height = '0%';
            }
            break;
          } else {
            
            segEls[i].fill.style.height = '100%';
          }
          cumul = segEnd;
        }

        label.textContent = sections[activeIdx].name;
        label.style.top = (progress * 100).toFixed(1) + '%';
      }
    });
  })();

  
  ; (function initSkillGroups() {
    function bindSkillGroups() {
      var groups = document.querySelectorAll('.skill-group');
      if (!groups.length) return;

      groups.forEach(function (group) {
        var body = group.querySelector('.skill-body');
        if (body) gsap.set(body, { height: 0 });
        group.classList.remove('open');

        var header = group.querySelector('.skill-header');
        if (!header || header.dataset.bound === '1') return;
        header.dataset.bound = '1';

        header.addEventListener('click', function () {
          if (group.classList.contains('open')) {
            group.classList.remove('open');
            gsap.to(body, {
              height: 0,
              duration: 0.45,
              ease: 'power3.inOut',
              onComplete: function () { scheduleScrollRefresh(); },
            });
            return;
          }

          groups.forEach(function (g) {
            if (g === group || !g.classList.contains('open')) return;
            g.classList.remove('open');
            var otherBody = g.querySelector('.skill-body');
            gsap.to(otherBody, { height: 0, duration: 0.45, ease: 'power3.inOut' });
          });

          group.classList.add('open');
          gsap.to(body, {
            height: body.scrollHeight,
            duration: 0.45,
            ease: 'power3.inOut',
            onComplete: function () { scheduleScrollRefresh(); },
          });
        });
      });
    }

    bindSkillGroups();
    window.addEventListener('home-skills-updated', bindSkillGroups);
  })();

  
  if (window.setupFooterRevealBlock) {
    window.setupFooterRevealBlock({
      transition: '#footer-transition',
      footer: '#footer',
      asciiLeftId: 'ascii-left',
      asciiRightId: 'ascii-right',
      hideOnLeave: false,
    });
  }

  const PROJECTS = {
    'flip': {
      desc: 'Smart factory AMR control dashboard with real-time 3D digital twin. Led PM from problem definition to MVP delivery at SSAFY × Samsung Production Technology Institute.',
      category: 'Website', year: '2025', tags: ['Next.js', 'Three.js', 'PM'],
      images: ['assets/covers/flip.svg'],
    },
    'dingading': {
      desc: 'AI voice-based band matching platform with quantitative tier evaluation. Defined MVP scope, matching logic, and onboarding UX as product lead.',
      category: 'Web Application', year: '2025', tags: ['Next.js', 'AI', 'Planning'],
      images: ['assets/covers/dingading.svg'],
    },
    'wakwak': {
      desc: 'Emotional diary app with time capsules, anonymous letters, and constellation-based journaling. Focused on retention-oriented feature design.',
      category: 'Mobile App', year: '2025', tags: ['React Native', 'PM'],
      images: ['assets/covers/wakwak.svg'],
    },
    'cinemovie': {
      desc: 'TMDB-powered movie community with AI chat recommendations and 3D carousel browsing experience.',
      category: 'Website', year: '2024', tags: ['Vue 3', 'Gemini', 'FE'],
      images: ['assets/covers/cinemovie.svg'],
    },
  };

  const detailEl = document.getElementById('project-detail');
  const detailTitle = document.getElementById('detail-title');
  const detailTitleWrap = document.getElementById('detail-title-wrap');
  const detailYear = document.getElementById('detail-year');
  const detailDesc = document.getElementById('detail-desc');
  const detailTags = document.getElementById('detail-tags');
  const detailThumbs = document.getElementById('detail-thumbs');
  const detailThumbsInner = document.getElementById('detail-thumbs-inner');
  const detailSelected = document.getElementById('detail-selected');
  const detailGalleryWrap = document.getElementById('detail-gallery-wrap');
  const flyingTitle = document.getElementById('flying-title');
  const pageFade = document.getElementById('page-fade');
  const detailBack = document.getElementById('detail-back');

  let projectOpen = false;
  window._projectOpen = false;
  let _flyingSourceItem = null;
  let _galleryRAF = null;
  let _galleryY = 0, _galleryMaxScroll = 0;
  let _qGalleryY = null;

  let _activeThumbIdx = -1;
  let _thumbImgs = []; 

  
  function updateActiveThumb() {
    if (!projectOpen) return;
    if (!_thumbImgs.length) { _galleryRAF = requestAnimationFrame(updateActiveThumb); return; }
    var thumbsRect = detailThumbs.getBoundingClientRect();
    var cy = thumbsRect.top + thumbsRect.height / 2;
    var closestIdx = 0, closestDist = Infinity;
    for (var i = 0; i < _thumbImgs.length; i++) {
      var rect = _thumbImgs[i].getBoundingClientRect();
      var imgCy = rect.top + rect.height / 2;
      var dist = Math.abs(imgCy - cy);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      var distNorm = dist / (thumbsRect.height * 0.45);
      var t = Math.max(0, 1 - distNorm);
      t = t * t * t;
      _thumbImgs[i].style.width = (100 + t * 40) + '%';
    }
    if (closestIdx !== _activeThumbIdx) {
      if (_activeThumbIdx >= 0 && _thumbImgs[_activeThumbIdx]) _thumbImgs[_activeThumbIdx].classList.remove('active');
      _thumbImgs[closestIdx].classList.add('active');
      _activeThumbIdx = closestIdx;
      if (_cachedSelImg) {
        _cachedSelImg.src = _thumbImgs[closestIdx].src;
      }
    }
    _galleryRAF = requestAnimationFrame(updateActiveThumb);
  }

  function openProject(id, clickedItem) {
    const proj = PROJECTS[id];
    if (!proj || projectOpen) return;
    projectOpen = true; window._projectOpen = true;
    _flyingSourceItem = clickedItem;

    history.pushState({ project: id }, '', '#' + id);
    lenis.stop();

    const stTimeline = document.getElementById('scroll-timeline');
    if (stTimeline) stTimeline.style.setProperty('display', 'none', 'important');

    const rect = clickedItem.getBoundingClientRect();
    const cs = getComputedStyle(clickedItem);
    const startFontSize = parseFloat(cs.fontSize);
    flyingTitle.textContent = clickedItem.textContent;
    flyingTitle.style.fontSize = startFontSize + 'px';
    flyingTitle.style.lineHeight = cs.lineHeight;
    flyingTitle.style.letterSpacing = cs.letterSpacing;
    flyingTitle.style.paddingTop = cs.paddingTop;
    flyingTitle.style.paddingBottom = cs.paddingBottom;

    
    gsap.set(flyingTitle, { left: rect.left, top: rect.top, opacity: 1, scale: 1, x: 0, y: 0, transformOrigin: 'left top' });

    
    clickedItem.style.visibility = 'hidden';

    
    detailTitle.textContent = clickedItem.textContent;
    detailYear.textContent = proj.year;
    detailDesc.textContent = proj.desc;
    detailTags.innerHTML = proj.tags.map(function (t) { return '<span class="detail-tag">' + t + '</span>'; }).join('');
    
    var allImages = [clickedItem.dataset.img].concat(proj.images);
    detailThumbsInner.innerHTML = allImages.map(function (src) { return '<img src="' + src + '" alt="" decoding="async">'; }).join('');
    detailSelected.innerHTML = '<img src="' + allImages[0] + '" alt="" decoding="async">';
    detailThumbsInner.querySelectorAll('img').forEach(function (img, i) {
      if (img.decode) img.decode().catch(function () { });
      
      img.addEventListener('click', function () {
        if (_activeThumbIdx >= 0 && _thumbImgs[_activeThumbIdx]) _thumbImgs[_activeThumbIdx].classList.remove('active');
        img.classList.add('active');
        _activeThumbIdx = i;
        if (_cachedSelImg) _cachedSelImg.src = img.src;
      });
    });
    _activeThumbIdx = 0;
    _thumbImgs = [].slice.call(detailThumbsInner.querySelectorAll('img'));
    _thumbImgs[0].classList.add('active');
    _cachedSelImg = detailSelected.querySelector('img');
    _galleryY = 0;
    gsap.set(detailThumbsInner, { y: 0 });
    gsap.set(detailBack, { opacity: 1, visibility: 'visible' });

    
    var remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    var targetTop = window.innerHeight * 0.22;
    var targetLeft = remPx * 4;
    var targetFontSize = Math.min(Math.max(window.innerWidth * 0.05, remPx * 3), remPx * 5);

    var tl = gsap.timeline();

    
    tl.to(pageFade, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 0);

    
    tl.to(flyingTitle, { top: targetTop, left: targetLeft, fontSize: targetFontSize, paddingTop: 0, paddingBottom: 0, duration: 1, ease: 'power3.inOut' }, 0.3);

    
    tl.to(detailEl, { opacity: 1, duration: 0.4, ease: 'power2.out', onStart: function () { detailEl.classList.add('active'); } }, 1.0);

    
    tl.set(flyingTitle, { opacity: 0 }, 1.1);
    tl.set(detailTitleWrap, { opacity: 1 }, 1.1);

    
    tl.to(detailDesc, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.2);
    tl.to(detailTags, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.3);

    
    tl.fromTo(detailGalleryWrap, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.2);

    
    tl.add(function () {
      _galleryMaxScroll = Math.max(0, detailThumbsInner.scrollHeight - detailThumbs.clientHeight);
      _qGalleryY = gsap.quickTo(detailThumbsInner, 'y', { duration: 0.8, ease: 'power2.out' });
      _galleryRAF = requestAnimationFrame(updateActiveThumb);
    });
  }

  function closeProject() {
    if (!projectOpen) return;
    projectOpen = false; window._projectOpen = false;
    if (_galleryRAF) { cancelAnimationFrame(_galleryRAF); _galleryRAF = null; }
    _qGalleryY = null;
    history.pushState(null, '', window.location.pathname);

    const stTimeline = document.getElementById('scroll-timeline');
    if (stTimeline) stTimeline.style.removeProperty('display');

    var tl = gsap.timeline();

    
    tl.to([detailDesc, detailTags], { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    tl.to(detailBack, { opacity: 0, visibility: 'hidden', duration: 0.2, ease: 'power2.in' }, 0);
    tl.to(detailGalleryWrap, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0);

    
    var dtRect = detailTitle.getBoundingClientRect();
    var dtCs = getComputedStyle(detailTitle);
    flyingTitle.textContent = detailTitle.textContent;
    flyingTitle.style.fontSize = dtCs.fontSize;
    flyingTitle.style.lineHeight = dtCs.lineHeight;
    flyingTitle.style.letterSpacing = dtCs.letterSpacing;
    flyingTitle.style.paddingTop = '0';
    flyingTitle.style.paddingBottom = '0';
    gsap.set(flyingTitle, { left: dtRect.left, top: dtRect.top, opacity: 1, x: 0, y: 0 });
    gsap.set(detailTitleWrap, { opacity: 0 });

    
    tl.to(detailEl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.2);

    
    if (_flyingSourceItem) {
      var itemRect = _flyingSourceItem.getBoundingClientRect();
      var itemCs = getComputedStyle(_flyingSourceItem);
      tl.to(flyingTitle, {
        left: itemRect.left,
        top: itemRect.top,
        fontSize: parseFloat(itemCs.fontSize),
        paddingTop: itemCs.paddingTop,
        paddingBottom: itemCs.paddingBottom,
        duration: 0.9,
        ease: 'power3.inOut',
      }, 0.3);
    }

    
    tl.to(pageFade, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.5);

    
    tl.add(function () {
      detailEl.classList.remove('active');
      gsap.set([detailTitleWrap, detailDesc, detailTags, detailGalleryWrap], { opacity: 0 });
      gsap.set(detailBack, { opacity: 0, visibility: 'hidden' });
      gsap.set(flyingTitle, { opacity: 0 });
      _activeThumbIdx = -1;
      _thumbImgs = [];
      _cachedSelImg = null;
      if (_flyingSourceItem) {
        _flyingSourceItem.style.visibility = '';
        _flyingSourceItem = null;
      }
      lenis.start();
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        lenis.scrollTo(projectsSection, { duration: 1.1, offset: -window.innerHeight * 0.2 });
      }
      scheduleScrollRefresh();
    });
  }


  detailEl.addEventListener('wheel', function (e) {
    if (!projectOpen) return;
    e.preventDefault();
    var delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    _galleryY = Math.max(-_galleryMaxScroll, Math.min(0, _galleryY - delta));
    if (_qGalleryY) _qGalleryY(_galleryY);
  }, { passive: false });


  var _detailTouchStartY = 0;
  detailEl.addEventListener('touchstart', function (e) {
    if (!projectOpen) return;
    _detailTouchStartY = e.touches[0].clientY;
  }, { passive: true });
  detailEl.addEventListener('touchmove', function (e) {
    if (!projectOpen) return;
    e.preventDefault();
    var y = e.touches[0].clientY;
    var delta = _detailTouchStartY - y;
    _detailTouchStartY = y;
    _galleryY = Math.max(-_galleryMaxScroll, Math.min(0, _galleryY - delta));
    if (_qGalleryY) _qGalleryY(_galleryY);
  }, { passive: false });

  
  detailBack.addEventListener('click', closeProject);
  window.addEventListener('popstate', function () { if (projectOpen) closeProject(); });

  
  function preloadProjectImages() {
    var allSrcs = [];
    
    items.forEach(function (item) { if (item.dataset.img) allSrcs.push(item.dataset.img); });
    
    Object.keys(PROJECTS).forEach(function (id) {
      var imgs = PROJECTS[id].images;
      if (imgs) allSrcs = allSrcs.concat(imgs);
    });
    
    var seen = {};
    allSrcs = allSrcs.filter(function (s) { if (seen[s]) return false; seen[s] = true; return true; });
    
    var idx = 0, batch = 2;
    function loadBatch() {
      for (var j = 0; j < batch && idx < allSrcs.length; j++, idx++) {
        var img = new Image();
        img.decoding = 'async';
        img.src = allSrcs[idx];
      }
      if (idx < allSrcs.length) {
        if (window.requestIdleCallback) requestIdleCallback(loadBatch);
        else setTimeout(loadBatch, 200);
      }
    }
    if (window.requestIdleCallback) requestIdleCallback(loadBatch);
    else setTimeout(loadBatch, 2000);
  }
  
  setTimeout(preloadProjectImages, 4000);
  scheduleScrollRefresh();
}

function scheduleScrollRefresh() {
  if (scheduleScrollRefresh._raf) cancelAnimationFrame(scheduleScrollRefresh._raf);
  scheduleScrollRefresh._raf = requestAnimationFrame(() => {
    scheduleScrollRefresh._raf = 0;
    ScrollTrigger.refresh();
  });
}

function resetCrossPageTransitionState() {
  var pageFadeEl = document.getElementById('page-fade');
  var flyingTitleEl = document.getElementById('flying-title');

  if (pageFadeEl) {
    gsap.killTweensOf(pageFadeEl);
    gsap.set(pageFadeEl, { opacity: 0 });
  }

  if (flyingTitleEl) {
    gsap.killTweensOf(flyingTitleEl);
    gsap.set(flyingTitleEl, { opacity: 0, x: 0, y: 0 });
  }
}

function playIndexReturnFadeIn() {
  var pageFadeEl = document.getElementById('page-fade');
  if (!pageFadeEl) return;
  gsap.killTweensOf(pageFadeEl);
  pageFadeEl.style.pointerEvents = 'none';
  pageFadeEl.style.opacity = '1';
  requestAnimationFrame(function () {
    gsap.to(pageFadeEl, { opacity: 0, duration: 0.65, ease: 'power2.out' });
  });
}

function handleIndexPageShow(e) {
  var hasReturnFlag = !!sessionStorage.getItem('index-return-fade');
  if (hasReturnFlag) sessionStorage.removeItem('index-return-fade');

  var isBfcacheRestore = !!(e && e.persisted);

  resetCrossPageTransitionState();

  if (isBfcacheRestore) {
    _forceScrollTop();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    scheduleScrollRefresh();
  }

  if (hasReturnFlag || isBfcacheRestore) {
    playIndexReturnFadeIn();
  }
}

window.addEventListener('pageshow', handleIndexPageShow);

document.addEventListener('visibilitychange', function () {
  if (document.hidden) return;
  if (master && master.progress() < 1) master.progress(1);
});
