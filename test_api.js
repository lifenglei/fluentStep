import https from 'https';

const options = {
  hostname: 'mg.aid.pub',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'authorization': 'Bearer sk-2c21afad-0faf-48f6-830c-c76728af3ea4',
    'content-type': 'application/json',
    'origin': 'http://localhost:3000',
    'referer': 'http://localhost:3000/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
  }
};

const data = JSON.stringify({
  "model": "gemini-3-flash",
  "input": "Generate 10 common English phrases for a learning scenario: \"机场英语 (Airport)\". \nEach phrase must have one keyword replaced with \"___\" for a cloze test. \nThe keyword should be essential but challenging.\nIMPORTANT: \n1. Provide the Chinese translation for JUST that missing keyword.\n2. Provide the standard IPA (International Phonetic Alphabet) for the 'correctAnswer' word in the 'phonetic' field.\n3. Provide EXACTLY 5 diverse example sentences using the 'correctAnswer' word.\n4. Each example must have both 'en' (English) and 'zh' (Chinese translation).\n5. Provide the part of speech (partOfSpeech) for the 'correctAnswer' word (e.g., \"noun\", \"verb\", \"adjective\", \"adverb\").\n6. Provide 2-3 common collocations (commonCollocations) - phrases or words that commonly go with the 'correctAnswer' word. Each collocation must include both English and Chinese translation in the format {\"en\": \"collocation\", \"zh\": \"中文翻译\"}.\nReturn the data in a structured JSON format as an array of objects with the following structure:\n{\n  \"id\": \"unique-id\",\n  \"sentenceWithBlank\": \"sentence with ___\",\n  \"correctAnswer\": \"word\",\n  \"correctAnswerChinese\": \"中文翻译\",\n  \"chineseMeaning\": \"完整句子中文翻译\",\n  \"phonetic\": \"/IPA符号/\",\n  \"partOfSpeech\": \"noun\",\n  \"commonCollocations\": [{\"en\": \"collocation 1\", \"zh\": \"搭配1翻译\"}, {\"en\": \"collocation 2\", \"zh\": \"搭配2翻译\"}],\n  \"additionalExamples\": [\n    {\"en\": \"example sentence 1\", \"zh\": \"中文翻译1\"},\n    {\"en\": \"example sentence 2\", \"zh\": \"中文翻译2\"},\n    {\"en\": \"example sentence 3\", \"zh\": \"中文翻译3\"},\n    {\"en\": \"example sentence 4\", \"zh\": \"中文翻译4\"},\n    {\"en\": \"example sentence 5\", \"zh\": \"中文翻译5\"}\n  ],\n  \"hint\": \"hint text\"\n}",
  "temperature": 0.7,
  "max_output_tokens": 4000
});

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', d => {
    responseData += d;
  });
  
  res.on('end', () => {
    console.log('Response data:');
    console.log(responseData);
    
    // Try to parse JSON
    try {
      const jsonData = JSON.parse(responseData);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('\nJSON Parse Error:');
      console.log(error);
      
      // Show error context
      const errorPosition = error.message.match(/position (\d+)/)?.[1] || '0';
      const pos = parseInt(errorPosition);
      const contextStart = Math.max(0, pos - 50);
      const contextEnd = Math.min(responseData.length, pos + 50);
      console.log(`\nError context (around position ${pos}):`);
      console.log(responseData.substring(contextStart, pos) + '<ERROR>' + responseData.substring(pos, contextEnd));
    }
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
