// Scroll-driven body background fade (cream -> black)
(function () {
  if (!document.documentElement.classList.contains('page-transition')) return;
  const start = [241, 236, 226]; // --bg cream
  const end = [10, 13, 15];      // near-black
  const body = document.body;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = Math.max(1, window.innerHeight * 0.9);
    const t = Math.min(1, Math.max(0, window.scrollY / max));
    const c = start.map((s, i) => Math.round(s + (end[i] - s) * t));
    body.style.backgroundColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  };
  const onScroll = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Text reveal on scroll (headings, ledes, paragraphs)
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const selector = [
    '.section-head .eyebrow',
    '.section-head h2',
    '.section-head__lede',
    '.vision-essay__statement .eyebrow',
    '.vision-essay__manifesto',
    '.future-essay__intro .eyebrow',
    '.future-essay__intro h2',
    '.future-essay__lede',
    '.future-timeline__phase',
    '.future-ambitions__head .eyebrow',
    '.future-commitment .eyebrow',
    '.future-commitment__statement',
    '.about-us__body p',
  ].join(', ');
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  document.documentElement.classList.add('has-text-reveal');
  els.forEach((el, i) => {
    el.classList.add('reveal-up');
    el.style.transitionDelay = (i % 4) * 0.06 + 's';
  });
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('is-revealed');
      else e.target.classList.remove('is-revealed');
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => obs.observe(el));
})();

// Cabin tile preview modal
(function () {
  const items = document.querySelectorAll('.cabin__item');
  const modal = document.querySelector('[data-cabin-modal]');
  if (!items.length || !modal) return;
  const img = modal.querySelector('[data-modal-image]');
  const eyebrow = modal.querySelector('[data-modal-eyebrow]');
  const title = modal.querySelector('[data-modal-title]');
  let lastFocused = null;

  const open = (item) => {
    const sourceImg = item.querySelector('.cabin__media img');
    const sourceEyebrow = item.querySelector('.cabin__eyebrow');
    const sourceTitle = item.querySelector('h3');
    if (img && sourceImg) {
      img.src = sourceImg.currentSrc || sourceImg.src;
      img.alt = sourceImg.alt || '';
    }
    if (eyebrow && sourceEyebrow) eyebrow.textContent = sourceEyebrow.textContent;
    if (title && sourceTitle) title.textContent = sourceTitle.textContent;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  };
  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  items.forEach((item) => {
    item.addEventListener('click', () => open(item));
  });
  modal.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();

// Hero video crossfade loop (two stacked videos)
(function () {
  const wrap = document.querySelector('[data-hero-video]');
  if (!wrap) return;
  const a = wrap.querySelector('.hero__video--a');
  const b = wrap.querySelector('.hero__video--b');
  if (!a || !b) return;
  const FADE = 0.9;
  let active = a;
  let queued = b;
  let crossfading = false;

  const onTime = () => {
    if (crossfading) return;
    const d = active.duration;
    if (!d || isNaN(d)) return;
    if (d - active.currentTime > FADE) return;
    crossfading = true;
    queued.currentTime = 0;
    const playPromise = queued.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
    active.classList.remove('is-active');
    queued.classList.add('is-active');
    const previous = active;
    active = queued;
    queued = previous;
    setTimeout(() => {
      queued.pause();
      queued.currentTime = 0;
      crossfading = false;
    }, FADE * 1000 + 60);
  };

  a.addEventListener('timeupdate', onTime);
  b.addEventListener('timeupdate', onTime);
})();

// Sticky nav state on scroll
const nav = document.getElementById('siteNav');
const onScroll = () => {
  if (window.scrollY > 8) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile hamburger reveal nav menu
const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.nav__menu');
hamburger?.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    menu.style.cssText = 'display:flex; position:absolute; top:100%; left:0; right:0; background:#fff; border-bottom:1px solid var(--line); padding:24px 32px;';
    menu.querySelector('ul').style.cssText = 'flex-direction:column; gap:18px; align-items:flex-start;';
  } else {
    menu.style.cssText = '';
    menu.querySelector('ul').style.cssText = '';
  }
});

// Scroll-reveal for fleet gallery, service tiles, cabin items (bidirectional)
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const sections = [
    { sel: '.fleet .gallery', cols: 1, step: 0 },
    { sel: '.services .tile', cols: 3, step: 0.1 },
    { sel: '.cabin .cabin__item', cols: 3, step: 0.08 },
  ];
  const els = [];
  for (const s of sections) {
    document.querySelectorAll(s.sel).forEach((el, i) => {
      el.style.transitionDelay = (i % s.cols) * s.step + 's';
      els.push(el);
    });
  }
  if (!els.length) return;
  document.documentElement.classList.add('has-reveal');
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add('is-revealed');
      else e.target.classList.remove('is-revealed');
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => obs.observe(el));
})();

// Fleet gallery carousel
(function () {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;
  const track = gallery.querySelector('[data-gallery-track]');
  const prevBtn = gallery.querySelector('[data-gallery-prev]');
  const nextBtn = gallery.querySelector('[data-gallery-next]');
  const indexEl = gallery.querySelector('[data-gallery-index]');
  const totalEl = gallery.querySelector('[data-gallery-total]');
  const progressEl = gallery.querySelector('[data-gallery-progress]');
  if (!track) return;
  const slides = Array.from(track.children);
  if (!slides.length) return;
  if (totalEl) totalEl.textContent = String(slides.length);

  const currentIndex = () => {
    const w = track.clientWidth;
    if (!w) return 0;
    return Math.round(track.scrollLeft / w);
  };
  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[clamped].offsetLeft, behavior: 'smooth' });
  };
  const update = () => {
    const idx = currentIndex();
    if (indexEl) indexEl.textContent = String(idx + 1);
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === slides.length - 1;
    if (progressEl) progressEl.style.width = ((idx + 1) / slides.length) * 100 + '%';
  };

  prevBtn?.addEventListener('click', () => goTo(currentIndex() - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex() + 1));
  let scrollRaf = 0;
  track.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = 0;
      update();
    });
  }, { passive: true });
  window.addEventListener('resize', () => {
    goTo(currentIndex());
  });
  update();
})();

// Concierge chat (rule-based FAQ)
(function () {
  const kb = [
    {
      id: 'greet',
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
      answer: 'Good day. How may I help you with Luxury Transport? Ask about our fleet, rates, service area, or booking.'
    },
    {
      id: 'fleet',
      keywords: ['fleet', 'car', 'cars', 'vehicle', 'vehicles', 'sprinter', 'van', 'saloon', 'seater', 'seat', 'mercedes'],
      answer: 'Our fleet has four vehicles: a 5-seat Executive Saloon, a 12-seat Sprinter (144-inch wheelbase), a 15-seat Sprinter (170-inch wheelbase), and a 15-seat Luxury Sprinter for VIP travel. Each car is privately owned and prepared to concours condition before every assignment.'
    },
    {
      id: 'pricing',
      keywords: ['price', 'pricing', 'cost', 'rate', 'rates', 'hour', 'hourly', 'how much', 'fee', 'fees', 'quote'],
      answer: 'Hourly rates start from £85 for the Executive Saloon, £130 for the 12-seat Sprinter, £160 for the 15-seat Sprinter, and £220 for the Luxury Sprinter. For exact quotes and day-rate retainers, please use the Reserve form on this page.'
    },
    {
      id: 'area',
      keywords: ['where', 'area', 'areas', 'location', 'locations', 'mayfair', 'knightsbridge', 'belgravia', 'london', 'serve', 'cover', 'pickup', 'pick up', 'collect'],
      answer: 'Service is reserved exclusively for Mayfair, Knightsbridge and Belgravia. We provide doorstep collection from any address within those three neighbourhoods.'
    },
    {
      id: 'booking',
      keywords: ['book', 'booking', 'reserve', 'reservation', 'schedule', 'how do i book'],
      answer: 'Use the Reserve form near the bottom of the page. Tell us the date, pickup, destination and occasion, and a concierge will reply within the hour.'
    },
    {
      id: 'airport',
      keywords: ['airport', 'heathrow', 'gatwick', 'city airport', 'farnborough', 'lhr', 'lgw', 'flight'],
      answer: 'We meet clients landside at Heathrow, Gatwick, City and Farnborough, in advance of arrival. Airport transfers are available exclusively to residents of Mayfair, Knightsbridge and Belgravia.'
    },
    {
      id: 'studio',
      keywords: ['studio', 'studios', 'pinewood', 'shepperton', 'filming', 'set'],
      answer: 'Studio runs are included as part of our Corporate Chauffeur and VIP & Celebrity services for clients within Mayfair, Knightsbridge and Belgravia.'
    },
    {
      id: 'vip',
      keywords: ['vip', 'celebrity', 'celebrities', 'discreet', 'discretion', 'private', 'nda', 'press', 'paparazzi'],
      answer: 'Every assignment is conducted under strict non-disclosure. Our chauffeurs are DBS-cleared, ROSPA-trained, and routinely entrusted with VIP and celebrity transport across Mayfair, Knightsbridge and Belgravia.'
    },
    {
      id: 'wedding',
      keywords: ['wedding', 'weddings', 'event', 'events', 'ceremony', 'reception', 'bride', 'groom'],
      answer: 'For weddings and events we provide ribboned arrivals and calmly-driven exits. Ceremonies and receptions are served across Mayfair, Knightsbridge and Belgravia, with onward transfers to airport or studio.'
    },
    {
      id: 'long',
      keywords: ['long distance', 'long-distance', 'country', 'tour', 'far', 'motorway', 'countryside'],
      answer: 'Long Distance Hire is door to door from your Mayfair, Knightsbridge or Belgravia address, composed at motorway pace, to airport, studio, or the country beyond.'
    },
    {
      id: 'contact',
      keywords: ['contact', 'phone', 'call', 'email', 'reach', 'number', 'tel'],
      answer: 'You can reach us by phone at +44 (0)20 0000 0000 or email bookings@luxurytransport.co.uk. The Reserve form on this page will also notify a concierge directly.'
    },
    {
      id: 'hours',
      keywords: ['hour', 'hours', 'open', 'available', 'availability', 'when', '24', '24/7', 'night'],
      answer: 'Our concierge desk responds within the hour, and chauffeurs are available around the clock for residents of Mayfair, Knightsbridge and Belgravia.'
    },
    {
      id: 'chauffeur',
      keywords: ['chauffeur', 'driver', 'drivers', 'training', 'qualified', 'experience', 'dbs', 'rospa'],
      answer: 'Every chauffeur is hand-selected, DBS-cleared, ROSPA-trained, and bound by strict non-disclosure. Cars are valeted to delivery condition before each booking.'
    }
  ];

  const chips = [
    { label: 'Our fleet', topicId: 'fleet' },
    { label: 'Rates', topicId: 'pricing' },
    { label: 'Service area', topicId: 'area' },
    { label: 'Booking', topicId: 'booking' }
  ];
  const greeting = "Good day. I attend to bookings, routes, and anything else.";
  const fallback = "I don't have a direct answer for that. Please use the Reserve form below, or email bookings@luxurytransport.co.uk and a concierge will be in touch within the hour.";

  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chat');
  const closeBtn = document.getElementById('chatClose');
  const log = document.getElementById('chatLog');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const chipsEl = document.getElementById('chatChips');
  if (!toggle || !panel) return;

  function append(text, who) {
    const div = document.createElement('div');
    div.className = 'chat__msg chat__msg--' + who;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function answerFor(query) {
    const q = query.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const topic of kb) {
      let score = 0;
      for (const k of topic.keywords) {
        if (q.indexOf(k) !== -1) score++;
      }
      if (score > bestScore) { bestScore = score; best = topic; }
    }
    return best ? best.answer : fallback;
  }

  function topicAnswer(topicId) {
    const topic = kb.find(t => t.id === topicId);
    return topic ? topic.answer : fallback;
  }

  function renderChips() {
    chipsEl.innerHTML = '';
    for (const c of chips) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat__chip';
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        append(c.label, 'user');
        setTimeout(() => append(topicAnswer(c.topicId), 'bot'), 240);
      });
      chipsEl.appendChild(btn);
    }
  }

  function openChat() {
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    if (!log.dataset.seeded) {
      append(greeting, 'bot');
      log.dataset.seeded = '1';
    }
    setTimeout(() => input.focus(), 200);
  }
  function closeChat() {
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    if (panel.getAttribute('aria-hidden') === 'false') closeChat();
    else openChat();
  });
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    append(v, 'user');
    input.value = '';
    setTimeout(() => append(answerFor(v), 'bot'), 240);
  });

  renderChips();
})();
