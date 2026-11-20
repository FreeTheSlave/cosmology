(() => {
  const lore = window.ATLAS_LORE || {};
  const constellations = window.ATLAS_CONSTELLATIONS || [];
  const detail = document.getElementById("detailContent");
  const status = document.getElementById("statusText");
  const search = document.getElementById("searchInput");
  const navButtons = [...document.querySelectorAll(".nav-link")];
  const mapSection = document.getElementById("mapSection");
  const detailPanel = document.getElementById("detailPanel");
  const mainLayout = document.querySelector(".main-layout");
  let currentView = "map";

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function setActiveNav(view) {
    navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === view));
  }

  function renderConstellation(c) {
    detail.innerHTML = `
      <p class="eyebrow">CONSTELLATION RECORD</p>
      <h2>${escapeHTML(c.name)}</h2>
      <p class="muted">${escapeHTML(c.description || "No description has been entered for this constellation.")}</p>
      <div class="entry-meta">
        <div class="meta-cell"><span>Associated blessing</span><strong>${escapeHTML(c.blessing || "Unrecorded")}</strong></div>
        <div class="meta-cell"><span>Principal stars</span><strong>${c.stars.length}</strong></div>
      </div>
      <div class="panel-rule"></div>
      <h3>In the heavens</h3>
      <p class="small muted">${escapeHTML(c.lore || "No further lore has been recorded.")}</p>
      <h3>Star identifiers</h3>
      <p>${c.stars.map(s => `<span class="entry-tag">${escapeHTML(s.id)}</span>`).join("")}</p>
    `;
    status.textContent = `${c.name} selected`;
    document.getElementById("mobileSelection").textContent = `${c.name} selected`;
  }

  function renderLore(key) {
    const entry = lore[key];
    if (!entry) return;
    const sections = (entry.sections || []).map(section => `
      <div class="panel-rule"></div>
      <h3>${escapeHTML(section.title)}</h3>
      <p class="small muted">${escapeHTML(section.body)}</p>
    `).join("");
    const entries = (entry.entries || []).map(item => `
      <div class="panel-rule"></div>
      <h3>${escapeHTML(item.name)}</h3>
      <p class="eyebrow">${escapeHTML(item.role)}</p>
      <p class="small muted">${escapeHTML(item.detail)}</p>
    `).join("");
    const tags = (entry.tags || []).map(tag => `<span class="entry-tag">${escapeHTML(tag)}</span>`).join("");
    detail.innerHTML = `
      <p class="eyebrow">${escapeHTML(entry.subtitle || "ATLAS ARCHIVE")}</p>
      <h2>${escapeHTML(entry.title)}</h2>
      <p class="muted">${escapeHTML(entry.intro || "")}</p>
      ${sections}${entries}
      ${tags ? `<div class="panel-rule"></div><p>${tags}</p>` : ""}
    `;
    status.textContent = `${entry.title} archive`;
  }

  function showView(view) {
    currentView = view;
    setActiveNav(view);
    if (view === "map") {
      mapSection.hidden = false;
      mainLayout.classList.remove("lore-mode");
      detail.innerHTML = `
        <div class="empty-emblem">✧</div>
        <p class="eyebrow">WELCOME, OBSERVER</p>
        <h2>The Heavens Await</h2>
        <p class="muted">Choose a constellation from the chart, or use the navigation above to explore the records of the known world.</p>
        <div class="panel-rule"></div>
        <h3>Chart notes</h3>
        <p class="small muted">Drag the chart to travel through the heavens. Select a constellation to open its record.</p>`;
      status.textContent = "Chart ready";
    } else {
      mapSection.hidden = true;
      mainLayout.classList.add("lore-mode");
      renderLore(view);
    }
  }

  function searchItems(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    const add = (title, subtitle, action) => results.push({ title, subtitle, action });
    const cMatches = constellations.filter(c => [c.name, c.blessing, c.description, c.lore].join(" ").toLowerCase().includes(q));
    cMatches.forEach(c => add(c.name, "Constellation", () => {
      showView("map");
      window.StarMap?.select(c.id);
    }));
    Object.entries(lore).forEach(([key, entry]) => {
      const haystack = JSON.stringify(entry).toLowerCase();
      if (haystack.includes(q)) add(entry.title, "Lore archive", () => showView(key));
    });
    return results.slice(0, 8);
  }

  function showSearchResults(query) {
    const results = searchItems(query);
    if (!query.trim()) return;
    detail.innerHTML = `<p class="eyebrow">ATLAS SEARCH</p><h2>Search results</h2><p class="small muted">${results.length} matching record${results.length === 1 ? "" : "s"} for “${escapeHTML(query)}”.</p>` +
      (results.length ? results.map((r, i) => `<button class="result-item" data-result="${i}">${escapeHTML(r.title)}<small>${escapeHTML(r.subtitle)}</small></button>`).join("") : `<p class="muted small">No matching records. Try another name or subject.</p>`);
    detail.querySelectorAll("[data-result]").forEach(button => {
      button.addEventListener("click", () => results[Number(button.dataset.result)]?.action());
    });
    status.textContent = "Search results";
  }

  navButtons.forEach(button => button.addEventListener("click", () => {
    search.value = "";
    showView(button.dataset.view);
  }));
  document.querySelectorAll("[data-view='map']:not(.nav-link)").forEach(button => button.addEventListener("click", () => showView("map")));
  window.StarMap?.setOnSelect(renderConstellation);

  document.getElementById("resetView").addEventListener("click", () => {
    window.StarMap?.reset();
    showView("map");
  });
  document.getElementById("helpButton").addEventListener("click", () => document.getElementById("helpDialog").showModal());
  search.addEventListener("input", () => {
    if (search.value.trim()) showSearchResults(search.value);
    else if (currentView === "map") showView("map");
    else renderLore(currentView);
  });
  search.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const first = detail.querySelector("[data-result]");
      first?.click();
    }
    if (event.key === "Escape") {
      search.value = "";
      search.blur();
      if (currentView === "map") showView("map");
      else renderLore(currentView);
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== search && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      search.focus();
    }
  });
})();
