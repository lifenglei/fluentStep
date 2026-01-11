
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const MODELGATE_API_KEY = process.env.GEMINI_API_KEY;
  const MODELGATE_BASE_URL = 'https://mg.aid.pub/v1';

  if (!MODELGATE_API_KEY) {
    return res.status(500).json({ error: 'Missing API Key configuration' });
  }

  try {
    const { model, input, temperature, max_output_tokens } = req.body;

    const response = await fetch(`${MODELGATE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELGATE_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'DeepSeek-V3',
        input,
        temperature: temperature || 0.7,
        max_output_tokens: max_output_tokens || 4000
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
