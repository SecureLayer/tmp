(function () {
  "use strict";

  var root = document.documentElement;
  // Added before first paint so the stacked HTML never flashes; init() removes
  // it again if anything about the markup is not what the deck expects.
  root.classList.add("wdwd-js");

  function init() {
    try {
      var stage = document.getElementById("wdwd-stage");
      var chooser = document.getElementById("wdwd-chooser");
      if (!stage || !chooser) throw new Error("deck markup missing");
      var paths = Array.prototype.slice.call(
        stage.querySelectorAll(".wdwd-path"),
      );
      if (paths.length === 0) throw new Error("no paths");

      var live = document.createElement("p");
      live.id = "wdwd-live";
      live.className = "wdwd-sr";
      live.setAttribute("aria-live", "polite");
      stage.appendChild(live);

      var nav = document.createElement("div");
      nav.className = "wdwd-nav";
      var prev = document.createElement("button");
      prev.type = "button";
      prev.className = "wdwd-prev";
      prev.textContent = "←";
      prev.setAttribute("aria-label", "Previous slide");
      var dots = document.createElement("div");
      dots.className = "wdwd-dots";
      dots.setAttribute("aria-hidden", "true");
      var next = document.createElement("button");
      next.type = "button";
      next.className = "wdwd-next";
      next.textContent = "→";
      next.setAttribute("aria-label", "Next slide");
      nav.appendChild(prev);
      nav.appendChild(dots);
      nav.appendChild(next);
      stage.appendChild(nav);

      var state = { door: null, index: 0 };

      function pathById(id) {
        for (var i = 0; i < paths.length; i++) {
          if (paths[i].id === id) return paths[i];
        }
        return null;
      }

      function doorFromHash() {
        var raw = location.hash.replace(/^#/, "");
        try {
          raw = decodeURIComponent(raw);
        } catch (e) {
          return null;
        }
        raw = raw.toLowerCase();
        for (var i = 0; i < paths.length; i++) {
          if (paths[i].id.toLowerCase() === raw) return paths[i].id;
        }
        return null;
      }

      function render(moveFocus) {
        var path = state.door ? pathById(state.door) : null;
        chooser.classList.toggle("is-active", !path);
        paths.forEach(function (p) {
          p.classList.toggle("is-active", p === path);
        });
        var slides = path
          ? Array.prototype.slice.call(path.querySelectorAll(".wdwd-slide"))
          : [];
        // clear the marker on every path, not just this one: a slide left marked
        // in a hidden path would stay visible (a visible child beats a hidden parent)
        Array.prototype.forEach.call(
          stage.querySelectorAll(".wdwd-slide.is-active"),
          function (s) {
            s.classList.remove("is-active");
          },
        );
        slides.forEach(function (s, i) {
          if (i === state.index) s.classList.add("is-active");
        });

        var total = slides.length + 1;
        var position = path ? state.index + 1 : 0;
        prev.disabled = !path;
        next.disabled = !path || state.index >= slides.length - 1;
        while (dots.firstChild) dots.removeChild(dots.firstChild);
        for (var d = 0; d < total; d++) {
          var dot = document.createElement("span");
          dot.className = "wdwd-dot" + (d === position ? " is-on" : "");
          dots.appendChild(dot);
        }

        var active = path ? slides[state.index] : chooser;
        var heading = active ? active.querySelector("h2, h3") : null;
        if (moveFocus && heading) {
          heading.focus({ preventScroll: true });
          // on short or zoomed screens the stage is taller than the viewport,
          // so bring the new heading into view (no-op when already visible)
          heading.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
        live.textContent = path
          ? "Slide " +
            (position + 1) +
            " of " +
            total +
            ": " +
            (heading ? heading.textContent : "")
          : "Choose who you are";
      }

      function go(delta) {
        if (!state.door) return;
        if (delta < 0 && state.index === 0) {
          location.hash = "wdwd-chooser";
          return;
        }
        var path = pathById(state.door);
        var count = path ? path.querySelectorAll(".wdwd-slide").length : 0;
        state.index = Math.max(0, Math.min(count - 1, state.index + delta));
        render(true);
      }

      function onHash(moveFocus) {
        state = { door: doorFromHash(), index: 0 };
        render(moveFocus);
      }

      prev.addEventListener("click", function () {
        go(-1);
      });
      next.addEventListener("click", function () {
        go(1);
      });
      window.addEventListener("hashchange", function () {
        onHash(true);
      });
      document.addEventListener("keydown", function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        var t = e.target;
        var tag = t && t.tagName ? t.tagName : "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      });

      var startX = 0;
      var startY = 0;
      stage.addEventListener(
        "touchstart",
        function (e) {
          startX = e.changedTouches[0].clientX;
          startY = e.changedTouches[0].clientY;
        },
        { passive: true },
      );
      stage.addEventListener(
        "touchend",
        function (e) {
          var dx = e.changedTouches[0].clientX - startX;
          var dy = e.changedTouches[0].clientY - startY;
          if (Math.abs(dx) > 50 && Math.abs(dy) < 40) go(dx < 0 ? 1 : -1);
        },
        { passive: true },
      );

      onHash(false);
    } catch (err) {
      root.classList.remove("wdwd-js");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
