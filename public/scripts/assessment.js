const CHECKS = [
  { id: "security_policy", name: "Security Policy (SECURITY.md)", weight: 15 },
  { id: "dependabot", name: "Automated Dependency Updates", weight: 15 },
  { id: "branch_protection", name: "Branch Protection / Rulesets", weight: 15 },
  {
    id: "credential_hygiene",
    name: "Workflow Token & Tag Controls",
    weight: 15,
  },
  { id: "active", name: "Active Maintenance (< 12 months)", weight: 10 },
  { id: "ci_cd", name: "CI/CD Pipeline (GitHub Actions)", weight: 10 },
  { id: "license", name: "Open Source License", weight: 10 },
  { id: "code_of_conduct", name: "Code of Conduct", weight: 5 },
  { id: "contributing", name: "Contributing Guidelines", weight: 5 },
];

// Curated subset shown on cards — keeps the surface small and focused
const DISPLAY_CHECKS = CHECKS.filter((c) =>
  ["security_policy", "active", "contributing"].includes(c.id),
);

const GRADES = {
  "A+": { label: "Outstanding", color: "#22c55e", bg: "rgba(34,197,94,.15)" },
  A: { label: "Excellent", color: "#4ade80", bg: "rgba(74,222,128,.12)" },
  "A-": { label: "Very Good", color: "#86efac", bg: "rgba(134,239,172,.1)" },
  "B+": { label: "Good", color: "#bef264", bg: "rgba(190,242,100,.1)" },
  B: { label: "Good", color: "#fbbf24", bg: "rgba(251,191,36,.08)" },
  "B-": { label: "Adequate", color: "#fb923c", bg: "rgba(251,146,60,.08)" },
  "C+": { label: "Fair", color: "#f97316", bg: "rgba(249,115,22,.08)" },
  C: { label: "Fair", color: "#ef4444", bg: "rgba(239,68,68,.07)" },
  "C-": { label: "Needs Work", color: "#f87171", bg: "rgba(248,113,113,.07)" },
  "D+": { label: "Poor", color: "#dc2626", bg: "rgba(220,38,38,.07)" },
  D: { label: "Poor", color: "#dc2626", bg: "rgba(220,38,38,.07)" },
  "D-": { label: "Critical", color: "#b91c1c", bg: "rgba(185,28,28,.07)" },
  F: { label: "Critical Gaps", color: "#7f1d1d", bg: "rgba(127,29,29,.07)" },
};

const GRADE_ORDER = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
];

// Base score (0–100 from scanner) is scaled to 0–90; OpenSSF (exact decimal) adds 0–10.
// Total is always out of 100.
function totalScore(a) {
  const base = a.score * 0.9;
  const openssf = a.openssf_score ?? 0;
  return Math.round((base + openssf) * 10) / 10;
}
function computeGrade(s) {
  if (s > 95) return "A+";
  if (s >= 88) return "A";
  if (s >= 82) return "A-";
  if (s >= 76) return "B+";
  if (s >= 70) return "B";
  if (s >= 63) return "B-";
  if (s >= 56) return "C+";
  if (s >= 49) return "C";
  if (s >= 42) return "C-";
  if (s >= 35) return "D+";
  if (s >= 27) return "D";
  if (s >= 19) return "D-";
  return "F";
}

function fmtStars(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function renderCard(a) {
  const card = document.createElement("div");
  card.className = "assess-card";

  // ── Header: repo name + meta chips + expand toggle ──
  const header = document.createElement("div");
  header.className = "card-header";

  const main = document.createElement("div");
  main.className = "card-main";

  const link = document.createElement("a");
  link.className = "card-repo";
  link.href = "https://github.com/" + a.repo;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = a.repo;
  link.addEventListener("click", (e) => e.stopPropagation());

  const chipsRow = document.createElement("div");
  chipsRow.className = "card-chips-row";
  ["★ " + fmtStars(a.stars), a.language].filter(Boolean).forEach((t) => {
    const chip = document.createElement("span");
    chip.className = "card-chip";
    chip.textContent = t;
    chipsRow.appendChild(chip);
  });
  if (a.openssf_score != null) {
    const chip = document.createElement("span");
    chip.className = "card-chip chip-openssf";
    chip.textContent = "OpenSSF " + a.openssf_score + "/10";
    chipsRow.appendChild(chip);
  }
  if (a.incident) {
    const chip = document.createElement("span");
    chip.className = "card-chip chip-incident";
    chip.textContent = "⚠ Incident";
    chipsRow.appendChild(chip);
  }

  main.append(link, chipsRow);

  const expandEl = document.createElement("div");
  expandEl.className = "card-expand";
  expandEl.textContent = "▾";

  header.append(main, expandEl);

  // ── Details: expandable check rows ──
  const details = document.createElement("div");
  details.className = "card-details";
  details.style.display = "none";

  if (a.incident) {
    const row = document.createElement("div");
    row.className = "check-row-sm incident-row";
    const icon = document.createElement("div");
    icon.className = "check-icon-sm";
    icon.textContent = "⚠";
    const name = document.createElement("div");
    name.className = "check-name-sm";
    name.textContent = "Known security incident (last 2 yrs)";
    const pts = document.createElement("div");
    pts.className = "check-pts incident-pts";
    pts.textContent = "−" + a.incident.penalty + " pts";
    row.append(icon, name, pts);
    details.appendChild(row);
  }

  if (a.description) {
    const descRow = document.createElement("div");
    descRow.className = "card-desc-row";
    descRow.textContent = a.description;
    details.appendChild(descRow);
  }

  const displayIds = new Set(DISPLAY_CHECKS.map((c) => c.id));

  // Passing display checks — ✓ with name and pts
  DISPLAY_CHECKS.forEach((c) => {
    if (!a.checks[c.id]) return;
    const row = document.createElement("div");
    row.className = "check-row-sm pass";
    const icon = document.createElement("div");
    icon.className = "check-icon-sm";
    icon.textContent = "✓";
    const name = document.createElement("div");
    name.className = "check-name-sm";
    name.textContent = c.name;
    const pts = document.createElement("div");
    pts.className = "check-pts";
    pts.textContent = c.weight + "/" + c.weight + " pts";
    row.append(icon, name, pts);
    details.appendChild(row);
  });

  if (a.openssf_score != null) {
    const row = document.createElement("div");
    row.className = "check-row-sm openssf-row";
    const icon = document.createElement("div");
    icon.className = "check-icon-sm";
    icon.textContent = "◈";
    const name = document.createElement("div");
    name.className = "check-name-sm";
    name.textContent = "OpenSSF Scorecard";
    const val = document.createElement("div");
    val.className = "check-pts";
    val.textContent =
      a.openssf_score +
      "/10" +
      (a.openssf_date ? "  " + a.openssf_date.slice(0, 10) : "");
    row.append(icon, name, val);
    details.appendChild(row);
  }

  // One grouped lock row for everything else — no individual check names revealed
  const lockRow = document.createElement("div");
  lockRow.className = "check-row-sm check-row-locked";
  const lockIcon = document.createElement("div");
  lockIcon.className = "check-icon-sm";
  lockIcon.textContent = "🔒";
  const lockName = document.createElement("div");
  lockName.className = "check-name-sm";
  lockName.textContent = "Advanced security controls";
  lockRow.append(lockIcon, lockName);
  details.appendChild(lockRow);

  const lockLink = document.createElement("a");
  lockLink.className = "locked-cta";
  lockLink.href =
    "mailto:contact@securelayer.co?subject=" +
    encodeURIComponent("Private Security Report Request") +
    "&body=" +
    encodeURIComponent(
      "Hi,\n\nI am a maintainer / developer working with [repo] and would like to receive the full security assessment.\n\nThank you.",
    );
  lockLink.textContent =
    "See your full security picture — request a private report →";
  lockLink.addEventListener("click", (e) => e.stopPropagation());
  details.appendChild(lockLink);

  // ── Footer bar: dots · date · score (always visible) ──
  const footerBar = document.createElement("div");
  footerBar.className = "card-footer-bar";

  const dateEl = document.createElement("div");
  dateEl.className = "card-date";
  dateEl.textContent = "last assessment " + (a.assessed_at ?? "").slice(0, 7);

  const footerRight = document.createElement("div");
  footerRight.className = "card-footer-right";

  const dots = document.createElement("div");
  dots.className = "card-dots";
  // Dots: green display passes → gray display fails → gray blurred non-display
  const mkDot = (green, blurred, title) => {
    const dot = document.createElement("div");
    dot.className = "card-dot" + (blurred ? " card-dot-locked" : "");
    dot.style.background = green ? "#22c55e" : "#4b5563";
    if (title) dot.title = title;
    return dot;
  };
  DISPLAY_CHECKS.filter((c) => a.checks[c.id]).forEach((c) =>
    dots.appendChild(mkDot(true, false, c.name + ": pass")),
  );
  DISPLAY_CHECKS.filter((c) => !a.checks[c.id]).forEach((c) =>
    dots.appendChild(mkDot(false, false, c.name + ": fail")),
  );
  CHECKS.filter((c) => !displayIds.has(c.id)).forEach(() =>
    dots.appendChild(mkDot(false, true)),
  );

  const scoreEl = document.createElement("div");
  scoreEl.className = "card-score-val";
  scoreEl.textContent = totalScore(a).toFixed(1) + "/100";

  footerRight.append(dots, scoreEl);
  footerBar.append(dateEl, footerRight);

  card.addEventListener("click", () => {
    const open = details.style.display !== "none";
    details.style.display = open ? "none" : "block";
    expandEl.textContent = open ? "▾" : "▴";
    card.classList.toggle("expanded", !open);
  });

  card.append(header, details, footerBar);
  return card;
}

function renderGradeGroup(grade, repos, total) {
  const meta = GRADES[grade];
  const group = document.createElement("div");
  group.className = "grade-group";

  const hdr = document.createElement("div");
  hdr.className = "grade-group-header";

  const letter = document.createElement("div");
  letter.className = "grade-letter";
  letter.style.color = meta.color;
  letter.style.background = meta.bg;
  letter.textContent = grade;

  const label = document.createElement("div");
  label.className = "grade-label";
  label.textContent = meta.label;

  const count = document.createElement("div");
  count.className = "grade-count";
  const pct = Math.round((repos.length / total) * 100);
  count.textContent = pct + "% of scanned repositories";

  hdr.append(letter, label, count);

  const grid = document.createElement("div");
  grid.className = "grade-grid";
  repos.forEach((a) => grid.appendChild(renderCard(a)));

  group.append(hdr, grid);
  return group;
}

// C+ through F collapsed into one section — keeps top performers prominent.
const BELOW_BASELINE = new Set(["C+", "C", "C-", "D+", "D", "D-", "F"]);

function renderBelowBaselineGroup(repos, total) {
  const group = document.createElement("div");
  group.className = "grade-group";

  const hdr = document.createElement("div");
  hdr.className = "grade-group-header";

  const letter = document.createElement("div");
  letter.className = "grade-letter grade-letter-below";
  letter.textContent = "C–F";

  const label = document.createElement("div");
  label.className = "grade-label";
  label.textContent = "Below Security Baseline";

  const count = document.createElement("div");
  count.className = "grade-count";
  const pct = Math.round((repos.length / total) * 100);
  count.textContent = pct + "% of scanned repositories";

  hdr.append(letter, label, count);

  const grid = document.createElement("div");
  grid.className = "grade-grid";
  // sort within the collapsed group by totalScore desc
  repos
    .slice()
    .sort((a, b) => {
      const tA = a.score * 0.9 + (a.openssf_score ?? 0);
      const tB = b.score * 0.9 + (b.openssf_score ?? 0);
      return tB - tA || b.stars - a.stars;
    })
    .forEach((a) => grid.appendChild(renderCard(a)));

  group.append(hdr, grid);
  return group;
}

async function init() {
  const statusEl = document.getElementById("assess-status");
  const bodyEl = document.getElementById("assess-body");

  try {
    const res = await fetch("/api/assessments");
    if (res.status === 404) {
      statusEl.textContent = "No assessments published yet — check back soon.";
      return;
    }
    if (!res.ok) throw new Error();
    const data = await res.json();

    /* group by computed grade (base score + OpenSSF bonus) */
    const groups = {};
    GRADE_ORDER.forEach((g) => (groups[g] = []));
    data.forEach((a) => {
      const g = computeGrade(totalScore(a));
      groups[g].push(a);
    });

    bodyEl.textContent = "";
    const total = data.length;
    const belowRepos = [];
    GRADE_ORDER.forEach((grade) => {
      if (!groups[grade].length) return;
      if (BELOW_BASELINE.has(grade)) {
        belowRepos.push(...groups[grade]);
      } else {
        bodyEl.appendChild(renderGradeGroup(grade, groups[grade], total));
      }
    });
    if (belowRepos.length)
      bodyEl.appendChild(renderBelowBaselineGroup(belowRepos, total));

    statusEl.style.display = "none";
    bodyEl.style.display = "block";
  } catch {
    statusEl.textContent = "Assessments temporarily unavailable.";
  }
}

init();
