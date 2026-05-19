exports.handler = async function () {
  const url = `${process.env.SUPABASE_URL}/rest/v1/leaderboard?segment_id=eq.3818489&order=elapsed_time.asc`;

  const response = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
