
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const MODELGATE_API_KEY = process.env.GEMINI_API_KEY;
  const IMAGE_API_URL = 'https://mg.aid.pub/api/v1/images/generations';

  if (!MODELGATE_API_KEY) {
    return res.status(500).json({ error: 'Missing API Key configuration' });
  }

  try {
    const { model, prompt, size, output_type, output_format } = req.body;

    const response = await fetch(IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELGATE_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'google/nano-banana',
        prompt,
        size: size || '864x1184',
        output_type: output_type || 'base64',
        output_format: output_format || 'png'
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
