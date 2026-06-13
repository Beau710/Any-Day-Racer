const params = new URLSearchParams(window.location.search);
const accessToken = params.get("access_token");
const athleteId = params.get("athlete_id");

async function init() {
  if (accessToken && athleteId) {
    const tempProfile =
      JSON.parse(localStorage.getItem("adr_temp_profile")) || {};
    const profile = {
      name: tempProfile.name,
      homepark: tempProfile.homepark,
      bike: tempProfile.bike,
      trail: tempProfile.trail,
      email: tempProfile.email,
      access_token: accessToken,
      refresh_token: params.get("refresh_token"),
      expires_at: params.get("expires_at"),
      athlete_id: athleteId,
    };
    localStorage.setItem("adr_profile", JSON.stringify(profile));
    localStorage.removeItem("adr_temp_profile");

    const saveRes = await fetch("/.netlify/functions/save-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        athlete_id: athleteId,
        name: profile.name,
        homepark: profile.homepark,
        bike: profile.bike,
        trail: profile.trail,
        email: profile.email,
        strava_access_token: profile.access_token,
        strava_refresh_token: profile.refresh_token,
        strava_token_expires_at: profile.expires_at,
      }),
    });
    if (!saveRes.ok) {
      const err = await saveRes.text();
      console.error("save-profile failed:", saveRes.status, err);
    }
  }

  const profile = JSON.parse(localStorage.getItem("adr_profile"));

  if (!profile) {
    window.location.href = "login.html";
    return;
  }

  // Sync this rider's latest efforts in the background so their
  // leaderboard time updates even if they never open the leaderboard page
  if (profile.access_token) {
    fetch("/.netlify/functions/save-effort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: profile.access_token,
        refresh_token: profile.refresh_token,
        expires_at: profile.expires_at,
      }),
    }).then(function (res) {
      if (!res.ok) return;
      return res.json();
    }).then(function (data) {
      if (data && data.new_tokens) {
        localStorage.setItem("adr_profile", JSON.stringify({ ...profile, ...data.new_tokens }));
      }
    }).catch(function (e) {
      console.error("Failed to sync efforts:", e);
    });
  }

  document.getElementById("profile-name").textContent = profile.name;
  document.getElementById("detail-homepark").textContent = profile.homepark;
  document.getElementById("detail-bike").textContent = profile.bike;
  document.getElementById("detail-trail").textContent = profile.trail;

  const initials = (profile.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  document.getElementById("avatar").textContent = initials;

}

function logout() {
  localStorage.removeItem("adr_profile");
  window.location.href = "index.html";
}

init();
