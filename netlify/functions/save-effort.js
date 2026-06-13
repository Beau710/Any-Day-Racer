exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  let { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt } = body;

  if (!accessToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No access token provided" }),
    };
  }

  const supabaseHeaders = {
    "Content-Type": "application/json",
    apikey: process.env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
  };

  // Refresh the Strava token if it has expired
  let newTokens = null;
  if (expiresAt && Date.now() / 1000 >= parseInt(expiresAt)) {
    if (!refreshToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Token expired — please log in again" }),
      };
    }

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

    if (!refreshData.access_token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Token refresh failed — please log in again" }),
      };
    }

    accessToken = refreshData.access_token;
    newTokens = {
      access_token: refreshData.access_token,
      refresh_token: refreshData.refresh_token,
      expires_at: String(refreshData.expires_at),
    };
  }

  // Look up the active race so segment ID and date window are never hardcoded
  const raceResponse = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/races?active=eq.true&limit=1`,
    { headers: supabaseHeaders },
  );
  const races = await raceResponse.json();

  if (!Array.isArray(races) || races.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "No active race" }),
    };
  }

  const race = races[0];

  // Identify the athlete from the token itself so entries can't be spoofed
  const athleteResponse = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!athleteResponse.ok) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid Strava token" }),
    };
  }

  const athlete = await athleteResponse.json();
  const athleteId = String(athlete.id);

  // Fetch efforts on the active segment — times never come from the browser
  let effortsUrl = `https://www.strava.com/api/v3/segment_efforts?segment_id=${race.segment_id}&per_page=100`;
  if (race.start_date) effortsUrl += `&start_date_local=${race.start_date}`;
  if (race.end_date) effortsUrl += `&end_date_local=${race.end_date}`;

  const effortsResponse = await fetch(effortsUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!effortsResponse.ok) {
    const stravaErr = await effortsResponse.text();
    console.log("Strava efforts error:", effortsResponse.status, stravaErr);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Failed to fetch efforts from Strava", detail: stravaErr }),
    };
  }

  const efforts = await effortsResponse.json();

  if (!Array.isArray(efforts) || efforts.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, saved: false, ...(newTokens && { new_tokens: newTokens }) }),
    };
  }

  const bestEffort = efforts.reduce(function (best, current) {
    return current.elapsed_time < best.elapsed_time ? current : best;
  });

  // Display name from profile, Strava name as fallback
  let athleteName = `${athlete.firstname || ""} ${athlete.lastname || ""}`.trim();
  const profileResponse = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/profiles?athlete_id=eq.${athleteId}&limit=1`,
    { headers: supabaseHeaders },
  );
  if (profileResponse.ok) {
    const profiles = await profileResponse.json();
    if (profiles.length > 0 && profiles[0].name) {
      athleteName = profiles[0].name;
    }
  }

  const entryUrl = `${process.env.SUPABASE_URL}/rest/v1/leaderboard?athlete_id=eq.${athleteId}&segment_id=eq.${race.segment_id}`;
  const existingResponse = await fetch(entryUrl, { headers: supabaseHeaders });
  const existing = existingResponse.ok ? await existingResponse.json() : [];

  let saveResponse;
  if (existing.length > 0) {
    if (bestEffort.elapsed_time >= existing[0].elapsed_time) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, saved: false, ...(newTokens && { new_tokens: newTokens }) }),
      };
    }
    saveResponse = await fetch(entryUrl, {
      method: "PATCH",
      headers: supabaseHeaders,
      body: JSON.stringify({
        athlete_name: athleteName,
        elapsed_time: bestEffort.elapsed_time,
        start_date: bestEffort.start_date,
      }),
    });
  } else {
    saveResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/leaderboard`,
      {
        method: "POST",
        headers: supabaseHeaders,
        body: JSON.stringify({
          athlete_id: athleteId,
          athlete_name: athleteName,
          segment_id: race.segment_id,
          elapsed_time: bestEffort.elapsed_time,
          start_date: bestEffort.start_date,
        }),
      },
    );
  }

  if (!saveResponse.ok) {
    const error = await saveResponse.text();
    console.log("Supabase error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save effort", details: error }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, saved: true, ...(newTokens && { new_tokens: newTokens }) }),
  };
};
