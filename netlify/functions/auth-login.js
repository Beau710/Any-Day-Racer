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

  // Authenticate with Supabase Auth
  const authResponse = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const authData = await authResponse.json();

  if (!authResponse.ok) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid email or password" }),
    };
  }

  // Fetch the rider profile by email
  const profileResponse = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    }
  );

  const profiles = await profileResponse.json();

  if (!profiles || profiles.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "No profile found for this account" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      profile: profiles[0],
      access_token: authData.access_token,
    }),
  };
};
