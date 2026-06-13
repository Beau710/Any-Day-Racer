exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const {
    athlete_id,
    name,
    homepark,
    bike,
    trail,
    email,
    strava_access_token,
    strava_refresh_token,
    strava_token_expires_at,
  } = JSON.parse(event.body);

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      athlete_id,
      name,
      homepark,
      bike,
      trail,
      email,
      strava_access_token,
      strava_refresh_token,
      strava_token_expires_at,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.log("Supabase save-profile error:", detail);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save profile", detail }),
    };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
