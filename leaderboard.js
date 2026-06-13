const profile = JSON.parse(localStorage.getItem("adr_profile"));
const accessToken = profile ? profile.access_token : null;

async function saveEfforts() {
  if (!accessToken) return;

  // The server fetches and verifies efforts from Strava itself —
  // no times are sent from the browser
  await fetch("/.netlify/functions/save-effort", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
}

async function loadLeaderboard() {
  const tbody = document.querySelector(".lb-table tbody");
  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--grey-text); padding: 2rem; font-family: var(--font-body); letter-spacing: 0.05em;">Loading times...</td></tr>`;
  await new Promise((resolve) => setTimeout(resolve, 800));
  const response = await fetch("/.netlify/functions/get-leaderboard");
  const data = await response.json();

  if (!data || data.length === 0) {
    return;
  }

  tbody.innerHTML = "";

  data.forEach(function (entry, index) {
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
