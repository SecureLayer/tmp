const clockEl = document.getElementById("menu-clock");
if (clockEl) {
  const fmt = () =>
    new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  clockEl.textContent = fmt();
  setInterval(() => {
    clockEl.textContent = fmt();
  }, 30000);
}

const previewWindow = document.getElementById("preview-window");
const previewFilename = document.getElementById("preview-filename");
const previewBody = document.getElementById("preview-body");
const previewImg = document.getElementById("preview-img");
if (previewWindow && previewFilename && previewBody && previewImg) {
  document.querySelectorAll(".menu-item[data-preview-file]").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      previewFilename.textContent = item.dataset.previewFile ?? "";
      previewBody.style.setProperty(
        "--preview-accent",
        item.dataset.previewAccent ?? "var(--cyan)",
      );
      const imgSrc = item.dataset.previewImg;
      if (imgSrc) {
        previewImg.src = imgSrc;
        previewBody.classList.add("has-image");
      } else {
        previewImg.src = "";
        previewBody.classList.remove("has-image");
      }
      previewWindow.classList.add("is-visible");
    });
    item.addEventListener("mouseleave", () => {
      previewWindow.classList.remove("is-visible");
    });
  });
}

const dockTooltip = document.getElementById("dock-tooltip");
if (dockTooltip) {
  document.querySelectorAll(".dock-icon[data-tooltip]").forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      const rect = icon.getBoundingClientRect();
      dockTooltip.textContent = icon.dataset.tooltip ?? "";
      dockTooltip.style.left = `${rect.left + rect.width / 2}px`;
      dockTooltip.style.top = `${rect.top}px`;
      dockTooltip.classList.add("is-visible");
    });
    icon.addEventListener("mouseleave", () => {
      dockTooltip.classList.remove("is-visible");
    });
  });
}

document.querySelectorAll("[data-u]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const u = btn.dataset.u ?? "";
    const d = btn.dataset.d ?? "";
    const s = btn.dataset.s ?? "";
    window.location.href = `mailto:${u}@${d}?subject=${encodeURIComponent(s)}`;
  });
});
