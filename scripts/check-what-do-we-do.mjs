import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import sirv from "sirv";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const DIST = new URL("../dist/", import.meta.url).pathname;
const DATA = JSON.parse(
  readFileSync(
    new URL("../src/data/what-do-we-do.json", import.meta.url),
    "utf8",
  ),
);
const PORT = 4175;
const PAGE_URL = `http://localhost:${PORT}/what-do-we-do/`;
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
    assert(
      (await page.getByText(DATA.proofLine).count()) === 6,
      "no-JS: proof line appears once per path",
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
    const inView = await page.evaluate(() => {
      const r = document
        .getElementById("helpafterincident")
        .getBoundingClientRect();
      return r.top >= -2 && r.top < window.innerHeight;
    });
    assert(inView, "no-JS: deep link scrolls to its path section");
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

  // --- the page links out to home, legal and privacy ---------------------
  for (const [label, js] of [
    ["deck", true],
    ["stacked", false],
  ]) {
    const { context, page } = await open({ javaScriptEnabled: js });
    for (const href of ["/", "/legal/", "/privacy/"]) {
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
      (await icon.first().getAttribute("href")) === "/what-do-we-do/",
      "desktop: the shortcut points to /what-do-we-do/",
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
      (await card.first().getAttribute("href")) === "/what-do-we-do/",
      "mobile: the card points to /what-do-we-do/",
    );
    assert(
      (await card.first().getAttribute("target")) === null,
      "mobile: the card opens in the same tab",
    );
    assert(
      (await card.first().locator(".m-card-file-bar").textContent())?.trim() ===
        "See what we do",
      'mobile: the card bar reads "See what we do"',
    );
    assert(await card.first().isVisible(), "mobile: the card is visible");
    assert(
      (await m.page.locator('a[href$=".pdf"]').count()) === 0,
      "mobile: nothing on the homepage links to a PDF",
    );
    await m.context.close();
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
    await cp.route("**/scripts/what-do-we-do.js", (r) => r.abort());
    await cp.goto(PAGE_URL, { waitUntil: "networkidle" });
    await axeFail(cp, "stacked view (deck script blocked)");
    await c.close();
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
  console.log("What-do-we-do page check: all checks passed");
}
