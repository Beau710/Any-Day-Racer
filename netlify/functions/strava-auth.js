exports.handler = async function (event) {
  const code = event.queryStringParameters.code;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No code provided" }),
    };
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (data.errors) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Strava auth failed" }),
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: `https://timely-shortbread-58de89.netlify.app/profile.html?access_token=${data.access_token}&athlete_id=${data.athlete.id}`,
    },
    body: "",
  };
};
