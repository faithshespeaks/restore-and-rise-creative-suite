// Restore & Rise Creative Suite — start a transcription job
// Required environment variable (set in Netlify site settings): ASSEMBLYAI_API_KEY
//
// Flow: browser sends base64 audio -> this function uploads the raw bytes to
// AssemblyAI -> creates a transcript job -> returns the job id for polling.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { audioBase64 } = JSON.parse(event.body || "{}");

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ASSEMBLYAI_API_KEY is not set on this Netlify site." }),
      };
    }
    if (!audioBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "No audio file received." }) };
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");

    // Step 1: upload the raw audio bytes to AssemblyAI
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/octet-stream",
      },
      body: audioBuffer,
    });
    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      return { statusCode: uploadResponse.status, body: JSON.stringify(uploadData) };
    }

    // Step 2: create the transcription job, pointing at the uploaded audio
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: uploadData.upload_url,
        speaker_labels: true,
      }),
    });
    const transcriptData = await transcriptResponse.json();
    if (!transcriptResponse.ok) {
      return { statusCode: transcriptResponse.status, body: JSON.stringify(transcriptData) };
    }

    return { statusCode: 200, body: JSON.stringify({ id: transcriptData.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
