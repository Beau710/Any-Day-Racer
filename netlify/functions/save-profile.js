exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { athlete_id, name, homepark, bike, trail } = JSON.parse(event.body);

  const url = `${process.env.SUPABASE_URL}/rest/v1/profiles`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ athlete_id, name, homepark, bike, trail }),
  });

  if (!response.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save profile" }),
    };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
