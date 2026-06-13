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

  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // User already registered — treat as success so Strava OAuth can still run
    // and update their linked Strava account
    const msg = (data.msg || data.message || "").toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    return {
      statusCode: 400,
      body: JSON.stringify({ error: data.msg || data.message || "Signup failed" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
