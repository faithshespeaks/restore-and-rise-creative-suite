// Restore & Rise Creative Suite — get-assemblyai-token
//
// AssemblyAI's upload endpoint requires the API key on the request itself
// and doesn't offer a scoped/temporary token for plain file uploads (only
// for its separate real-time streaming API). So for large audio files to
// bypass Netlify's function payload limit, the browser must upload directly
// to AssemblyAI - which means this key has to reach the browser at request
// time. It is never written into the site's source code or the GitHub
// repo; it stays in Netlify's environment variables and is only sent to a
// client that has already passed the Creative Suite's password gate.
//
// If you want zero client-side exposure of this key, the alternative is
// routing large files through your own storage (e.g., a Supabase bucket)
// first, then having a Netlify function pass AssemblyAI a URL to that
// storage instead of directly from AssemblyAI's upload endpoint - a bigger
// build, flag if you want that instead.

exports.handler = async () => {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ASSEMBLYAI_API_KEY is not set on this Netlify site." }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ token: process.env.ASSEMBLYAI_API_KEY }),
  };
};
