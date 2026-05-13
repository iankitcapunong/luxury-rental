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
  const greeting = "Good day. I'm the Luxury Transport concierge. Ask about our fleet, rates, service area or booking, and I'll reply right away.";
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
