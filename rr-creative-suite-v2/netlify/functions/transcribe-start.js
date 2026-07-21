// Restore & Rise Creative Suite — start a transcription job
// Required environment variable (set in Netlify site settings): ASSEMBLYAI_API_KEY
//
// Netlify functions have a ~4.5MB effective request size limit, which almost
// any real podcast episode exceeds. So this function now expects the audio
// to already be uploaded directly to AssemblyAI from the browser (see
// get-assemblyai-token.js + the upload step in content-studio.html), and
// just needs the resulting audio_url to start the transcription job.
//
// audioBase64 is still accepted as a fallback for very small clips (a short
// voice note under a couple MB), but audioUrl is the primary path now.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { audioUrl, audioBase64 } = JSON.parse(event.body || "{}");

    if (!process.env.ASSEMBLYAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ASSEMBLYAI_API_KEY is not set on this Netlify site." }),
      };
    }
    if (!audioUrl && !audioBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "No audio file or audio URL received." }) };
    }

    let finalAudioUrl = audioUrl;

    // Fallback path: small file sent as base64 directly to this function.
    if (!finalAudioUrl) {
      const audioBuffer = Buffer.from(audioBase64, "base64");
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
      finalAudioUrl = uploadData.upload_url;
    }

    // Create the transcription job, pointing at the uploaded audio
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: finalAudioUrl,
        speaker_labels: true,
      }),
    });
    const transcriptData = await transcriptResponse.json();
    if (!transcriptResponse.ok) {
      const message = (transcriptData && transcriptData.error) ? transcriptData.error : JSON.stringify(transcriptData);
      return { statusCode: transcriptResponse.status, body: JSON.stringify({ error: message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ id: transcriptData.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
