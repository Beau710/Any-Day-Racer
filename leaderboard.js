const profile = JSON.parse(localStorage.getItem("adr_profile"));
const accessToken = profile ? profile.access_token : null;

async function saveEfforts() {
  if (!accessToken) return;

  const response = await fetch(
    `/.netlify/functions/segment-efforts?access_token=${accessToken}`,
  );
  const efforts = await response.json();

  if (!efforts || efforts.length === 0) return;

  const bestEffort = efforts.reduce(function (best, current) {
    return current.elapsed_time < best.elapsed_time ? current : best;
  });

  await fetch("/.netlify/functions/save-effort", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      athlete_id: profile.athlete_id,
      athlete_name: profile.name,
      segment_id: 3818489,
      elapsed_time: bestEffort.elapsed_time,
      start_date: bestEffort.start_date,
    }),
  });
}

async function loadLeaderboard() {
  const response = await fetch("/.netlify/functions/get-leaderboard");
  const data = await response.json();

  if (!data || data.length === 0) {
    return;
  }

  const tbody = document.querySelector(".lb-table tbody");
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

    const row = `
      <tr>
        <td class="${rankClass}">${rank}</td>
        <td class="${rankClass}">${entry.athlete_name}</td>
        <td class="${rankClass}">${time}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

async function init() {
  await saveEfforts();
  await loadLeaderboard();
}

init();
