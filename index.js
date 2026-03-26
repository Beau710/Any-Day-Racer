const profile = JSON.parse(localStorage.getItem("adr_profile"));
const stravaBtn = document.getElementById("nav-btn");

if (profile) {
  stravaBtn.textContent = "My Profile";
  stravaBtn.href = "profile.html";
} else {
  stravaBtn.textContent = "Connect with Strava";
  stravaBtn.href = "signup.html";
}
