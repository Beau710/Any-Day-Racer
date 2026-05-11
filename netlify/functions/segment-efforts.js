exports.handler = async function (event) {
  const accessToken = event.queryStringParameters.access_token;
  const segmentId = "3818489";

  if (!accessToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No access token provided" }),
    };
  }

  const response = await fetch(
    `https://www.strava.com/api/v3/segments/${segmentId}/leaderboard`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
