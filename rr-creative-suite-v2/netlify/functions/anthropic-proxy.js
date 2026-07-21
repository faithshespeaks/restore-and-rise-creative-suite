// Restore & Rise Creative Suite — Anthropic proxy
// Keeps the Anthropic API key server-side, same pattern used for the HOF Business Suite.
// Required environment variable (set in Netlify site settings): ANTHROPIC_API_KEY

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { systemPrompt, messages } = JSON.parse(event.body || "{}");

    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ANTHROPIC_API_KEY is not set on this Netlify site." }),
      };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: systemPrompt || "",
        messages: messages || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = (data && data.error && data.error.message) ? data.error.message : JSON.stringify(data);
      return { statusCode: response.status, body: JSON.stringify({ error: message }) };
    }

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
