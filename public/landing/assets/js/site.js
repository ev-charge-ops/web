(() => {
  const body = document.body;
  const story = document.querySelector(".story");
  const steps = [...document.querySelectorAll(".step")];
  const app = document.getElementById("app");
  const bgs = Object.fromEntries(
    [...document.querySelectorAll(".bg")].map((el) => [el.dataset.bg, el]),
  );
  const progressBar = document.querySelector(".progress");
  const counter = document.querySelector("[data-count]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  Object.values(bgs).forEach((el) => {
    const v = el.querySelector("video");
    const miss = () => el.classList.add("missing");
    const last = [...v.querySelectorAll("source")].pop();
    if (v.networkState === 3) miss();
    (last || v).addEventListener("error", miss, { once: true });
  });

  const ranges = steps.map((s) =>
    (s.dataset.t || "0,0").split(",").map(Number),
  );
  let active = -1;
  let targetTime = ranges[0][0];
  let shownTime = targetTime;
  let syncedScroll = -1;

  function setActive(i) {
    if (i === active) return;
    active = i;
    const s = steps[i];
    body.classList.toggle("is-dark", s.dataset.theme === "dark");
    body.classList.toggle("side-left", s.classList.contains("side-left"));
    body.classList.toggle("side-right", s.classList.contains("side-right"));
    body.classList.toggle("at-hero", s.classList.contains("step-hero"));
    body.classList.toggle("ring-on", !!s.dataset.ring);
    body.classList.toggle("amber", s.dataset.bg === "amber");
    body.classList.toggle("is-portal", !!s.dataset.portal);
    Object.entries(bgs).forEach(([k, el]) => {
      const on = k === s.dataset.bg;
      el.classList.toggle("on", on);
      const v = el.querySelector("video");
      if (!on) v.pause();
      else if (!reduce) v.play().catch(() => {});
    });
    if (s.dataset.portal && counter && !counter.dataset.done) countUp(counter);
  }

  function countUp(el) {
    el.dataset.done = "1";
    const end = parseFloat(el.dataset.count);
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1100, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(1).replace(".", ",");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function onScroll() {
    syncedScroll = scrollY;
    const vh = innerHeight;
    let idx = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < vh * 0.55) idx = i;
    });
    const storyBottom = story.getBoundingClientRect().bottom;
    body.style.setProperty("--lift", `${Math.min(0, storyBottom - vh)}px`);
    const storyOut = storyBottom < vh * 0.25;
    steps.forEach((s, i) => s.classList.toggle("in", i === idx && !storyOut));
    if (storyOut) {
      body.classList.remove("is-dark");
      Object.values(bgs).forEach((el) => el.querySelector("video").pause());
      active = -1;
    } else setActive(idx);

    const s = steps[idx];
    const r = s.getBoundingClientRect();
    const local = Math.min(
      Math.max(
        idx === 0 ? scrollY / r.height : (vh * 0.55 - r.top) / r.height,
        0,
      ),
      1,
    );
    const [t0, t1] = ranges[idx];
    targetTime = t0 + (t1 - t0) * local;

    if (s.dataset.ring)
      body.style.setProperty(
        "--ring",
        s.dataset.bg === "amber" ? 1 : (0.15 + local * 0.65).toFixed(3),
      );
    const sr = story.getBoundingClientRect();
    const p = Math.min(Math.max(-sr.top / (sr.height - vh), 0), 1);
    progressBar.style.setProperty("--p", p.toFixed(4));
  }

  function sync() {
    if (scrollY !== syncedScroll) onScroll();
    requestAnimationFrame(sync);
  }

  function loop() {
    shownTime += (targetTime - shownTime) * 0.18;
    if (
      app.readyState >= 1 &&
      Math.abs(app.currentTime - shownTime) > 1 / 24 &&
      !app.seeking
    ) {
      app.currentTime = shownTime;
    }
    requestAnimationFrame(loop);
  }

  if (reduce) {
    steps.forEach((s) => s.classList.add("in"));
  } else {
    app.pause();
    app
      .play()
      .then(() => app.pause())
      .catch(() => {});
    requestAnimationFrame(loop);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || reduce) return;
    const s = steps[active];
    bgs[s?.dataset.bg]
      ?.querySelector("video")
      .play()
      .catch(() => {});
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  requestAnimationFrame(sync);

  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.2 },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

(() => {
  const tabs = [...document.querySelectorAll(".portal-tabs [data-shot]")];
  const shots = [...document.querySelectorAll(".browser-view [data-shot]")];
  if (!tabs.length) return;
  let current = 0;
  let timer = 0;
  const show = (i) => {
    current = i;
    tabs.forEach((t, k) => t.setAttribute("aria-selected", String(k === i)));
    shots.forEach((img) =>
      img.classList.toggle("on", img.dataset.shot === tabs[i].dataset.shot),
    );
  };
  const schedule = () => {
    clearInterval(timer);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => show((current + 1) % tabs.length), 5000);
  };
  tabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      show(i);
      schedule();
    }),
  );
  schedule();
})();
