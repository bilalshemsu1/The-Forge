# THE FORGE — Engineering Problem-Solving & Critical Thinking Simulator ⚡

> **"In the era of Generative AI, outsourcing your thinking creates initial productivity gains—but slowly erodes your core problem-solving ability, critical analysis, and architectural decision-making. THE FORGE is built to solve this."**

![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Architecture](https://img.shields.io/badge/architecture-Zero--Build--PWA-brightgreen.svg)
![Problems](https://img.shields.io/badge/problems-106--Active--Challenges-blue.svg)
![Languages](https://img.shields.io/badge/languages-Python_3.11_%7C_JavaScript-ember.svg)

---

## 🎯 The Philosophy & Core Mission

In today’s AI-dominated landscape, developers increasingly rely on AI to generate immediate code snippets. While this feels fast in the short term, over time it quietly drains a programmer's most critical assets:
- **Logical Reasoning & Deep Analytical Thinking**
- **Independent Problem Investigation & Debugging**
- **Uncompromising Invariant & Edge Case Analysis**
- **Confident Architectural & Algorithmic Decision-Making**

**THE FORGE** is an open-source, deliberate-practice engineering simulator designed to reclaim your technical mastery. By transforming real-world software engineering challenges, system design bottlenecks, and competitive programming puzzles into an engaging, gamified simulator, **THE FORGE forces you to think, dig, and conquer problems on your own.**

---

## 🏆 Core Skill Domains & Gamification

**THE FORGE** challenges you with authentic software engineering problems across **5 core skill domains**:

1. **Algorithms**: Array bounds, sliding windows, dynamic programming, binary search, segment trees with lazy propagation, and Heavy-Light Decomposition.
2. **System Design**: High-throughput distributed rate limiters, vector database RAG text chunkers, eventual-consistency KV stores, and multi-provider LLM routers.
3. **Debugging**: Resolving TOCTOU race conditions, concurrent ledger wallet deductions, and Fastify webhook event loop deadlocks.
4. **Reverse Engineering**: Bitmask role-based access control (RBAC) engines, custom wire protocols, and permissions evaluation logic.
5. **Read & Reconstruct**: Reading multi-file technical RFC specifications (e.g., IETF RFC 2697 Single Rate Three Color Marker) and implementing matching software contracts.

### 🎮 The Elo Rating System
- **1000 Baseline Elo**: Track independent skill ratings across all 5 domain categories.
- **Growth Zone Targeting**: Problem bank automatically filters and highlights challenges tailored to your cognitive growth threshold (+100 to +300 Elo above your rating).
- **Reasoning Journal Mandate**: Every submission requires a minimum 20-word written articulation of your strategy, invariants, and failure modes.
- **3-Tier Hint Ladder**: Unlock Tier 1 (Socratic guidance), Tier 2 (Named concepts & pseudocode), or Tier 3 (Detailed approach) with calculated Elo penalties.
- **Strict Verification Gatekeeper**: Untouched starter code and failing unit test assertions are **hard-blocked** from submission.

---

## 💻 Sandboxed In-Browser Execution Engine

Solve problems directly in your browser with zero server-side compilation delays:

- 🐍 **Python 3.11 (WASM Pyodide Engine)**: Full Python standard library execution compiled to WebAssembly.
- 🟨 **JavaScript (Web Worker Sandbox)**: Isolated Web Worker execution thread with a 5-second automatic timeout killswitch to prevent infinite loops.

---

## 💡 AI Integration: Sparring Partner & Evaluator

In **THE FORGE**, AI acts strictly as a mentor, reviewer, and sparring partner—never as a solution code generator:

- **🤖 AI Sparring Partner**: Ask questions about time/space complexity bounds, edge cases, or architectural strategies without spoiling the solution code.
- **✨ AI Reasoning Journal Drafter**: Helps refine your rough notes into clear, 20+ word technical reasoning journal entries.
- **🎓 Senior Engineering Reviewer**: Performs automated code and design reviews, returning quality scores (1–5), strengths, architectural gaps, and open-thread follow-up questions.
- **📑 AI Problem Import & Curation Engine**: Restructures raw writeups, blog posts, or CVE descriptions into standard schema for your local problem bank.
- **🔒 Privacy-First API Integration**: Supports any OpenAI-compatible API endpoint (OpenAI, Anyscale, Ollama, LocalAI). Your API key is saved strictly in your browser's `localStorage`.

---

## 🌐 Offline PWA & Data Sovereignty

- **PWA Ready**: Registered Service Worker (`sw.js`) and Web Manifest (`manifest.json`) support offline caching and home screen installation.
- **Local-First Persistence**: 100% of attempt history, skill ratings, retrospective notes, and custom problems remain in your browser's local storage.
- **Data Export & Import**: Export your complete simulator progress and problem bank to JSON for local backup or migration anytime.

---

## 🚀 Quick Start (Zero Build Required)

No `npm install` or build step required! Simply clone the repository and serve `index.html` with any static web server:

```bash
# Clone the repository
git clone https://github.com/bilalshemsu1/The-Forge.git

# Navigate into directory
cd The-Forge

# Serve locally with Python
python -m http.server 8000
```

Open `http://localhost:8000` in your web browser.

---

## 📄 License

Distributed under the MIT License. Built with passion for engineers who love to solve hard problems.
