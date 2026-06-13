async function loadActiveRace() {
  try {
    const response = await fetch("/.netlify/functions/get-leaderboard");
    if (!response.ok) return;

    const { race } = await response.json();
    if (!race) return;

    const nameEl = document.getElementById("trail-name");
    const locationEl = document.getElementById("trail-location");
    const typeEl = document.getElementById("trail-type");
    const daysEl = document.getElementById("days-left");

    if (nameEl) nameEl.textContent = race.name || "—";
    if (locationEl) locationEl.textContent = race.location || "";
    if (typeEl) typeEl.textContent = race.type || "—";

    if (daysEl) {
      if (race.end_date) {
        const now = new Date();
        const end = new Date(race.end_date);
        const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        daysEl.textContent = days > 0 ? `${days} day${days === 1 ? "" : "s"}` : "Ended";
      } else {
        daysEl.textContent = "Open";
      }
    }
  } catch (e) {
    console.error("Failed to load active race:", e);
  }
}

loadActiveRace();
