// Animated starfield background.
(() => {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let ratio = 1;
  let stars = [];

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(180, Math.floor(width * height / 7500)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.25,
      speed: Math.random() * 0.26 + 0.04,
      alpha: Math.random() * 0.7 + 0.2,
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.y -= star.speed;
      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
      }
      context.globalAlpha = star.alpha * (0.65 + 0.35 * Math.sin(Date.now() * 0.001 + star.x));
      context.fillStyle = '#b9f5ff';
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const launchMission = document.querySelector('.hero a[href="#gate"]');
function animateScrollTo(target, duration = 900) {
  const root = document.documentElement;
  const body = document.body;
  const savedRootBehavior = [root.style.getPropertyValue('scroll-behavior'), root.style.getPropertyPriority('scroll-behavior')];
  const savedBodyBehavior = [body.style.getPropertyValue('scroll-behavior'), body.style.getPropertyPriority('scroll-behavior')];
  const startY = window.scrollY;
  const endY = startY + target.getBoundingClientRect().top;
  const startTime = performance.now();

  root.style.setProperty('scroll-behavior', 'auto', 'important');
  body.style.setProperty('scroll-behavior', 'auto', 'important');

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY + (endY - startY) * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }
    if (savedRootBehavior[0]) root.style.setProperty('scroll-behavior', savedRootBehavior[0], savedRootBehavior[1]);
    else root.style.removeProperty('scroll-behavior');
    if (savedBodyBehavior[0]) body.style.setProperty('scroll-behavior', savedBodyBehavior[0], savedBodyBehavior[1]);
    else body.style.removeProperty('scroll-behavior');
  }

  requestAnimationFrame(tick);
}
launchMission?.addEventListener('click', (event) => {
  const gate = document.getElementById('gate');
  if (!gate) return;
  event.preventDefault();
  history.pushState(null, '', '#gate');
  animateScrollTo(gate);
});

// Cursor tilt and glow on the hero banner.
const hero = document.querySelector('.hero');
const heroTitle = hero?.querySelector('h1');
// Build the hero name from glowing pixels, then disperse those pixels as the
// visitor scrolls away from the opening screen.
const pixelCanvas = document.getElementById('title-pixels');
if (hero && heroTitle && pixelCanvas) {
  const ctx = pixelCanvas.getContext('2d');
  const sample = document.createElement('canvas');
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
  let particles = [];
  let introStart = performance.now();
  let framePending = false;

  function buildPixels() {
    const bounds = heroTitle.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    pixelCanvas.width = Math.ceil(bounds.width * dpr);
    pixelCanvas.height = Math.ceil(bounds.height * dpr);
    pixelCanvas.style.width = `${bounds.width}px`;
    pixelCanvas.style.height = `${bounds.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sample.width = Math.ceil(bounds.width);
    sample.height = Math.ceil(bounds.height);
    const style = getComputedStyle(heroTitle);
    sampleCtx.clearRect(0, 0, sample.width, sample.height);
    sampleCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    sampleCtx.textBaseline = 'top';
    sampleCtx.fillStyle = '#fff';
    sampleCtx.fillText('Vickson Nah', 0, 0);
    const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
    particles = [];
    const step = 3;
    for (let y = 0; y < sample.height; y += step) for (let x = 0; x < sample.width; x += step) {
      if (pixels[(y * sample.width + x) * 4 + 3] > 100) {
        // Keep the starting cloud inside the canvas. Scattering particles far
        // beyond its bounds clipped almost all of them, making the effect hard
        // to see on initial load.
        particles.push({ x, y, size: 1 + Math.random() * 1.2, delay: Math.random() * .2,
          sx: Math.random() * bounds.width, sy: Math.random() * bounds.height });
      }
    }
    heroTitle.classList.add('pixel-active');
    drawPixels();
  }

  function drawPixels() {
    framePending = false;
    const bounds = hero.getBoundingClientRect();
    const scrollProgress = Math.max(0, Math.min(1, -bounds.top / (bounds.height * .3)));
    const introProgress = Math.min(1, (performance.now() - introStart) / 1500);
    const formation = 1 - Math.max(scrollProgress, 1 - introProgress);
    const ease = formation * formation * (3 - 2 * formation);
    ctx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    for (const p of particles) {
      const scattered = Math.max(0, Math.min(1, (1 - ease - p.delay) / (1 - p.delay)));
      const x = p.x + (p.sx - p.x) * scattered;
      const y = p.y + (p.sy - p.y) * scattered + scrollProgress * (14 + p.delay * 30);
      ctx.globalAlpha = Math.max(0, 1 - scattered) * (1 - scrollProgress * .75);
      ctx.fillStyle = p.delay < .34 ? '#a5f3fc' : '#c4b5fd';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 7;
      ctx.fillRect(x, y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    if (scrollProgress < 1 || introProgress < 1) requestAnimationFrame(() => { framePending = false; drawPixels(); });
  }

  function requestPixelFrame() {
    if (!framePending) { framePending = true; requestAnimationFrame(drawPixels); }
  }
  window.addEventListener('scroll', requestPixelFrame, { passive: true });
  window.addEventListener('resize', buildPixels);
  buildPixels();
  if (document.fonts?.ready) document.fonts.ready.then(() => {
    introStart = performance.now();
    buildPixels();
  });
}
if (hero && heroTitle) {
  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const rotateY = x * 8;
    const rotateX = y * -6;
    heroTitle.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    hero.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--my', `${event.clientY - bounds.top}px`);
  });
  hero.addEventListener('pointerleave', () => { heroTitle.style.transform = ''; });
}

// Copy contact details.
document.querySelectorAll('.copy').forEach((button) => {
  button.addEventListener('click', async () => {
    const output = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      output.textContent = 'Copied to clipboard.';
    } catch {
      output.textContent = `Clipboard unavailable. Select and copy: ${button.dataset.copy}`;
    }
  });
});

// GitHub project carousel.
const carousel = document.getElementById('project-carousel');
const track = document.getElementById('repos');
const dots = document.getElementById('carousel-dots');
const previous = carousel?.querySelector('.carousel-prev');
const next = carousel?.querySelector('.carousel-next');
const profileUrl = 'https://github.com/VicksonnNah';
const featuredProjects = [
  {
    name: 'Covid Tracker',
    description: 'A web app for tracking COVID-19 information.',
    language: 'WEB PROJECT',
    tags: ['HTML', 'JavaScript', 'Web Development'],
    featured: true,
    siteUrl: 'https://vicksonnnah.github.io/CovidTracker/',
  },
  {
    name: 'Spotify Clone',
    description: 'A Spotify-inspired music app built with Supabase.',
    language: 'WEB PROJECT',
    tags: ['JavaScript', 'Supabase', 'Web Development'],
    featured: true,
    siteUrl: 'https://spoitfy-clone-with-supabase.vercel.app/login',
  },
  {
    name: 'Bus App',
    description: 'A web app for exploring bus information and services.',
    language: 'WEB PROJECT',
    tags: ['HTML', 'JavaScript', 'Web Development'],
    featured: true,
    siteUrl: 'https://vicksonnnah.github.io/BusApp/',
  },
];
let projects = [];
let activeSlide = 0;
let pointerStartX = null;
let hovered = false;
let focused = false;
let suppressSlideClick = false;

function getTags(project) {
  const language = project.language || 'Code';
  const lower = language.toLowerCase();
  const category = lower === 'python' ? 'Python' :
    ['html', 'javascript', 'typescript', 'css'].includes(lower) ? 'Web Development' :
    ['c', 'c++', 'shell', 'powershell'].includes(lower) ? 'Networking' : 'Software';
  return [...new Set([language, category])];
}

function updateCarousel() {
  if (!track || !dots || !projects.length) return;
  const previousIndex = (activeSlide - 1 + projects.length) % projects.length;
  const nextIndex = (activeSlide + 1) % projects.length;
  [...track.children].forEach((slide, index) => {
    slide.classList.remove('slide-active', 'slide-prev', 'slide-next', 'slide-hidden', 'slide-hidden-right');
    if (index === activeSlide) {
      slide.classList.add('slide-active');
      slide.inert = false;
    } else if (index === previousIndex) {
      slide.classList.add('slide-prev');
      slide.inert = false;
    } else if (index === nextIndex) {
      slide.classList.add('slide-next');
      slide.inert = false;
    } else {
      slide.classList.add('slide-hidden');
      slide.inert = true;
      const distance = (index - activeSlide + projects.length) % projects.length;
      if (distance < projects.length / 2) slide.classList.add('slide-hidden-right');
      slide.setAttribute('aria-hidden', 'true');
    }
    if (index === activeSlide || index === previousIndex || index === nextIndex) {
      slide.removeAttribute('aria-hidden');
    }
  });
  [...dots.children].forEach((dot, index) => {
    const selected = index === activeSlide;
    dot.classList.toggle('is-active', selected);
    dot.setAttribute('aria-selected', String(selected));
  });
}

function renderCarousel() {
  if (!track || !dots || !projects.length) return;
  activeSlide = Math.min(activeSlide, projects.length - 1);
  track.replaceChildren();
  dots.replaceChildren();

  projects.forEach((project, index) => {
    const slide = document.createElement('article');
    slide.className = 'project-slide panel';
    if (project.featured) slide.classList.add('featured-project');
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${projects.length}`);

    const language = document.createElement('p');
    language.className = 'tech project-language';
    language.textContent = project.language || 'GITHUB PROJECT';
    if (project.featured) {
      const badge = document.createElement('span');
      badge.className = 'project-featured';
      badge.innerHTML = '<span aria-hidden="true">★</span> Featured';
      slide.append(badge);
    }
    const title = document.createElement('h3');
    title.textContent = project.name;
    const description = document.createElement('p');
    description.textContent = project.description || 'Project repository on GitHub.';
    const tags = document.createElement('div');
    tags.className = 'project-tags';
    (project.tags || getTags(project)).forEach((tag) => {
      const chip = document.createElement('span');
      chip.textContent = tag;
      tags.append(chip);
    });
    const link = document.createElement('a');
    link.className = 'project-link';
    link.href = project.siteUrl || profileUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.append(document.createTextNode(project.siteUrl ? 'Visit site ' : 'Explore GitHub '));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u2197';
    link.append(arrow);
    slide.append(language, title, description, tags, link);
    slide.addEventListener('click', (event) => {
      if (suppressSlideClick) {
        suppressSlideClick = false;
        event.preventDefault();
        return;
      }
      if (event.target.closest('a, button')) return;
      if (slide.classList.contains('slide-prev') || slide.classList.contains('slide-next')) {
        activeSlide = index;
        updateCarousel();
      }
    });
    track.append(slide);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show project ${index + 1}: ${project.name}`);
    dot.setAttribute('aria-controls', 'repos');
    dot.addEventListener('click', () => { activeSlide = index; updateCarousel(); });
    dots.append(dot);
  });
  updateCarousel();
}

function stepCarousel(direction) {
  if (!projects.length) return;
  activeSlide = (activeSlide + direction + projects.length) % projects.length;
  updateCarousel();
}

previous?.addEventListener('click', () => stepCarousel(-1));
next?.addEventListener('click', () => stepCarousel(1));
carousel?.addEventListener('mouseenter', () => { hovered = true; });
carousel?.addEventListener('mouseleave', () => { hovered = false; });
carousel?.addEventListener('focusin', () => { focused = true; });
carousel?.addEventListener('focusout', (event) => {
  if (!carousel.contains(event.relatedTarget)) focused = false;
});
carousel?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); stepCarousel(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); stepCarousel(1); }
});
carousel?.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse') {
    pointerStartX = null;
    return;
  }
  pointerStartX = event.clientX;
});
carousel?.addEventListener('pointerup', (event) => {
  if (event.pointerType === 'mouse') return;
  if (pointerStartX === null) return;
  const distance = event.clientX - pointerStartX;
  if (Math.abs(distance) > 45) {
    suppressSlideClick = true;
    stepCarousel(distance < 0 ? 1 : -1);
    window.setTimeout(() => { suppressSlideClick = false; }, 400);
  }
  pointerStartX = null;
});
carousel?.addEventListener('pointercancel', () => { pointerStartX = null; });

if (carousel && track) {
  projects = [...featuredProjects, {
    name: 'Explore my repositories',
    description: 'Visit my GitHub profile to browse current projects and code.',
    language: 'GITHUB PROFILE',
  }];
  renderCarousel();
  window.setInterval(() => {
    if (!hovered && !focused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) stepCarousel(1);
  }, 5000);

  fetch('https://api.github.com/users/VicksonnNah/repos?per_page=100&sort=updated')
    .then((response) => {
      if (!response.ok) throw new Error('GitHub unavailable');
      return response.json();
    })
    .then((repositories) => {
      const excludedRepositoryName = /lesson|module|devasc|portfolio|\bl20\b|\bc237\b|c237_l12app|\b[a-z]{1,4}\d{3,4}\b/i;
      const publicProjects = repositories
        .filter((repository) => !repository.fork && !excludedRepositoryName.test(repository.name))
        .slice(0, 12);
      if (!publicProjects.length) return;
      const normalizeProjectName = (name) => name.replace(/[^a-z0-9]/gi, '').toLowerCase();
      const featuredNames = new Set(featuredProjects.map((project) => normalizeProjectName(project.name)));
      projects = [...featuredProjects, ...publicProjects
        .filter((repository) => !featuredNames.has(normalizeProjectName(repository.name)))
        .map((repository) => ({
        name: repository.name,
        description: repository.description,
        language: repository.language,
      }))];
      activeSlide = 0;
      renderCarousel();
    })
    .catch(() => {
      projects = [...featuredProjects, {
        name: 'Explore my repositories',
        description: 'GitHub could not be reached right now. Visit my profile to browse current projects.',
        language: 'GITHUB PROFILE',
      }];
      activeSlide = 0;
      renderCarousel();
    });
}
