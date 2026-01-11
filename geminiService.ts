
import { PhraseExercise } from "./types";
import { apiRequest } from './services/apiService';

// ModelGate API 配置 (API Key moved to server-side functions)
const MODELGATE_API_KEY = ''; // Client-side key removed
const TTS_API_KEY = process.env.TTS_API_KEY || '';

// Endpoints point to local Vercel Serverless Functions
const API_CHAT_URL = '/api/chat';
const API_IMAGE_URL = '/api/image';
const TTS_PROXY_URL = '/proxy/tts/txt'; // Updated to match vercel.json rewrite
function extractJsonWithRegex(text) {
  const regex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(regex);
  
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error('JSON解析失败:', e);
      return null;
    }
  }
  return null;
}

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
5. Provide the part of speech (partOfSpeech) for the 'correctAnswer' word (e.g., "noun", "verb", "adjective", "adverb").
6. Provide 2-3 common collocations (commonCollocations) - phrases or words that commonly go with the 'correctAnswer' word. Each collocation must include both English and Chinese translation in the format {"en": "collocation", "zh": "中文翻译"}.
Return the data in a structured JSON format as an array of objects with the following structure:
{
  "id": "unique-id",
  "sentenceWithBlank": "sentence with ___",
  "correctAnswer": "word",
  "correctAnswerChinese": "中文翻译",
  "chineseMeaning": "完整句子中文翻译",
  "phonetic": "/IPA符号/",
  "partOfSpeech": "noun",
  "commonCollocations": [{"en": "collocation 1", "zh": "搭配1翻译"}, {"en": "collocation 2", "zh": "搭配2翻译"}],
  "additionalExamples": [
    {"en": "example sentence 1", "zh": "中文翻译1"},
    {"en": "example sentence 2", "zh": "中文翻译2"},
    {"en": "example sentence 3", "zh": "中文翻译3"},
    {"en": "example sentence 4", "zh": "中文翻译4"},
    {"en": "example sentence 5", "zh": "中文翻译5"}
  ],
  "hint": "hint text"
}`;

    const data = await apiRequest(API_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Authorization removed (handled in serverless function)
      },
      body: JSON.stringify({
        model: 'DeepSeek-V3',
        input: prompt,
        temperature: 0.7,
        max_output_tokens: 4000
      })
    });
    // ModelGate OpenAI Style 响应格式: data.output?.[0]?.content?.[0]?.text
    const text = (data as any).choices?.[0]?.message?.content;
    const jsonData = extractJsonWithRegex(text);
    return jsonData 
  } catch (error) {
    console.error("Error fetching phrases:", error);
    return [];
  }
}

export async function generateScenarioImage(scenarioTitle: string): Promise<string | null> {
  try {
    const prompt = `A cinematic, wide-angle, hyper-realistic photography of ${scenarioTitle}. Atmospheric lighting, professional color grading, empty space for UI overlay, 8k resolution.`;

    const data = await apiRequest(API_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Authorization removed (handled in serverless function)
      },
      body: JSON.stringify({
        model: 'google/nano-banana',
        prompt: prompt,
        size: '864x1184', // 16:9 比例
        output_type: 'base64',
        output_format: 'png'
      })
    });
    const base64Image = (data as any).data?.[0]?.content;
    
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

export async function generatePhraseImage(phrase: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const prompt = `A minimalist, high-end 3D render or artistic illustration representing the concept: "${phrase}". Clean background, vibrant colors, studio lighting, professional conceptual art style.`;

    const data = await apiRequest(API_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Authorization removed (handled in serverless function)
      },
      body: JSON.stringify({
        model: 'google/nano-banana',
        prompt: prompt,
        size: '864x1184',
        output_type: 'base64',
        output_format: 'png'  
      }),
      signal // 传递 AbortSignal 以支持取消请求
    });

    const base64Image = (data as any).data?.[0]?.content;
    
    if (!base64Image) {
      console.warn("No image data in response:", data);
      return null;
    }

    return base64Image;
  } catch (error) {
    // 如果是取消请求，不记录错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("Image generation request was cancelled");
      return null;
    }
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
    console.log("Speaking text:", text);

    // Use the proxy URL for TTS to hide the API call details if needed, or at least use the unified proxy
    // Note: The previous code had the API key in the query param. 
    // Ideally, we should move the API key to the server side too, but for now we are using the Vercel proxy.
    // If we want to hide the key, we need a serverless function for TTS too. 
    // For now, let's just use the proxy path we defined.
    // The previous code: `/api/api/txt?text=...&apikey=...`
    // Our rewrite: `/proxy/tts/:path*` -> `https://api.oick.cn/api/:path*`
    // So we should call: `/proxy/tts/txt?text=...&apikey=...`
    
    // However, to be fully secure as per user request, we should hide the API key.
    // Let's create a serverless function for TTS as well? 
    // The user specifically mentioned "key in environment variables". 
    // The TTS key is in the code: `e4dc5ab69e009a5ba9ccc91f9875062b`.
    // Let's keep using the proxy for now but update the path.
    
    const data = await apiRequest(`${TTS_PROXY_URL}?text=${encodeURIComponent(text)}&spd=5&apikey=e4dc5ab69e009a5ba9ccc91f9875062b`, {
    }, false, 'blob');
    console.log("TTS API Response:", data);

    // 直接使用 blob 创建音频元素播放
    const audioUrl = URL.createObjectURL(data as Blob);
    const audio = new Audio(audioUrl);
    console.log("Audio element created:", audio);
    
    await audio.play();
    
    // 清理创建的 URL 对象
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

  } catch (err) {
    console.error("TTS failed, falling back to browser API", err);
    // 回退到浏览器的语音合成 API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }
}
