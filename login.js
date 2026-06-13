document.getElementById("login-btn").addEventListener("click", async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");

  errorEl.style.display = "none";

  if (!email || !password) {
    errorEl.textContent = "Please enter your email and password.";
    errorEl.style.display = "block";
    return;
  }

  const btn = document.getElementById("login-btn");
  btn.textContent = "Logging in…";
  btn.disabled = true;

  const response = await fetch("/.netlify/functions/auth-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    errorEl.textContent = data.error || "Login failed. Please try again.";
    errorEl.style.display = "block";
    btn.textContent = "Log In";
    btn.disabled = false;
    return;
  }

  // Store profile with Strava tokens so effort syncing works immediately
  const profile = data.profile;
  profile.access_token = data.access_token;
  profile.refresh_token = data.refresh_token;
  profile.expires_at = data.expires_at;
  localStorage.setItem("adr_profile", JSON.stringify(profile));

  window.location.href = "profile.html";
});
