const ALLOWED_ORIGIN = "https://amksoul3429-ui.github.io";
const MODEL = "@cf/meta/llama-3.1-8b-instruct";

const SYSTEM_PROMPT = `You are AERIS, the hybrid intelligence inside ARVENA, a private personal intelligence system.
You have three operating modes:
- COMMANDER: help the user define realistic missions, priorities, accountability and next actions. Be firm but balanced; never shame.
- COMPANION: listen carefully, validate feelings without pretending to be human, and offer grounded encouragement.
- STRATEGIST: explain concepts, research questions, planning, study, analysis and problem-solving in a structured way.
If the latest user message begins with [ACTIVE AERIS PERSONA: COMMANDER], operate strictly as COMMANDER for this response. If it begins with [ACTIVE AERIS PERSONA: COMPANION], operate strictly as COMPANION. If it begins with [ACTIVE AERIS PERSONA: STRATEGIST], operate strictly as STRATEGIST. Otherwise choose the mode that best fits the request; the user can also explicitly name a mode.
Be accurate, transparent about uncertainty, and distinguish facts from assumptions. Do not invent sources, citations, app capabilities, or completed actions.
You cannot directly change ARVENA data, create missions, spend credits, send messages, make purchases, or perform external actions. You may prepare a proposed action, but state clearly that the user must confirm and complete it in the relevant ARVENA module.
For plans, ask only for essential missing information; otherwise make a useful first draft and state reasonable assumptions.
Use clear, practical language. The user is in India; use Indian context and units when relevant. `;

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, X-ARVENA-ACCESS",
      "vary": "Origin"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) return new Response("Origin not allowed", { status: 403 });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "access-control-allow-origin": ALLOWED_ORIGIN,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "Content-Type, X-ARVENA-ACCESS",
        "access-control-max-age": "86400",
        "vary": "Origin"
      }});
    }
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin);
    if (!env.ARVENA_ACCESS_TOKEN || request.headers.get("X-ARVENA-ACCESS") !== env.ARVENA_ACCESS_TOKEN) {
      return json({ error: "Access token is missing or incorrect." }, 401, origin);
    }
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 24000) return json({ error: "Message is too large." }, 413, origin);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Invalid JSON request." }, 400, origin); }

    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 16) {
      return json({ error: "Send between 1 and 16 conversation messages." }, 400, origin);
    }
    const messages = body.messages.map(item => {
      const role = item?.role === "assistant" ? "assistant" : "user";
      const content = typeof item?.content === "string" ? item.content.slice(0, 5000) : "";
      return { role, content };
    }).filter(item => item.content.trim());

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return json({ error: "The latest message must be from the user." }, 400, origin);
    }

    try {
      const result = await env.AI.run(MODEL, {
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 900,
        temperature: 0.65
      });
      const answer = typeof result?.response === "string" ? result.response.trim() : "";
      if (!answer) return json({ error: "The AI provider returned an empty response. Try again shortly." }, 502, origin);
      return json({ reply: answer, model: MODEL }, 200, origin);
    } catch (error) {
      return json({ error: "AERIS could not reach the AI model. The free service may be temporarily unavailable or its daily allowance may have been reached." }, 503, origin);
    }
  }
};
