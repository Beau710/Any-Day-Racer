exports.handler = async function (event) {
  const { athlete_id, athlete_name, segment_id, elapsed_time, start_date } =
    JSON.parse(event.body);

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/leaderboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        athlete_id,
        athlete_name,
        segment_id,
        elapsed_time,
        start_date,
      }),
    },
  );

  if (!response.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save effort" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
