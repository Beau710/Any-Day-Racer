function logout() {
  localStorage.removeItem("adr_profile");
  window.location.href = "index.html";
}

const currentUser = JSON.parse(localStorage.getItem("adr_profile"));

const navLogin = document.getElementById("nav-login");
const navProfile = document.getElementById("nav-profile");
const navLogout = document.getElementById("nav-logout");
const heroBtn = document.getElementById("hero-btn");

if (currentUser) {
  if (navLogin) navLogin.style.display = "none";
  if (navProfile) navProfile.style.display = "";
  if (navLogout) navLogout.style.display = "";
  if (heroBtn) {
    heroBtn.textContent = "My Profile";
    heroBtn.href = "profile.html";
  }
} else {
  if (navLogin) navLogin.style.display = "";
  if (navProfile) navProfile.style.display = "none";
  if (navLogout) navLogout.style.display = "none";
  if (heroBtn) {
    heroBtn.textContent = "Connect with Strava";
    heroBtn.href = "signup.html";
  }
}
