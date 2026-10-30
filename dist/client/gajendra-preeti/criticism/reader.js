(() => {
  const bar = document.querySelector('.progress');
  let queued = false;
  function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    queued = false;
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(progress); } }, { passive: true });
  addEventListener('resize', progress); progress();
  const form = document.querySelector('.filters');
  if (form) {
    const search = document.querySelector('#search');
    const group = document.querySelector('#group');
    const basis = document.querySelector('#basis');
    const cards = [...document.querySelectorAll('[data-book]')];
    function filter() {
      const query = search.value.normalize('NFC').toLowerCase().trim();
      let count = 0;
      for (const card of cards) {
        const matchesBasis = basis.value === 'all' || (basis.value === 'direct' && ['sample', 'visual', 'visual-full'].includes(card.dataset.basis)) || (basis.value === 'introduction' && ['publisher', 'catalogue'].includes(card.dataset.basis)) || basis.value === card.dataset.basis;
        card.hidden = !(matchesBasis && (group.value === 'all' || card.dataset.group === group.value) && card.dataset.search.normalize('NFC').includes(query));
        if (!card.hidden) count++;
      }
      for (const section of document.querySelectorAll('[data-collection]')) section.hidden = ![...section.querySelectorAll('[data-book]')].some(card => !card.hidden);
      document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
      document.querySelector('#empty').hidden = count > 0;
      progress();
    }
    form.addEventListener('input', filter);
    form.addEventListener('change', filter);
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('reset', () => requestAnimationFrame(filter));
  }
  const controls = document.querySelector('.reader-controls');
  if (controls) {
    controls.hidden = false;
    let size = 20;
    for (const [id, step] of [['smaller', -2], ['larger', 2]]) {
      document.getElementById(id).addEventListener('click', () => {
        size = Math.min(28, Math.max(18, size + step));
        document.documentElement.style.setProperty('--reading-size', `${size}px`);
        document.getElementById('smaller').disabled = size === 18;
        document.getElementById('larger').disabled = size === 28;
        progress();
      });
    }
  }
})();
