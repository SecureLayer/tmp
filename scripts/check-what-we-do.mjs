import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import sirv from "sirv";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const DIST = new URL("../dist/", import.meta.url).pathname;
const DATA = JSON.parse(
  readFileSync(new URL("../src/data/what-we-do.json", import.meta.url), "utf8"),
);
const PORT = 4175;
const PAGE_URL = `http://localhost:${PORT}/what-we-do/`;
const HASHES = [
  "helpinvestors",
  "raisecompanyvalue",
  "helpsecurityteams",
  "secureaiagents",
  "helpafterincident",
  "checkcompliance",
];

const server = await new Promise((resolve) => {
  const s = createServer(sirv(DIST, { single: false }));
  s.listen(PORT, () => resolve(s));
});
const browser = await chromium.launch();
let failed = false;
const pageErrors = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed = true;
  } else {
    console.log(`PASS: ${message}`);
  }
}

async function open(options, hash = "") {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.goto(PAGE_URL + hash, { waitUntil: "networkidle" });
  return { context, page };
}

const activePath = (page) =>
  page.evaluate(
    () => document.querySelector(".wdwd-path.is-active")?.id ?? null,
  );
const activeSlide = (page) =>
  page.evaluate(() => {
    const s = document.querySelector(
      ".wdwd-path.is-active .wdwd-slide.is-active",
    );
    return s ? Number(s.getAttribute("data-index")) : null;
  });
const chooserActive = (page) =>
  page.evaluate(
    () =>
      document
        .getElementById("wdwd-chooser")
        ?.classList.contains("is-active") &&
      !document.querySelector(".wdwd-path.is-active"),
  );
// hashchange is asynchronous, so after any click/back/keypress that changes
// the hash, wait for the state instead of reading it immediately.
const waitFor = (page, fn, arg) =>
  page
    .waitForFunction(fn, arg, { timeout: 2000 })
    .then(() => true)
    .catch(() => false);
const waitChooser = (page) =>
  waitFor(
    page,
    () =>
      document
        .getElementById("wdwd-chooser")
        ?.classList.contains("is-active") &&
      !document.querySelector(".wdwd-path.is-active"),
  );
const waitPath = (page, id) =>
  waitFor(
    page,
    (want) => document.querySelector(".wdwd-path.is-active")?.id === want,
    id,
  );
const overflowX = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

try {
  // --- data shape -------------------------------------------------------
  assert(DATA.doors.length === 6, "data has six doors");
  assert(
    JSON.stringify(DATA.doors.map((d) => d.id).sort()) ===
      JSON.stringify([...HASHES].sort()),
    "door ids are exactly the six agreed deep-link hashes",
  );
  assert(
    DATA.doors.every((d) => d.slides.length === 3),
    "every door has exactly three slides",
  );
  assert(
    DATA.doors.every((d) => /^[a-z]+$/.test(d.id)),
    "door ids are lowercase letters only",
  );

  assert(
    DATA.doors.every(
      (d) =>
        Array.isArray(d.proposals) &&
        d.proposals.length === 3 &&
        d.proposals.every((x) => typeof x === "string" && x.trim().length > 0),
    ),
    "every door has exactly three non-empty proposals",
  );

  // --- the old URL is deliberately NOT redirected (owner decision 2026-10-07)
  {
    const file = new URL("../dist/_redirects", import.meta.url);
    const redirects = existsSync(file) ? readFileSync(file, "utf8") : "";
    assert(
      !/what-do-we-do/.test(redirects),
      "no redirect for the old /what-do-we-do URL ships",
    );
    assert(
      !existsSync(new URL("../dist/what-do-we-do/", import.meta.url)),
      "no page is built at the old /what-do-we-do path",
    );
  }

  // --- first-slide label: owner wording, not "WHAT YOU SEE" ----------------
  {
    const kickers = DATA.doors.map((d) => d.slides[0].kicker);
    assert(
      !kickers.includes("WHAT YOU SEE"),
      'no first slide is labelled "WHAT YOU SEE" any more',
    );
    assert(
      DATA.doors.every(
        (d) =>
          d.slides[0].kicker ===
          (d.id === "helpafterincident" ? "FIRST" : "WHAT YOU NEED TO ADDRESS"),
      ),
      'first slides read "WHAT YOU NEED TO ADDRESS" (the incident path keeps "FIRST")',
    );
  }

  // --- first-slide headings answer the question (owner wording, 2026-10-07) -
  {
    const OLD = [
      "A balance sheet can't show a cyber loss until it happens.",
      "The first time someone asks you to prove your cybersecurity level.",
      "Too many alerts, too few hands.",
      "An agent can be talked into almost anything.",
      "Stop. Don't wipe anything.",
      "New rules turn gaps into liabilities.",
    ];
    const headings = DATA.doors.map((d) => d.slides[0].heading);
    assert(
      OLD.every((h) => !headings.includes(h)),
      "the six old first-slide headings are gone",
    );
    assert(
      DATA.doors.find((d) => d.id === "helpinvestors").slides[0].heading ===
        "Identify risks and prevent cyber loss before it happens.",
      "the investor path uses the owner's heading verbatim",
    );
    assert(
      DATA.doors.every((d) => d.slides.every((sl) => /[.]$/.test(sl.heading))),
      "every slide heading ends with a full stop (house style, slides 1-3)",
    );
  }

  // --- first slide: concrete-work example + "why us"; third slide label -----
  assert(
    typeof DATA.whyUs === "string" &&
      DATA.whyUs ===
        "Our team has 10+ years as experts, with experience across public and private organisations.",
    "data has the owner's 'why us' sentence",
  );
  assert(
    DATA.doors.every(
      (d) =>
        typeof d.slides[1].example === "string" &&
        d.slides[1].example.trim().length > 0 &&
        d.slides[1].body === undefined &&
        d.slides[0].example === undefined &&
        d.slides[2].example === undefined,
    ),
    'every path has its "example of concrete work" on the second slide only (it replaces that slide\'s body)',
  );
  assert(
    DATA.proofLine === undefined && DATA.seenBefore === undefined,
    'the "10+ years as a security expert" line and the "Seen before" row are gone from the data',
  );
  assert(
    DATA.doors.find((d) => d.id === "helpsecurityteams").slides[1].example ===
      "We improve detection and response playbooks, based on real incident work.",
    "the security-team example is the owner's sentence verbatim",
  );
  assert(
    DATA.doors.every((d) => d.slides[2].kicker === "WHAT IT CHANGES FOR YOU"),
    'every third slide is labelled "WHAT IT CHANGES FOR YOU"',
  );

  // --- investor path wording (owner, 2026-10-07) ---------------------------
  {
    const investors = DATA.doors.find((d) => d.id === "helpinvestors");
    assert(
      investors.slides[0].body ===
        "A data leak, a critical vulnerability not fixed: each one lands on the buyer after closing.",
      "investor first slide body uses the owner's wording",
    );
    assert(
      investors.slides[1].example ===
        "We test how the company responds to an incident, not just which policies exist.",
      "investor second slide example uses the owner's wording",
    );
    assert(
      !/ransomware|fraudulent transfer/i.test(investors.slides[0].body),
      "the old risk list (ransomware, fraudulent transfer) is gone from the investor body",
    );
  }

  // --- owner wording round of 2026-10-07 (exact strings) --------------------
  {
    const door = (id) => DATA.doors.find((d) => d.id === id);
    const want = [
      [
        door("raisecompanyvalue").slides[1].example,
        "We perform a practical review of what attackers and due-diligence teams would find, then we provide a short fix list in priority order.",
        "founders: second slide example",
      ],
      [
        door("helpsecurityteams").slides[2].body,
        "Clear owners, tested runbooks and fewer surprises.",
        "security teams: third slide body",
      ],
      [
        door("secureaiagents").slides[1].example,
        "Test input path, permissions to understand what an attacker can gain.",
        "AI agents: second slide example",
      ],
      [
        door("helpafterincident").slides[0].body,
        "Act quickly and efficiently.",
        "incident: first slide body",
      ],
      [
        door("helpafterincident").slides[1].example,
        "Isolate the affected machines from the network, keep them powered and write down what you saw and when.",
        "incident: second slide example",
      ],
      [
        door("checkcompliance").slides[1].example,
        "We identify what applies to your business, what is already done and what to do first.",
        "compliance: second slide example",
      ],
    ];
    for (const [got, exp, label] of want)
      assert(got === exp, `${label} uses the owner's wording`);
  }

  // --- no JavaScript: everything stacked and readable --------------------
  {
    const { context, page } = await open({ javaScriptEnabled: false });
    const paths = page.locator(".wdwd-path");
    assert((await paths.count()) === 6, "no-JS: six paths in the page");
    let allVisible = true;
    for (let i = 0; i < 6; i++)
      allVisible = allVisible && (await paths.nth(i).isVisible());
    assert(allVisible, "no-JS: every path is visible");
    assert(
      (await page.locator(".wdwd-slide").count()) === 18,
      "no-JS: 18 slides rendered",
    );
    assert(
      (await page
        .locator('a.wdwd-cta[href="https://cal.com/securelayer"]')
        .count()) === 6,
      "no-JS: one call button per path",
    );
    assert(
      (await page.locator("a.wdwd-door").count()) === 6,
      "no-JS: six chooser links",
    );
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert(
      !/10\+ years as a security expert/i.test(bodyText) &&
        !/seen before/i.test(bodyText),
      'the page no longer shows the "security expert" line or "Seen before"',
    );
    assert(
      (await page.evaluate(() =>
        document.documentElement.classList.contains("wdwd-js"),
      )) === false,
      "no-JS: wdwd-js class is absent",
    );
    await context.close();
  }

  // --- no JavaScript + deep link lands on that section (Review Focus 5) ---
  {
    const { context, page } = await open(
      { javaScriptEnabled: false },
      "#helpafterincident",
    );
    const measure = () =>
      page.evaluate(() => {
        const r = document
          .getElementById("helpafterincident")
          .getBoundingClientRect();
        return {
          top: Math.round(r.top),
          scrollY: Math.round(window.scrollY),
          docHeight: document.documentElement.scrollHeight,
          innerHeight: window.innerHeight,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        };
      });
    const first = await measure();
    // diagnostics only (does not change the result): did the section move after
    // the first measurement, e.g. a late font swap shifting the content above it?
    await page.waitForTimeout(1500);
    const later = await measure();
    // The browser scrolls to the anchor while the page still uses fallback fonts; when
    // the web fonts arrive the content above shrinks and the section ends up a little
    // above the viewport top (CI/Linux measured -55px). Landing within DRIFT px of the
    // section's top edge, with the section on screen, still counts as "scrolled to it".
    const DRIFT = 150;
    const inView = first.top >= -DRIFT && first.top < first.innerHeight;
    assert(
      inView,
      `no-JS: deep link scrolls to its path section (top ${first.top}, scrollY ${first.scrollY}, page ${first.docHeight}px, viewport ${first.viewport}; 1.5s later: top ${later.top}, scrollY ${later.scrollY}, page ${later.docHeight}px)`,
    );
    await context.close();
  }

  // --- chooser is the default; unknown/empty/malformed hashes ------------
  for (const hash of ["", "#nonsense", "#wdwd-chooser", "#%E0%A4%A"]) {
    const { context, page } = await open({}, hash);
    assert(
      (await chooserActive(page)) === true,
      `hash "${hash}" shows the chooser`,
    );
    assert(
      await page.evaluate(() =>
        document.documentElement.classList.contains("wdwd-js"),
      ),
      `hash "${hash}": deck is enhanced`,
    );
    await context.close();
  }

  // --- each box answers the question with its three proposals -----------
  {
    const { context, page } = await open({});
    for (const door of DATA.doors) {
      const link = page.locator(`a.wdwd-door[href="#${door.id}"]`);
      const items = await link.locator("li").allTextContents();
      assert(
        JSON.stringify(items.map((t) => t.trim())) ===
          JSON.stringify(door.proposals),
        `#${door.id}: the box lists its three proposals in order`,
      );
      assert(
        (await page
          .getByRole("link", { name: door.label, exact: true })
          .count()) === 1,
        `#${door.id}: the link's accessible name is just its label`,
      );
      const described = await link.evaluate((el) => {
        const node = document.getElementById(
          el.getAttribute("aria-describedby") ?? "",
        );
        return node ? node.textContent : "";
      });
      assert(
        door.proposals.every((x) => described.includes(x)),
        `#${door.id}: the proposals are the link's description for screen readers`,
      );
    }
    await context.close();
  }

  // --- the longer boxes fit on any phone, with JavaScript on and off -----
  for (const width of [360, 390, 430]) {
    for (const js of [true, false]) {
      const { context, page } = await open({
        viewport: { width, height: 844 },
        javaScriptEnabled: js,
      });
      const clipped = await page.$$eval(
        "a.wdwd-door",
        (as) => as.filter((a) => a.scrollWidth > a.clientWidth + 1).length,
      );
      assert(
        (await overflowX(page)) <= 0 && clipped === 0,
        `${width}px${js ? "" : " (no JS)"}: chooser boxes fit, nothing overflows or is clipped`,
      );
      await context.close();
    }
  }

  // --- with a path open, the card is as tall as that path, not as the chooser
  //     (the hidden chooser is the tallest section on phones)
  for (const width of [360, 390, 430]) {
    const { context, page } = await open(
      { viewport: { width, height: 844 }, hasTouch: true, isMobile: true },
      "#helpinvestors",
    );
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => ({
      stage: document.getElementById("wdwd-stage").getBoundingClientRect()
        .height,
      nextBottom: document.querySelector(".wdwd-next").getBoundingClientRect()
        .bottom,
      vh: window.innerHeight,
    }));
    assert(
      m.stage <= 760 && m.nextBottom <= m.vh,
      `${width}px: with a path open the card stays compact and the arrows are on screen (card ${Math.round(m.stage)}px, arrows end at ${Math.round(m.nextBottom)}px of ${m.vh}px)`,
    );
    await context.close();
  }

  // --- navigating must never scroll the card sideways (text stays inside its
  //     padding): scrolling the new heading into view runs while the slide is
  //     still sliding in from the right
  for (const width of [360, 390, 430, 1280]) {
    const { context, page } = await open({
      viewport: { width, height: width > 700 ? 760 : 780 },
      hasTouch: width < 700,
      isMobile: width < 700,
    });
    await page.locator('a.wdwd-door[href="#raisecompanyvalue"]').click();
    await page.waitForTimeout(900);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const stage = document.getElementById("wdwd-stage");
      const h = document
        .querySelector(".wdwd-path.is-active .wdwd-slide.is-active h3")
        .getBoundingClientRect();
      return {
        scrollLeft: stage.scrollLeft,
        inset: h.left - stage.getBoundingClientRect().left,
      };
    });
    assert(
      m.scrollLeft === 0 && m.inset >= 15,
      `${width}px: after a door click and Next the card is not scrolled sideways (scrollLeft ${m.scrollLeft}, text ${Math.round(m.inset)}px from the card edge)`,
    );
    // "Change my answer" is an anchor jump to the chooser, which is still sliding in
    // from the right: it used to scroll the card ~17px sideways (chooser off-centre)
    await page.locator(".wdwd-path.is-active .wdwd-again").click();
    await page.waitForTimeout(900);
    const back = await page.evaluate(() => {
      const stage = document.getElementById("wdwd-stage");
      const chooser = document.getElementById("wdwd-chooser");
      return {
        scrollLeft: stage.scrollLeft,
        offset: Math.round(
          chooser.getBoundingClientRect().left -
            stage.getBoundingClientRect().left,
        ),
      };
    });
    assert(
      back.scrollLeft === 0 && back.offset === 0,
      `${width}px: back on the chooser via "Change my answer" it is centred, not scrolled sideways (scrollLeft ${back.scrollLeft}, offset ${back.offset}px)`,
    );
    await context.close();
  }

  // --- the new blocks are on screen, second slide only ----------------------
  {
    const { context, page } = await open({ javaScriptEnabled: false });
    for (const door of DATA.doors) {
      const second = page.locator(`#${door.id} .wdwd-slide[data-index="1"]`);
      const blocks = await second
        .locator(".wdwd-extra")
        .evaluateAll((els) => els.map((e) => e.innerText));
      // the labels are upper-cased by CSS, so compare case-insensitively
      const flat = blocks.map((t) =>
        t.replace(/\s+/g, " ").trim().toLowerCase(),
      );
      assert(
        flat.length === 2 &&
          flat[0] ===
            `Example of concrete work ${door.slides[1].example}`.toLowerCase() &&
          flat[1] === `Why us ${DATA.whyUs}`.toLowerCase(),
        `#${door.id}: second slide shows "Example of concrete work" then "Why us" with the data text`,
      );
      assert(
        (await page
          .locator(`#${door.id} .wdwd-slide:not([data-index="1"]) .wdwd-extra`)
          .count()) === 0,
        `#${door.id}: the two blocks appear on the second slide only`,
      );
      assert(
        (await second.locator(".wdwd-body").count()) === 0,
        `#${door.id}: the second slide has no separate body line (the example replaces it)`,
      );
      assert(
        (
          await page
            .locator(`#${door.id} .wdwd-slide[data-index="2"] .wdwd-k`)
            .first()
            .textContent()
        ).trim() === "WHAT IT CHANGES FOR YOU",
        `#${door.id}: third slide label reads "WHAT IT CHANGES FOR YOU"`,
      );
    }
    await context.close();
  }

  // --- first slides stay inside the card on every phone, all six paths -----
  for (const width of [360, 390, 430]) {
    for (const door of DATA.doors) {
      const { context, page } = await open(
        { viewport: { width, height: 844 }, hasTouch: true, isMobile: true },
        `#${door.id}`,
      );
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => ({
        over: document.documentElement.scrollWidth - window.innerWidth,
        stage: document.getElementById("wdwd-stage").getBoundingClientRect()
          .height,
        nextBottom: document.querySelector(".wdwd-next").getBoundingClientRect()
          .bottom,
        vh: window.innerHeight,
      }));
      assert(
        m.over <= 0 && m.stage <= 800 && m.nextBottom <= m.vh,
        `${width}px #${door.id}: first slide fits (card ${Math.round(m.stage)}px, arrows end ${Math.round(m.nextBottom)}/${m.vh}px)`,
      );
      await context.close();
    }
  }

  // --- second slides stay inside the card on every phone, all six paths -----
  for (const width of [360, 390, 430]) {
    for (const door of DATA.doors) {
      const { context, page } = await open(
        { viewport: { width, height: 844 }, hasTouch: true, isMobile: true },
        `#${door.id}`,
      );
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(900);
      const m = await page.evaluate(() => ({
        over: document.documentElement.scrollWidth - window.innerWidth,
        stage: document.getElementById("wdwd-stage").getBoundingClientRect()
          .height,
        nextBottom: document.querySelector(".wdwd-next").getBoundingClientRect()
          .bottom,
        vh: window.innerHeight,
      }));
      assert(
        m.over <= 0 && m.stage <= 800 && m.nextBottom <= m.vh,
        `${width}px #${door.id}: second slide fits (card ${Math.round(m.stage)}px, arrows end ${Math.round(m.nextBottom)}/${m.vh}px)`,
      );
      await context.close();
    }
  }

  // --- phones: readable text, and every slide fits one screen (no scrolling) -
  //     sizes are the visible page area of real phones (browser bars removed)
  for (const [width, height] of [
    [360, 640],
    [360, 732],
    [390, 780],
    [412, 820],
    [430, 860],
  ]) {
    const { context, page } = await open({
      viewport: { width, height },
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
    });
    const problems = [];
    let worst = { heading: 999, body: 999 };
    for (const door of DATA.doors) {
      await page.goto(`${PAGE_URL}#${door.id}`, { waitUntil: "networkidle" });
      await page.reload({ waitUntil: "networkidle" });
      for (let slide = 0; slide < 3; slide++) {
        if (slide > 0) await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(650);
        const m = await page.evaluate(() => {
          const sl = document.querySelector(
            ".wdwd-path.is-active .wdwd-slide.is-active",
          );
          const fs = (sel) => {
            const e = sl.querySelector(sel);
            return e ? parseFloat(getComputedStyle(e).fontSize) : null;
          };
          return {
            scrollH: document.documentElement.scrollHeight,
            vh: window.innerHeight,
            over: document.documentElement.scrollWidth - window.innerWidth,
            nextBottom: document
              .querySelector(".wdwd-next")
              .getBoundingClientRect().bottom,
            heading: fs("h3"),
            body: fs(".wdwd-body") ?? fs(".wdwd-extra p:last-child"),
            kicker: fs(".wdwd-k"),
            clipped: [...sl.querySelectorAll("h3, p")].some(
              (e) =>
                e.getBoundingClientRect().bottom >
                document.getElementById("wdwd-stage").getBoundingClientRect()
                  .bottom,
            ),
          };
        });
        const tag = `${door.id}#${slide + 1}`;
        if (m.scrollH > m.vh + 1)
          problems.push(`${tag} needs scrolling (${m.scrollH}>${m.vh})`);
        if (m.over > 0) problems.push(`${tag} overflows sideways`);
        if (m.nextBottom > m.vh) problems.push(`${tag} arrows off screen`);
        if (m.clipped) problems.push(`${tag} text clipped by the card`);
        worst.heading = Math.min(worst.heading, m.heading);
        worst.body = Math.min(worst.body, m.body);
        if (width === 360 && height >= 700) {
          if (m.heading < 28)
            problems.push(`${tag} heading ${m.heading}px < 28px`);
          if (m.body < 16) problems.push(`${tag} body ${m.body}px < 16px`);
          if (m.kicker < 12) problems.push(`${tag} label ${m.kicker}px < 12px`);
        }
      }
    }
    assert(
      problems.length === 0,
      `${width}x${height}: all 18 slides fit one screen with readable text (smallest heading ${worst.heading}px, body ${worst.body}px)${problems.length ? " — " + problems.slice(0, 4).join("; ") : ""}`,
    );
    await context.close();
  }

  // --- every deep link opens its path at slide 0 -------------------------
  for (const id of HASHES) {
    const { context, page } = await open({}, `#${id}`);
    assert((await activePath(page)) === id, `#${id} opens its path`);
    assert((await activeSlide(page)) === 0, `#${id} starts on slide 1`);
    await context.close();
  }

  // --- case-insensitive hash (Review Focus 1) ----------------------------
  {
    const { context, page } = await open({}, "#HelpInvestors");
    assert(
      (await activePath(page)) === "helpinvestors",
      "#HelpInvestors opens the investor path",
    );
    await context.close();
  }

  // --- click, keyboard, clamp, live region, focus ------------------------
  {
    const { context, page } = await open({});
    await page.locator('a.wdwd-door[href="#helpinvestors"]').click();
    assert(await waitPath(page, "helpinvestors"), "click opens the path");
    await page.keyboard.press("ArrowRight");
    assert((await activeSlide(page)) === 1, "ArrowRight goes to slide 2");
    assert(
      /Slide 3 of 4/.test(await page.locator("#wdwd-live").textContent()),
      "live region announces the new slide",
    );
    assert(
      (await page.evaluate(() => document.activeElement?.tagName)) === "H3",
      "focus moves to the new slide heading",
    );
    assert(
      (await page.evaluate(
        () => getComputedStyle(document.activeElement).outlineStyle,
      )) === "none",
      "programmatically focused heading shows no focus box",
    );
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    assert(
      (await activeSlide(page)) === 2,
      "extra ArrowRight presses clamp at the last slide",
    );
    assert(
      await page.locator(".wdwd-path.is-active a.wdwd-cta").isVisible(),
      "call button is visible on the last slide",
    );
    await page.keyboard.press("ArrowLeft");
    assert((await activeSlide(page)) === 1, "ArrowLeft goes back one slide");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    assert(
      await waitChooser(page),
      "ArrowLeft from the first slide returns to the chooser",
    );
    await context.close();
  }

  // --- Back button (Review Focus 2) and "Change my answer" ---------------
  {
    const { context, page } = await open({});
    await page.locator('a.wdwd-door[href="#helpafterincident"]').click();
    assert(await waitPath(page, "helpafterincident"), "door opens");
    await page.goBack();
    assert(await waitChooser(page), "browser Back returns to the chooser");
    await page.waitForTimeout(700);
    assert(
      (await page.locator(".wdwd-slide:visible").count()) === 0,
      "after Back no slide of the previous path stays visible",
    );
    await page.locator('a.wdwd-door[href="#checkcompliance"]').click();
    assert(await waitPath(page, "checkcompliance"), "second door opens");
    await page.locator(".wdwd-path.is-active .wdwd-again").click();
    assert(
      await waitChooser(page),
      '"Change my answer" returns to the chooser',
    );
    await context.close();
  }

  // --- keyboard-only door selection --------------------------------------
  {
    const { context, page } = await open({});
    await page.locator("a.wdwd-door").first().focus();
    await page.keyboard.press("Enter");
    assert(
      await waitPath(page, DATA.doors[0].id),
      "Enter on a focused door opens its path",
    );
    await context.close();
  }

  // --- reduced motion ----------------------------------------------------
  {
    const { context, page } = await open({ reducedMotion: "reduce" });
    await page.locator("a.wdwd-door").first().click();
    await waitPath(page, DATA.doors[0].id);
    const duration = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".wdwd-path.is-active"))
          .transitionDuration,
    );
    assert(duration === "0s", "reduced motion removes slide transitions");
    await context.close();
  }

  // --- mobile: no horizontal overflow on any path's last slide -----------
  {
    const { context, page } = await open({
      viewport: { width: 390, height: 844 },
    });
    assert(
      (await overflowX(page)) <= 0,
      "390px: chooser has no horizontal overflow",
    );
    for (const id of HASHES) {
      await page.goto(`${PAGE_URL}#${id}`, { waitUntil: "networkidle" });
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      const ok = (await overflowX(page)) <= 0;
      const ctaRight = await page.evaluate(
        () =>
          document
            .querySelector(".wdwd-path.is-active a.wdwd-cta")
            ?.getBoundingClientRect().right ?? 0,
      );
      assert(ok && ctaRight <= 390, `390px: #${id} last slide fits the screen`);
    }
    await context.close();
  }

  // --- resize mid-deck (Review Focus 4) ----------------------------------
  {
    const { context, page } = await open(
      { viewport: { width: 1280, height: 760 } },
      "#helpinvestors",
    );
    await page.keyboard.press("ArrowRight");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    assert(
      await page
        .locator(".wdwd-path.is-active .wdwd-slide.is-active")
        .isVisible(),
      "resize: active slide stays visible",
    );
    assert((await overflowX(page)) <= 0, "resize: no horizontal overflow");
    await context.close();
  }

  // --- short screen: Next must leave the new heading on screen ----------
  {
    const { context, page } = await open(
      { viewport: { width: 844, height: 390 } },
      "#helpinvestors",
    );
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator(".wdwd-next").click();
    await page.waitForTimeout(600);
    const box = await page.evaluate(() => {
      const r = document
        .querySelector(".wdwd-path.is-active .wdwd-slide.is-active h3")
        .getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
    });
    assert(
      box.top >= -1 && box.bottom <= box.vh + 1,
      "short screen: heading is on screen after pressing Next",
    );
    await context.close();
  }

  // --- the page links out to home, security, environment, legal, source --
  for (const [label, js] of [
    ["deck", true],
    ["stacked", false],
  ]) {
    const { context, page } = await open({ javaScriptEnabled: js });
    for (const href of [
      "/",
      "/security/",
      "/sustainability/",
      "/legal/",
      "https://github.com/SecureLayer/landing",
    ]) {
      assert(
        await page.locator(`footer a[href="${href}"]`).isVisible(),
        `${label} view: footer links to ${href}`,
      );
    }
    await context.close();
  }

  // --- homepage: one shortcut to this page, desktop and mobile ----------
  {
    const home = async (options) => {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      page.on("pageerror", (e) => pageErrors.push(e.message));
      await page.goto(`http://localhost:${PORT}/`, {
        waitUntil: "networkidle",
      });
      return { context, page };
    };

    const d = await home({ viewport: { width: 1440, height: 900 } });
    await d.page.locator(".d-lock-input").focus();
    await d.page.keyboard.press("Enter");
    await d.page.waitForTimeout(2200);
    const icon = d.page.locator("a.widget-file");
    assert((await icon.count()) === 1, "desktop: exactly one file shortcut");
    assert(
      (await icon.first().getAttribute("href")) === "/what-we-do/",
      "desktop: the shortcut points to /what-we-do/",
    );
    assert(
      (await icon.first().getAttribute("target")) === null,
      "desktop: the shortcut opens in the same tab",
    );
    assert(
      (await icon.first().locator("span").textContent())?.trim() ===
        "What we do",
      'desktop: the shortcut is labelled "What we do"',
    );
    assert(await icon.first().isVisible(), "desktop: the shortcut is visible");
    assert(
      (await d.page.locator('a[href$=".pdf"]').count()) === 0,
      "desktop: nothing on the homepage links to a PDF",
    );
    // the cleanup of the old PDF icons must not take other widgets' CSS with it
    assert(
      (await d.page.evaluate(
        () => getComputedStyle(document.querySelector(".widget-note")).width,
      )) === "265px",
      "desktop: the sticky note keeps its styling",
    );
    assert(
      (await d.page.evaluate(
        () =>
          getComputedStyle(document.querySelector(".widget-todo-item")).display,
      )) === "flex",
      "desktop: the Reminders list keeps its styling",
    );
    await d.context.close();

    const m = await home({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    await m.page.locator("#mStand").click();
    await m.page.waitForTimeout(1800);
    const card = m.page.locator("a.m-card-file");
    assert((await card.count()) === 1, "mobile: exactly one file card");
    assert(
      (await card.first().getAttribute("href")) === "/what-we-do/",
      "mobile: the card points to /what-we-do/",
    );
    assert(
      (await card.first().getAttribute("target")) === null,
      "mobile: the card opens in the same tab",
    );
    assert(
      (await m.page.locator(".m-card-file-bar").count()) === 0,
      "mobile: the card has no bar under the label",
    );
    assert(
      (await card.first().locator("h3").textContent())?.trim() ===
        "What we do" &&
        (await card.first().locator("p").textContent())?.trim() ===
          "What do you need from cyber? - As a investor, a ceo, an ai specialist?",
      'mobile: the card says "What we do" and asks what you need from cyber',
    );
    assert(await card.first().isVisible(), "mobile: the card is visible");
    assert(
      (await m.page.locator('a[href$=".pdf"]').count()) === 0,
      "mobile: nothing on the homepage links to a PDF",
    );
    await m.context.close();

    // the card and the security tile share one row as equal halves (12px gap),
    // the same height (at least 158px, they grow with their text), on any phone
    for (const width of [360, 390, 430]) {
      const phone = await home({
        viewport: { width, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      await phone.page.locator("#mStand").click();
      await phone.page.waitForTimeout(1800);
      const row = await phone.page.locator(".m-row2").boundingBox();
      const sec = await phone.page.locator("a.m-card-sec").boundingBox();
      const file = await phone.page.locator("a.m-card-file").boundingBox();
      assert(
        Math.abs(file.x - row.x) <= 1 &&
          Math.abs(file.x + file.width + 12 - sec.x) <= 1 &&
          Math.abs(file.width - sec.width) <= 1 &&
          Math.abs(sec.x + sec.width - (row.x + row.width)) <= 1 &&
          Math.abs(sec.height - file.height) <= 1 &&
          file.height >= 157,
        `${width}px: the card and the security tile are equal halves of one row, same height (at least 158px) (${Math.round(file.width)}x${Math.round(file.height)} + ${Math.round(sec.width)}x${Math.round(sec.height)} in ${Math.round(row.width)})`,
      );
      await phone.context.close();
    }
  }

  // --- broken markup falls back to the stacked page ----------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await page.route(PAGE_URL, async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        'id="wdwd-chooser"',
        'id="wdwd-broken"',
      );
      await route.fulfill({ response, body });
    });
    await page.goto(PAGE_URL, { waitUntil: "networkidle" });
    assert(
      (await page.evaluate(() =>
        document.documentElement.classList.contains("wdwd-js"),
      )) === false,
      "script failure removes wdwd-js",
    );
    let visible = 0;
    for (let i = 0; i < 6; i++)
      if (await page.locator(".wdwd-path").nth(i).isVisible()) visible++;
    assert(visible === 6, "script failure leaves all six paths visible");
    await context.close();
  }

  // --- axe: chooser, a deck slide, and the no-JS view --------------------
  async function axeFail(page, label) {
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    assert(
      serious.length === 0,
      `axe: ${label} has no serious/critical violations`,
    );
    for (const v of serious) console.error(`  ${v.id}: ${v.help}`);
  }
  {
    const a = await open({});
    await a.page.waitForTimeout(700);
    await axeFail(a.page, "chooser");
    assert(
      (await a.page.getByRole("heading", { level: 1 }).count()) === 1,
      "chooser state exposes exactly one h1",
    );
    await a.context.close();
    const f = await open({}, "#helpinvestors");
    await f.page.keyboard.press("ArrowRight");
    await f.page.waitForTimeout(900);
    await axeFail(f.page, "investor second slide (with the new blocks)");
    await f.context.close();
    const b = await open({}, "#helpinvestors");
    await b.page.keyboard.press("ArrowRight");
    await b.page.keyboard.press("ArrowRight");
    // let the slide transition finish so axe does not read half-faded colours
    await b.page.waitForTimeout(700);
    await axeFail(b.page, "investor last slide");
    assert(
      (await b.page.getByRole("heading", { level: 1 }).count()) === 1,
      "path state exposes exactly one h1",
    );
    await b.context.close();
    // axe cannot run with JavaScript disabled, so block only the deck script
    const c = await browser.newContext();
    const cp = await c.newPage();
    await cp.route("**/scripts/what-we-do.js", (r) => r.abort());
    await cp.goto(PAGE_URL, { waitUntil: "networkidle" });
    await axeFail(cp, "stacked view (deck script blocked)");
    await c.close();
  }

  // --- homepage on phones: lock screen, boxes and the Pro Tips one-liner -----
  {
    const TIPS = JSON.parse(
      readFileSync(
        new URL("../src/data/pro-tips.json", import.meta.url),
        "utf8",
      ),
    );
    const plain = (t) => t.replace(/\*/g, "");
    const phone = async (options = {}) => {
      const context = await browser.newContext({
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
        ...options,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => pageErrors.push(e.message));
      await page.goto(`http://localhost:${PORT}/`, {
        waitUntil: "networkidle",
      });
      return { context, page };
    };

    const lock = await phone();
    assert(
      (await lock.page.locator(".m-stand-stat-tags").count()) === 0 &&
        !/AppSec/.test(await lock.page.locator("#mStand").innerText()),
      'phone lock screen: the "DevOps / IT / AppSec" line is gone',
    );
    await lock.page.locator("#mStand").click();
    await lock.page.waitForTimeout(1800);
    const titles = await lock.page.locator(".m-card h3").allInnerTexts();
    assert(
      titles.includes("Check our environmental impact") &&
        !titles.includes("Check our impact"),
      'phone: the impact box is titled "Check our environmental impact"',
    );
    const social = await lock.page.evaluate(() => {
      const card = document.querySelector(".m-card-social");
      const note = card.querySelector(".m-card-social-note");
      const icons = card.querySelector(".m-icon-row");
      return {
        noteBeforeIcons: !!(
          note &&
          icons &&
          note.compareDocumentPosition(icons) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
        gap: Math.round(
          icons.getBoundingClientRect().top -
            note.getBoundingClientRect().bottom,
        ),
      };
    });
    assert(
      social.noteBeforeIcons && social.gap >= 8,
      `phone: the social media box shows its text before the icons (gap ${social.gap}px)`,
    );

    // tips: one at a time, from src/data/pro-tips.json, each on a single line
    const tipState = () =>
      lock.page.evaluate(() => {
        const tips = [...document.querySelectorAll(".m-tip")];
        const room = document.querySelector(".m-tips").clientWidth;
        return {
          rotating: document
            .getElementById("mProTips")
            .classList.contains("is-rotating"),
          texts: tips.map((t) => t.textContent.trim()),
          on: tips
            .filter((t) => t.classList.contains("is-on"))
            .map((t) => t.textContent.trim()),
          oneLine: tips.every((t) => t.scrollWidth <= room + 1),
          bigger: parseFloat(getComputedStyle(tips[0]).fontSize) >= 17,
        };
      });
    const t0 = await tipState();
    assert(
      JSON.stringify(t0.texts) === JSON.stringify(TIPS.tips.map(plain)),
      `phone: the tips shown are the ones in pro-tips.json (${t0.texts.length})`,
    );
    assert(
      t0.rotating && t0.on.length === 1 && t0.oneLine && t0.bigger,
      "phone: one tip at a time, each on one line, in a bigger size",
    );
    const seen = new Set(t0.on);
    for (let i = 0; i < TIPS.tips.length * 2; i++) {
      await lock.page.waitForTimeout(TIPS.seconds * 1000 + 100);
      (await tipState()).on.forEach((t) => seen.add(t));
    }
    assert(
      seen.size === TIPS.tips.length,
      `phone: the tips rotate through all ${TIPS.tips.length} of them (${seen.size} seen)`,
    );
    await lock.context.close();

    const calm = await phone({ reducedMotion: "reduce" });
    await calm.page.locator("#mStand").click();
    await calm.page.waitForTimeout(1800);
    const still = await calm.page.evaluate(() => ({
      rotating: document
        .getElementById("mProTips")
        .classList.contains("is-rotating"),
      visible: [...document.querySelectorAll(".m-tip")].every(
        (t) => getComputedStyle(t).opacity === "1",
      ),
    }));
    assert(
      !still.rotating && still.visible,
      "phone, reduced motion: the tips stay still, all visible",
    );
    await calm.context.close();

    const noJs = await phone({ javaScriptEnabled: false });
    assert(
      (await noJs.page.locator(".m-tip").count()) === TIPS.tips.length,
      "phone, no JavaScript: all the tips are in the page",
    );
    await noJs.context.close();
  }

  // --- /security: the three questions look like the section titles ----------
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/security/`, {
      waitUntil: "networkidle",
    });
    const look = await page.evaluate(() => {
      const css = (e) => {
        const c = getComputedStyle(e);
        return [
          c.fontSize,
          c.fontWeight,
          c.letterSpacing,
          c.textTransform,
        ].join(" / ");
      };
      return {
        title: css(document.querySelector(".section-title")),
        questions: [...document.querySelectorAll(".m-cat-question")].map(css),
      };
    });
    assert(
      look.questions.length === 3 &&
        look.questions.every((q) => q === look.title),
      `/security: the 3 questions use the section-title font (${look.title})`,
    );
    await context.close();
  }

  assert(
    pageErrors.length === 0,
    `no uncaught page errors (${pageErrors.join("; ")})`,
  );
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  process.exit(1);
} else {
  console.log("What-we-do page check: all checks passed");
}
