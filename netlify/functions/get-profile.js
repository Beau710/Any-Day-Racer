exports.handler = async function (event) {
  const athlete_id = event.queryStringParameters.athlete_id;

  if (!athlete_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No athlete_id provided" }),
    };
  }

  const url = `${process.env.SUPABASE_URL}/rest/v1/profiles?athlete_id=eq.${athlete_id}&limit=1`;

  const response = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Profile not found" }),
    };
  }

  return { statusCode: 200, body: JSON.stringify(data[0]) };
};
