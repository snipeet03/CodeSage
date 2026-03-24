import Groq from "groq-sdk";

// Lazy client — only created when /query is called, NOT at startup
let _groq = null;

const getGroq = () => {
    if (!_groq) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error(
                "GROQ_API_KEY is not set. Add it to backend/.env and restart."
            );
        }
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
};

const SYSTEM_PROMPT = `You are a senior software engineer and code intelligence assistant.
You help developers understand unfamiliar codebases by analyzing the provided code context and answering questions accurately.

RULES:
1. Answer ONLY from the provided code context. Do not hallucinate or invent code that isn't shown.
2. Always reference the specific file(s) where logic is implemented using the format: \`[filename]\`.
3. Explain step-by-step how the logic works.
4. If the context does not contain enough information to answer, say so explicitly.
5. Format code snippets with markdown code blocks.
6. Be concise but thorough. Avoid unnecessary filler.
7. If multiple files are involved, trace the flow across them.`;

const buildPrompt = (question, context) => `
## Codebase Context
${context}

---

## Developer Question
${question}

## Instructions
- Answer using ONLY the code shown above.
- Reference specific files in your answer using \`[filename]\`.
- Explain step by step.
- If the answer spans multiple files, trace the call/data flow.
`;

export const askLLM = async (question, context) => {
    const groq = getGroq();
    const prompt = buildPrompt(question, context);

    const callModel = async (model) => {
        const response = await groq.chat.completions.create({
            model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 1500,
        });
        return response.choices[0].message.content;
    };

    try {
        return await callModel("llama3-70b-8192");
    } catch (err) {
        if (err.status === 429 || err.message?.includes("quota") || err.message?.includes("rate")) {
            console.warn("⚠️  Falling back to mixtral-8x7b-32768");
            return await callModel("mixtral-8x7b-32768");
        }
        throw err;
    }
};