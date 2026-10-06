async function getTwitchAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID || "z34asrbs590p7mi3155jt5tdcb1e4a";
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch credentials inside your .env.local file");
  }

  const urlEncodedBody = "client_id=" + encodeURIComponent(clientId) + 
                         "&client_secret=" + encodeURIComponent(clientSecret) + 
                         "&grant_type=client_credentials";

  // 🚨 THE RESOLUTION: 'cache: "no-store"' tells Next.js to bypass the broken disk cache
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: urlEncodedBody,
    cache: "no-store", 
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("❌ TWITCH API REJECTED AUTH CREDENTIALS:", responseText);
    throw new Error(`Twitch Auth Failed: ${response.status}`);
  }
  
  const data = JSON.parse(responseText);
  return data.access_token;
}

export async function queryIGDB(endpoint: string, queryBody: string) {
  try {
    const accessToken = await getTwitchAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID || "z34asrbs590p7mi3155jt5tdcb1e4a";

    const response = await fetch("https://api.igdb.com/v4/" + endpoint, {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "text/plain",
      },
      body: queryBody,
      cache: "no-store", // 🚨 Bypass disk caching on data collections as well
    });

    const resultText = await response.text();

    if (!response.ok) {
      console.error(`❌ IGDB DATABASE REJECTED INBOUND QUERY [${endpoint}]:`, resultText);
      throw new Error(`IGDB Server Error: ${response.status}`);
    }

    return JSON.parse(resultText);
  } catch (error) {
    console.error(`IGDB Proxy Processing Exception [${endpoint}]:`, error);
    throw error;
  }
}
