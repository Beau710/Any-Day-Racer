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
