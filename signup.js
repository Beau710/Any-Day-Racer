const clientId = "146874";
const redirectUri =
  "https://timely-shortbread-58de89.netlify.app/.netlify/functions/strava-auth";

document.getElementById("strava-btn").addEventListener("click", function () {
  const name = document.getElementById("name").value.trim();
  const homepark = document.getElementById("homepark").value.trim();
  const bike = document.getElementById("bike").value.trim();
  const trail = document.getElementById("trail").value.trim();

  if (!name || !homepark || !bike || !trail) {
    alert("Please fill in all fields before connecting with Strava.");
    return;
  }

  const tempProfile = { name, homepark, bike, trail };
  localStorage.setItem("adr_temp_profile", JSON.stringify(tempProfile));

  window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=read_all,activity:read_all`;
});
