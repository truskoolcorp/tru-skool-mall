module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, voice_id, speed, pitch, emotion } = req.body;

  if (!text || text.length > 5000) {
    return res.status(400).json({ error: 'Text required (max 5000 chars)' });
  }

  try {
    const response = await fetch('https://api.minimax.io/v1/t2a_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.MINIMAX_API_KEY,
      },
      body: JSON.stringify({
        model: 'speech-2.8-turbo',
        text: text,
        voice_setting: {
          voice_id: voice_id || 'Calm_Woman',
          speed: speed || 0.95,
          pitch: pitch || 0,
          emotion: emotion || 'happy',
          vol: 1.0,
        },
        audio_setting: {
          format: 'mp3',
          sample_rate: 24000,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('MiniMAX TTS error:', errText);
      return res.status(response.status).json({ error: 'TTS error' });
    }

    const data = await response.json();

    if (data.data && data.data.audio) {
      return res.status(200).json({ audio: data.data.audio });
    }

    return res.status(500).json({ error: 'No audio in response' });

  } catch (err) {
    console.error('TTS proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
