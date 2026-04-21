const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { system, user } = req.body;

  if (!system || !user) {
    return res.status(400).json({ error: 'Missing system or user message' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    const data = await response.json();

    console.log('Groq response:', JSON.stringify(data));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: 'Empty response from AI' });
    }

    res.json({ result });

  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
