exports.handler = async function () {
  const supabaseHeaders = {
    apikey: process.env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
  };

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

  let lbUrl = `${process.env.SUPABASE_URL}/rest/v1/leaderboard?segment_id=eq.${race.segment_id}&order=elapsed_time.asc`;
  if (race.start_date) lbUrl += `&start_date=gte.${race.start_date}`;
  if (race.end_date) lbUrl += `&start_date=lte.${race.end_date}`;

  const lbResponse = await fetch(lbUrl, { headers: supabaseHeaders });
  const entries = await lbResponse.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ race, entries: entries || [] }),
  };
};
