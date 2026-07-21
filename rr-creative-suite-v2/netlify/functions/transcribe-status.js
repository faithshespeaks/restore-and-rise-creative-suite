// Restore & Rise Creative Suite — poll a transcription job
// Required environment variable (set in Netlify site settings): ASSEMBLYAI_API_KEY

exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing transcript id." }) };
  }
  if (!process.env.ASSEMBLYAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ASSEMBLYAI_API_KEY is not set on this Netlify site." }),
    };
  }

  try {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
    });
    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: data.status, // "queued" | "processing" | "completed" | "error"
        text: data.text || null,
        error: data.error || null,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
