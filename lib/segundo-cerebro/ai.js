// Camada de IA: estrutura o que o dono captura e responde perguntas
// puxando contexto das notas da empresa. Sem ANTHROPIC_API_KEY, cai em
// fallbacks simples (sem IA) — mesmo padrão usado em lib/copywriter.js.

const MODEL = 'claude-haiku-4-5-20251001';

async function callClaude(prompt, maxTokens = 500) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content && data.content[0] && data.content[0].text;
  } catch {
    return null;
  }
}

function fallbackTitle(rawText) {
  const firstLine = rawText.trim().split('\n')[0] || 'Nota';
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
}

// rawText: o que o dono digitou/colou. area: id da área (ver areas.js).
// Retorna { title, summary, tags, source: 'ia' | 'template' }
export async function structureNote(rawText, areaLabel) {
  const text = await callClaude(
    `Você organiza anotações soltas de um dono de pequena/média empresa dentro do "segundo cérebro" da empresa.

Área desta anotação: ${areaLabel}
Anotação (como a pessoa escreveu, pode ter erros de digitação e ser desorganizada):
"""
${rawText}
"""

Responda SOMENTE com um JSON válido, sem comentários nem markdown, no formato:
{"title": "título curto (até 8 palavras)", "summary": "resumo estruturado em 2-5 linhas, em português, mantendo todos os fatos e números citados", "tags": ["tag1", "tag2"]}

Regras: não invente fatos que não estão na anotação. Tags: 1 a 4 palavras-chave curtas, minúsculas, sem acento.`,
    400
  );

  if (text) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : text);
      if (parsed.title && parsed.summary) {
        return {
          title: parsed.title,
          summary: parsed.summary,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [],
          source: 'ia',
        };
      }
    } catch {}
  }

  return { title: fallbackTitle(rawText), summary: rawText.trim(), tags: [], source: 'template' };
}

// question: pergunta do dono. notes: [{ area, title, summary/content, createdAt }]
export async function answerQuestion(question, notes) {
  if (!notes.length) {
    return {
      answer: 'Ainda não há nenhuma nota salva. Capture algumas anotações nas áreas primeiro, aí eu consigo responder com base nelas.',
      source: 'template',
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      answer:
        'A busca por IA está desativada (falta configurar ANTHROPIC_API_KEY). Aqui estão as notas mais recentes que podem ajudar:\n\n' +
        notes
          .slice(0, 5)
          .map((n) => `• [${n.area}] ${n.title}`)
          .join('\n'),
      source: 'template',
    };
  }

  // Sem volume pra justificar embeddings ainda: manda as notas mais
  // relevantes por sobreposição simples de palavras com a pergunta.
  const qWords = new Set(question.toLowerCase().match(/\p{L}+/gu) || []);
  const scored = notes
    .map((n) => {
      const haystack = `${n.title} ${n.content || n.summary || ''}`.toLowerCase();
      const words = haystack.match(/\p{L}+/gu) || [];
      const overlap = words.filter((w) => qWords.has(w)).length;
      return { note: n, score: overlap };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.note);

  const context = scored
    .map((n) => `### [${n.area}] ${n.title} (${(n.createdAt || '').slice(0, 10)})\n${n.content || n.summary}`)
    .join('\n\n');

  const text = await callClaude(
    `Você é o "segundo cérebro" de uma pequena/média empresa: responde perguntas do dono usando SOMENTE as notas abaixo.

${context}

Pergunta do dono: "${question}"

Regras: responda em português, direto ao ponto. Cite de qual área veio cada informação usada. Se as notas não tiverem a resposta, diga isso claramente em vez de inventar.`,
    700
  );

  if (text) return { answer: text, source: 'ia' };

  return {
    answer:
      'Não consegui consultar a IA agora. Aqui estão as notas mais relevantes que encontrei:\n\n' +
      scored.map((n) => `• [${n.area}] ${n.title}`).join('\n'),
    source: 'template',
  };
}
