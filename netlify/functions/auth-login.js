exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email and password are required" }),
    };
  }

  const supabaseHeaders = {
    apikey: process.env.SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };

  // Verify email/password via Supabase Auth
  const authResponse = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({ email, password }),
    },
  );

  if (!authResponse.ok) {
    const authData = await authResponse.json();
    const msg = authData.error_description || authData.msg || authData.message || "Invalid email or password";
    return {
      statusCode: 401,
      body: JSON.stringify({ error: msg }),
    };
  }

  // Fetch the rider profile including stored Strava tokens
  const profileResponse = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    },
  );

  const profiles = await profileResponse.json();

  if (!Array.isArray(profiles) || profiles.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "No profile found. Please sign up first." }),
    };
  }

  const profile = profiles[0];
  let accessToken = profile.strava_access_token;
  let refreshToken = profile.strava_refresh_token;
  let expiresAt = profile.strava_token_expires_at;

  if (!accessToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No Strava account linked. Please sign up again." }),
    };
  }

  // Refresh the Strava token if expired
  if (expiresAt && Date.now() / 1000 >= parseInt(expiresAt)) {
    const refreshResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const refreshData = await refreshResponse.json();

    if (refreshData.access_token) {
      accessToken = refreshData.access_token;
      refreshToken = refreshData.refresh_token;
      expiresAt = String(refreshData.expires_at);

      // Persist refreshed tokens back to the profile
      await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/profiles?athlete_id=eq.${profile.athlete_id}`,
        {
          method: "PATCH",
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strava_access_token: accessToken,
            strava_refresh_token: refreshToken,
            strava_token_expires_at: expiresAt,
          }),
        },
      );
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      profile: {
        athlete_id: profile.athlete_id,
        name: profile.name,
        homepark: profile.homepark,
        bike: profile.bike,
        trail: profile.trail,
        email: profile.email,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    }),
  };
};
