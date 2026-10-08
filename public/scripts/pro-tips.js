// Pro Tips (phone homepage): shows the tips one at a time, on one line.
// Without JavaScript, or with "reduce motion", all tips stay stacked (see index.astro).
(() => {
  const box = document.getElementById("mProTips");
  if (!box) return;
  const tips = [...box.querySelectorAll(".m-tip")];
  if (tips.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const seconds =
    Number(box.dataset.seconds) > 0 ? Number(box.dataset.seconds) : 3.5;
  const MAX = 24; // px, matches the CSS clamp ceiling
  const MIN = 13;
  let current = 0;

  // Shrink a tip that would not fit on one line (long future tips) down to MIN px.
  const fit = () => {
    const room = box.querySelector(".m-tips").clientWidth;
    tips.forEach((tip) => {
      tip.style.fontSize = "";
      let size = parseFloat(getComputedStyle(tip).fontSize) || MAX;
      while (tip.scrollWidth > room && size > MIN) {
        size -= 0.5;
        tip.style.fontSize = size + "px";
      }
    });
  };

  box.classList.add("is-rotating");
  tips[0].classList.add("is-on");
  fit();
  window.addEventListener("resize", fit);
  document.fonts?.ready.then(fit);

  const next = () => {
    tips[current].classList.remove("is-on");
    current = (current + 1) % tips.length;
    tips[current].classList.add("is-on");
  };
  let timer = setInterval(next, seconds * 1000);
  document.addEventListener("visibilitychange", () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(next, seconds * 1000);
  });
})();
