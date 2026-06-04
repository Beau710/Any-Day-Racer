const clientId = "146874";
const redirectUri =
  "https://timely-shortbread-58de89.netlify.app/.netlify/functions/strava-auth";

document.getElementById("strava-btn").addEventListener("click", async function () {
  const name = document.getElementById("name").value.trim();
  const homepark = document.getElementById("homepark").value.trim();
  const bike = document.getElementById("bike").value.trim();
  const trail = document.getElementById("trail").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("signup-error");

  errorEl.style.display = "none";

  if (!name || !homepark || !bike || !trail || !email || !password) {
    errorEl.textContent = "Please fill in all fields before continuing.";
    errorEl.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters.";
    errorEl.style.display = "block";
    return;
  }

  // Create Supabase auth account
  const response = await fetch("/.netlify/functions/auth-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    errorEl.textContent = data.error || "Account creation failed. Please try again.";
    errorEl.style.display = "block";
    return;
  }

  // Save temp profile including email for after Strava OAuth
  const tempProfile = { name, homepark, bike, trail, email };
  localStorage.setItem("adr_temp_profile", JSON.stringify(tempProfile));

  window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=read_all,activity:read_all`;
});
