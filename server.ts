import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API Routes
  app.post('/api/generate-website', async (req, res) => {
    try {
      const { prompt, options, userApiKey } = req.body;

      // Determine API key to use
      let apiKey = userApiKey?.trim();
      if (!apiKey || apiKey.startsWith('sk-or-v1-b2dc96fd')) {
        apiKey = process.env.GEMINI_API_KEY || '';
      }

      if (!apiKey) {
        // No key provided and no environment key, fall back gracefully
        return res.status(400).json({ error: 'No API key available. Please provide a Gemini API key or OpenRouter API key.' });
      }

      // Check if user provided an OpenRouter key or Gemini key
      if (apiKey.startsWith('sk-or-')) {
        // OpenRouter call with constrained max_tokens so it fits credit budget
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai.studio',
            'X-Title': 'Utilix AI Website Generator'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            max_tokens: 8000,
            messages: [
              {
                role: 'system',
                content: getWebsiteGenerationSystemPrompt()
              },
              {
                role: 'user',
                content: buildUserPrompt(prompt, options)
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return res.json({ result: JSON.parse(content) });
      } else {
        // Gemini API call
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: buildUserPrompt(prompt, options),
          config: {
            systemInstruction: getWebsiteGenerationSystemPrompt(),
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        return res.json({ result: JSON.parse(text) });
      }
    } catch (error: any) {
      console.error('API Generation Error:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to generate website with AI' 
      });
    }
  });

  app.post('/api/modify-website', async (req, res) => {
    try {
      const { instruction, currentFiles, userApiKey } = req.body;
      let apiKey = userApiKey?.trim();
      if (!apiKey || apiKey.startsWith('sk-or-v1-b2dc96fd')) {
        apiKey = process.env.GEMINI_API_KEY || '';
      }

      if (!apiKey) {
        return res.status(400).json({ error: 'No API key available.' });
      }

      const promptText = `
User instruction: "${instruction}"

Current Files:
${JSON.stringify(currentFiles, null, 2)}

Return a JSON object containing an array of modified or added files:
{
  "modifiedFiles": [
    { "path": "index.html", "name": "index.html", "type": "html", "content": "..." }
  ]
}
Modify only the files needed to complete the user instruction. Ensure valid HTML/CSS/JS.`;

      if (apiKey.startsWith('sk-or-')) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            max_tokens: 8000,
            messages: [
              {
                role: 'system',
                content: 'You are an expert AI web developer. Modify the existing HTML/CSS/JS files according to user instructions.'
              },
              { role: 'user', content: promptText }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${await response.text()}`);
        }
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return res.json({ result: JSON.parse(content) });
      } else {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            systemInstruction: 'You are an expert AI web developer. Modify the existing website files as instructed.',
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        return res.json({ result: JSON.parse(text) });
      }
    } catch (error: any) {
      console.error('API Modification Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to modify website' });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function getWebsiteGenerationSystemPrompt(): string {
  return `You are an elite AI Website Creator & Architect.
Generate a complete, modern, fully functional multi-page website based on user input.

JSON OUTPUT REQUIREMENT:
You MUST respond with a single JSON object structured as follows:
{
  "projectName": "Name of the website project",
  "description": "Short project description",
  "type": "business | portfolio | agency | ecommerce | saas | restaurant | etc.",
  "files": [
    {
      "path": "index.html",
      "name": "index.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "about.html",
      "name": "about.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "services.html",
      "name": "services.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "contact.html",
      "name": "contact.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "css/style.css",
      "name": "style.css",
      "type": "css",
      "content": "/* CSS styles */"
    },
    {
      "path": "js/script.js",
      "name": "script.js",
      "type": "js",
      "content": "// JavaScript logic"
    }
  ]
}

STRICT STANDARDS:
1. Every requested page must be generated as a distinct HTML file (e.g. index.html, about.html, services.html, contact.html).
2. Navigation bar on all pages must link to the actual relative HTML files (e.g. <a href="index.html">, <a href="about.html">, <a href="services.html">, <a href="contact.html">).
3. All HTML files must link to <link rel="stylesheet" href="css/style.css"> (or href="../css/style.css" if nested) and <script src="js/script.js" defer></script>.
4. Use modern CSS (CSS variables, Flexbox, Grid, smooth transitions, mobile responsiveness, dark/light theme options). Include Google Fonts link (e.g. Inter / Plus Jakarta Sans) in HTML <head>.
5. Include rich, realistic copy (NO lorem ipsum placeholders!).
6. Include JavaScript interactivity (e.g., mobile hamburger menu, interactive tabs, form validation with feedback message, scroll animations).
7. Return ONLY valid JSON. Do not include markdown backticks around the JSON.`;
}

function buildUserPrompt(prompt: string, options: any): string {
  const pagesCount = options?.pagesCount || 5;
  const style = options?.style || 'Modern';
  const type = options?.type || 'Business';
  const colors = options?.colors || 'Default theme palette';
  const typography = options?.typography || 'Modern clean';
  const animations = options?.animations || 'Smooth';

  return `Create a ${pagesCount}-page ${type} website based on this request:
"${prompt}"

Configuration:
- Website Type: ${type}
- Target Number of Pages: ${pagesCount} (generate index.html + page HTMLs)
- Design Style: ${style}
- Color Scheme: ${colors}
- Typography Style: ${typography}
- Animations: ${animations}

Provide realistic content, modern layout, full styling in css/style.css and interactivity in js/script.js.`;
}

startServer();
