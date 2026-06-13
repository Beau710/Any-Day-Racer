const SEGMENT_ID = 3818489;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let accessToken;
  try {
    accessToken = JSON.parse(event.body).access_token;
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  if (!accessToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No access token provided" }),
    };
  }

  // Identify the athlete from the token itself so entries can't be spoofed
  const athleteResponse = await fetch(
    "https://www.strava.com/api/v3/athlete",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!athleteResponse.ok) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid Strava token" }),
    };
  }

  const athlete = await athleteResponse.json();
  const athleteId = String(athlete.id);

  // Fetch this athlete's efforts on the segment directly from Strava —
  // the time on the leaderboard never comes from the browser
  const effortsResponse = await fetch(
    `https://www.strava.com/api/v3/segment_efforts?segment_id=${SEGMENT_ID}&per_page=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!effortsResponse.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Failed to fetch efforts from Strava" }),
    };
  }

  const efforts = await effortsResponse.json();

  if (!Array.isArray(efforts) || efforts.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, saved: false }),
    };
  }

  const bestEffort = efforts.reduce(function (best, current) {
    return current.elapsed_time < best.elapsed_time ? current : best;
  });

  const supabaseHeaders = {
    "Content-Type": "application/json",
    apikey: process.env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
  };

  // Display name comes from the rider's profile, with their Strava name as fallback
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

  const entryUrl = `${process.env.SUPABASE_URL}/rest/v1/leaderboard?athlete_id=eq.${athleteId}&segment_id=eq.${SEGMENT_ID}`;

  const existingResponse = await fetch(entryUrl, { headers: supabaseHeaders });
  const existing = existingResponse.ok ? await existingResponse.json() : [];

  let saveResponse;
  if (existing.length > 0) {
    if (bestEffort.elapsed_time >= existing[0].elapsed_time) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, saved: false }),
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
          segment_id: SEGMENT_ID,
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
    body: JSON.stringify({ success: true, saved: true }),
  };
};
