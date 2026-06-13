const profile = JSON.parse(localStorage.getItem("adr_profile"));
const accessToken = profile ? profile.access_token : null;

async function saveEfforts() {
  if (!accessToken) return;

  const response = await fetch("/.netlify/functions/save-effort", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: accessToken,
      refresh_token: profile.refresh_token,
      expires_at: profile.expires_at,
    }),
  });

  // If the server refreshed the token, update localStorage so future calls work
  if (response.ok) {
    const data = await response.json();
    if (data.new_tokens) {
      const updated = { ...profile, ...data.new_tokens };
      localStorage.setItem("adr_profile", JSON.stringify(updated));
    }
  }
}

async function loadLeaderboard() {
  const tbody = document.querySelector(".lb-table tbody");
  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--grey-text); padding: 2rem; font-family: var(--font-body); letter-spacing: 0.05em;">Loading times...</td></tr>`;

  await new Promise((resolve) => setTimeout(resolve, 800));

  const response = await fetch("/.netlify/functions/get-leaderboard");

  if (!response.ok) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--grey-text); padding: 2rem; font-family: var(--font-body);">No active race.</td></tr>`;
    return;
  }

  const { race, entries } = await response.json();

  // Populate page heading from the active race
  const titleEl = document.querySelector(".lb-title");
  const subEl = document.querySelector(".lb-sub");
  const labelEl = document.querySelector(".section-label");

  if (titleEl && race.name) titleEl.textContent = race.name;
  if (subEl && race.location && race.type) subEl.textContent = `${race.location} — ${race.type}`;
  if (labelEl && race.end_date) {
    const end = new Date(race.end_date);
    labelEl.textContent = end.toLocaleString("default", { month: "long", year: "numeric" });
  }

  tbody.innerHTML = "";

  if (!entries || entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--grey-text); padding: 2rem; font-family: var(--font-body);">No times yet — be the first!</td></tr>`;
    return;
  }

  entries.forEach(function (entry, index) {
    const rank = index + 1;
    const minutes = Math.floor(entry.elapsed_time / 60);
    const seconds = String(entry.elapsed_time % 60).padStart(2, "0");
    const time = `${minutes}:${seconds}`;

    let rankClass = "";
    if (rank === 1) rankClass = "gold";
    if (rank === 2) rankClass = "silver";
    if (rank === 3) rankClass = "bronze";

    const row = document.createElement("tr");
    [rank, entry.athlete_name, time].forEach(function (value) {
      const cell = document.createElement("td");
      if (rankClass) cell.className = rankClass;
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
}

async function init() {
  loadLeaderboard();

  try {
    await saveEfforts();
  } catch (e) {
    console.error("Failed to sync efforts:", e);
  }

  await loadLeaderboard();
}

init();
