/* JPSOUND prototipi — kopīga UZVEDĪBA visiem variantiem.
   Šeit nav stila: izskats nāk tikai no tokens.css + components.css. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sākumlapas kinētika: slaidu maiņa + pauze (WCAG 2.2.2) */
  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero__slide'));
    var btn = hero.querySelector('.hero__pause');
    var label = btn && btn.querySelector('.hero__pause-label');
    var i = 0, timer = null;
    var interval = parseInt(hero.getAttribute('data-interval'), 10) || 6000;

    function show(n) {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () { show(i + 1); }, interval);
      hero.classList.remove('is-paused');
      if (btn) { btn.setAttribute('aria-pressed', 'false'); label.textContent = 'Pauzēt kustību'; }
    }
    function pause() {
      clearInterval(timer);
      hero.classList.add('is-paused');
      if (btn) { btn.setAttribute('aria-pressed', 'true'); label.textContent = 'Atsākt kustību'; }
    }

    if (reduce) pause(); else play();
    if (btn) btn.addEventListener('click', function () {
      hero.classList.contains('is-paused') ? play() : pause();
    });
  });

  /* Kursora prožektors (variants D): pele/pirksts izgaismo apli; bez kustības — klīst pats */
  document.querySelectorAll('[data-spotlight]').forEach(function (el) {
    if (reduce) { el.classList.add('is-static'); return; }
    var x = 0.7, y = 0.4, lastMove = 0, t = 0;
    function set(px, py) {
      el.style.setProperty('--x', px + 'px');
      el.style.setProperty('--y', py + 'px');
    }
    function onMove(e) {
      var r = el.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      lastMove = performance.now();
      set(p.clientX - r.left, p.clientY - r.top);
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('touchmove', onMove, { passive: true });
    (function wander(now) {
      if (!el.classList.contains('is-paused') && now - lastMove > 2500) {
        t += 0.004;
        var r = el.getBoundingClientRect();
        set(r.width * (0.55 + 0.3 * Math.sin(t * 1.3)), r.height * (0.45 + 0.25 * Math.sin(t * 2.1 + 1)));
      }
      requestAnimationFrame(wander);
    })(0);
  });

  /* Ritināšanas nodaļas (variants D): parādās, kad nonāk skatā */
  var chapters = document.querySelectorAll('.chapter');
  if (chapters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      chapters.forEach(function (c) { c.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.target.classList.toggle('is-visible', en.isIntersecting); });
      }, { threshold: 0.35 });
      chapters.forEach(function (c) { io.observe(c); });
    }
  }

  /* Galerijas filtrs + tukšais stāvoklis */
  document.querySelectorAll('[data-filter]').forEach(function (bar) {
    var grid = document.querySelector(bar.getAttribute('data-filter'));
    var empty = document.querySelector(bar.getAttribute('data-empty'));
    var items = Array.prototype.slice.call(grid.querySelectorAll('[data-cat]'));

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-value]');
      if (!b) return;
      bar.querySelectorAll('button[data-value]').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      var v = b.getAttribute('data-value'), n = 0;
      items.forEach(function (it) {
        var on = v === 'all' || it.getAttribute('data-cat') === v;
        it.hidden = !on;
        if (on) n++;
      });
      grid.hidden = n === 0;
      empty.hidden = n > 0;
    });
  });

  /* Formas validācija (prototips — dati netiek sūtīti) */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var status = form.querySelector('.form__status');

    function check(field) {
      var input = field.querySelector('input, select, textarea');
      if (!input) return true;
      var ok = input.checkValidity();
      field.classList.toggle('field--error', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }

    form.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('input, select, textarea');
      if (input) input.addEventListener('change', function () {
        if (field.classList.contains('field--error')) check(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      form.querySelectorAll('.field').forEach(function (field) {
        if (!check(field) && !first) first = field.querySelector('input, select, textarea');
      });
      if (first) {
        status.textContent = 'Lūdzu, izlabojiet atzīmētos laukus.';
        status.className = 'form__status form__status--error';
        first.focus();
      } else {
        status.textContent = 'Prototips: dati netiek nosūtīti. Īstajā lapā šeit būs apstiprinājums par saņemto raideri.';
        status.className = 'form__status form__status--ok';
      }
    });
  });

  /* Faila lauks: parāda izvēlētā faila nosaukumu */
  document.querySelectorAll('.dropzone').forEach(function (zone) {
    var input = zone.querySelector('input[type=file]');
    var name = zone.querySelector('.dropzone__name');
    input.addEventListener('change', function () {
      name.textContent = input.files.length ? input.files[0].name : 'Fails nav izvēlēts';
      zone.classList.toggle('dropzone--filled', input.files.length > 0);
    });
  });

  /* Mobilā navigācija */
  document.querySelectorAll('.nav-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var header = btn.closest('.site-header');
      var open = header.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
