// Filter pills
const pills = document.querySelectorAll('.pill');
const cards = document.querySelectorAll('.card');
const countEl = document.getElementById('visible-count');

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter ?? 'all';
    let visible = 0;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
  });
});
