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
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${projects.length}`);

    const language = document.createElement('p');
    language.className = 'tech project-language';
    language.textContent = project.language || 'GITHUB PROJECT';
    const title = document.createElement('h3');
    title.textContent = project.name;
    const description = document.createElement('p');
    description.textContent = project.description || 'Project repository on GitHub.';
    const tags = document.createElement('div');
    tags.className = 'project-tags';
    getTags(project).forEach((tag) => {
      const chip = document.createElement('span');
      chip.textContent = tag;
      tags.append(chip);
    });
    const link = document.createElement('a');
    link.className = 'project-link';
    link.href = profileUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.append(document.createTextNode('Explore GitHub '));
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
  projects = [{
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
      const publicProjects = repositories.filter((repository) => !repository.fork).slice(0, 12);
      if (!publicProjects.length) return;
      projects = publicProjects.map((repository) => ({
        name: repository.name,
        description: repository.description,
        language: repository.language,
      }));
      activeSlide = 0;
      renderCarousel();
    })
    .catch(() => {
      projects = [{
        name: 'Explore my repositories',
        description: 'GitHub could not be reached right now. Visit my profile to browse current projects.',
        language: 'GITHUB PROFILE',
      }];
      activeSlide = 0;
      renderCarousel();
    });
}
