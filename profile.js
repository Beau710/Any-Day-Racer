const params = new URLSearchParams(window.location.search);
const accessToken = params.get("access_token");
const athleteId = params.get("athlete_id");

if (accessToken) {
  const tempProfile =
    JSON.parse(localStorage.getItem("adr_temp_profile")) || {};
  const profile = {
    name: tempProfile.name,
    homepark: tempProfile.homepark,
    bike: tempProfile.bike,
    trail: tempProfile.trail,
    access_token: accessToken,
    athlete_id: athleteId,
  };
  localStorage.setItem("adr_profile", JSON.stringify(profile));
  localStorage.removeItem("adr_temp_profile");
}
const profile = JSON.parse(localStorage.getItem("adr_profile"));
if (profile) {
  document.getElementById("profile-name").textContent = profile.name;
  document.getElementById("detail-homepark").textContent = profile.homepark;
  document.getElementById("detail-bike").textContent = profile.bike;
  document.getElementById("detail-trail").textContent = profile.trail;
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  document.getElementById("avatar").textContent = initials;
}
