interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// 1. Fetch a fresh OAuth Access Token from Twitch
async function getTwitchAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch/IGDB Environment Variables");
  }

  const authUrl = `https://twitch.tv{clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const response = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 3600 }, // Cache token for 1 hour to optimize performance
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Twitch OAuth");
  }

  const data: TwitchAuthResponse = await response.json();
  return data.access_token;
}

// 2. Core function to query the IGDB API
export async function queryIGDB(endpoint: string, queryBody: string) {
  try {
    const accessToken = await getTwitchAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID!;

    const response = await fetch(`https://igdb.com{endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain", // IGDB uses a custom string body syntax
      },
      body: queryBody,
      next: { revalidate: 60 }, // Cache the results for 60 seconds (ISR style)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IGDB API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("IGDB Fetch Error:", error);
    throw error;
  }
}