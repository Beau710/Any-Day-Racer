const profile = JSON.parse(localStorage.getItem("adr_profile"));
const accessToken = profile ? profile.access_token : null;

async function loadLeaderboard() {
  if (!accessToken) {
    console.log("No access token found");
    return;
  }

  const response = await fetch(
    `/.netlify/functions/segment-efforts?access_token=${accessToken}`,
  );

  const data = await response.json();

  if (!data || data.length === 0) {
    console.log("No entries found", JSON.stringify(data));
    return;
  }

  const tbody = document.querySelector(".lb-table tbody");
  tbody.innerHTML = "";

  data.forEach(function (entry, index) {
    console.log(entry);
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
        <td class="${rankClass}">${entry.athlete.firstname} ${entry.athlete.lastname}</td>
        <td class="${rankClass}">${time}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

loadLeaderboard();
