
import { PhraseExercise } from "./types";

// ModelGate API 配置
const MODELGATE_API_KEY = process.env.API_KEY || '';
const MODELGATE_BASE_URL = 'https://mg.aid.pub/v1';

export async function fetchPhrases(scenario: string, count: number = 10): Promise<PhraseExercise[]> {
  try {
    const prompt = `Generate ${count} common English phrases for a learning scenario: "${scenario}". 
Each phrase must have one keyword replaced with "___" for a cloze test. 
The keyword should be essential but challenging.
IMPORTANT: 
1. Provide the Chinese translation for JUST that missing keyword.
2. Provide the standard IPA (International Phonetic Alphabet) for the 'correctAnswer' word in the 'phonetic' field.
3. Provide EXACTLY 5 diverse example sentences using the 'correctAnswer' word.
4. Each example must have both 'en' (English) and 'zh' (Chinese translation).
Return the data in a structured JSON format as an array of objects with the following structure:
{
  "id": "unique-id",
  "sentenceWithBlank": "sentence with ___",
  "correctAnswer": "word",
  "correctAnswerChinese": "中文翻译",
  "chineseMeaning": "完整句子中文翻译",
  "phonetic": "/IPA符号/",
  "additionalExamples": [
    {"en": "example sentence 1", "zh": "中文翻译1"},
    {"en": "example sentence 2", "zh": "中文翻译2"},
    {"en": "example sentence 3", "zh": "中文翻译3"},
    {"en": "example sentence 4", "zh": "中文翻译4"},
    {"en": "example sentence 5", "zh": "中文翻译5"}
  ],
  "hint": "hint text"
}`;

    const response = await fetch(`${MODELGATE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELGATE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-3-flash',
        input: prompt,
        temperature: 0.7,
        max_output_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ModelGate API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // ModelGate OpenAI Style 响应格式: data.output?.[0]?.content?.[0]?.text
    const text = data.output?.[0]?.content?.[0]?.text || data.choices?.[0]?.message?.content;
    
    if (!text) {
      console.error("No text content in response:", data);
      return [];
    }

    // 尝试解析 JSON（可能包含 markdown 代码块）
    let jsonText = text.trim();
    // 移除可能的 markdown 代码块标记
    if (jsonText.startsWith('```')) {
      const lines = jsonText.split('\n');
      jsonText = lines.slice(1, -1).join('\n');
    }
    
    const phrases = JSON.parse(jsonText);
    return Array.isArray(phrases) ? phrases : [];
  } catch (error) {
    console.error("Error fetching phrases:", error);
    return [];
  }
}

export async function generateScenarioImage(scenarioTitle: string): Promise<string | null> {
  try {
    const prompt = `A cinematic, wide-angle, hyper-realistic photography of ${scenarioTitle}. Atmospheric lighting, professional color grading, empty space for UI overlay, 8k resolution.`;

    const response = await fetch('https://mg.aid.pub/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELGATE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/nano-banana',
        prompt: prompt,
        size: '864x1184', // 16:9 比例
        output_type: 'base64',
        output_format: 'png'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ModelGate API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.content;
    
    if (!base64Image) {
      console.warn("No image data in response:", data);
      return null;
    }

    return base64Image;
  } catch (error) {
    console.error("Error generating scenario image:", error);
    return null;
  }
}

export async function generatePhraseImage(phrase: string): Promise<string | null> {
  try {
    const prompt = `A minimalist, high-end 3D render or artistic illustration representing the concept: "${phrase}". Clean background, vibrant colors, studio lighting, professional conceptual art style.`;

    const response = await fetch('https://mg.aid.pub/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELGATE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/nano-banana',
        prompt: prompt,
        size: '864x1184',
        output_type: 'base64',
        output_format: 'png'  
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ModelGate API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.content;
    
    if (!base64Image) {
      console.warn("No image data in response:", data);
      return null;
    }

    return base64Image;
  } catch (error) {
    console.error("Error generating phrase image:", error);
    return null;
  }
}

// TTS Decoding Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function speakText(text: string) {
  try {
    const prompt = `Say clearly: ${text}`;

    const response = await fetch(`${MODELGATE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODELGATE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-preview-tts',
        input: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`ModelGate API error: ${response.status}`);
    }

    const data = await response.json();
    
    // 尝试从响应中提取音频数据
    const base64Audio = data.output?.[0]?.content?.[0]?.inlineData?.data || 
                       data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data in response");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  } catch (err) {
    console.error("TTS failed, falling back to browser API", err);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}
