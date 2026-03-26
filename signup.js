const clientId = "146874";
const redirectUri =
  "https://timely-shortbread-58de89.netlify.app/.netlify/functions/strava-auth";

document.getElementById("strava-btn").addEventListener("click", function () {
  window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=read,activity:read`;
});
