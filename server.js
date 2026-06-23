/**
 * LUNA ARENA — Claude AI Proxy Server
 * 
 * Keeps your Anthropic API key secure on the server side.
 * The browser talks to /api/chat on this server,
 * and this server forwards to api.anthropic.com.
 * 
 * Usage:
 *   npm install
 *   ANTHROPIC_API_KEY=sk-ant-... node server.js
 *   Then open http://localhost:3000
 */

const express  = require('express');
const cors     = require('cors');
const fetch    = require('node-fetch');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
    console.error('\n❌  Missing ANTHROPIC_API_KEY environment variable.');
    console.error('    Run: ANTHROPIC_API_KEY=sk-ant-... node server.js\n');
    process.exit(1);
}

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

// Serve all your HTML/CSS/JS files from the same folder
app.use(express.static(path.join(__dirname)));

/* ── System prompt — full site knowledge ── */
const SYSTEM_PROMPT = `You are LUNA_ASSIST — the official AI assistant for Luna Arena, a women's competitive esports organization for Season 2026. You speak with a cool, cyberpunk-tinged personality: confident, supportive, and knowledgeable. Keep answers concise (2-4 sentences max) unless asked for details.

Here is everything you know about Luna Arena:

=== ORGANIZATION ===
- Name: Luna Arena (also called "Neon Arena")
- Tagline: "The Future of Competitive Play is Female`