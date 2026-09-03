# THE FORGE — Engineering Problem-Solving Simulator ⚡

**THE FORGE** is an open-source, deliberate-practice engineering simulator designed for developers, competitive programmers, and software engineers to practice system design, algorithms, debugging, reverse engineering, and competitive programming.

![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Architecture](https://img.shields.io/badge/architecture-Zero--Build--Single--File-brightgreen.svg)
![Problems](https://img.shields.io/badge/problems-76--Active--Challenges-blue.svg)

---

## 🌟 Key Features

- **76 High-Caliber Engineering Problems**:
  - **Competitive Programming** (Levels 7–8: Heavy-Light Decomposition, Convex Hull Trick, FFT, Suffix Automaton, Min-Cost Max-Flow, Dominator Trees).
  - **Beginner to Intermediate Algorithms** (Levels 1–4: Sliding Window, Two Pointers, Dynamic Programming, Binary Search, Stacks, Matrices).
  - **System Design & Architecture** (Distributed LLM Gateways, Rate Limiters, Consistent Hashing, RBAC Bitmasks).
  - **Debugging & Reverse Engineering** (Concurrency Race Conditions, Webhook Deadlocks, Binary Protocols).

- **In-Browser Execution Console & Monaco Editor**:
  - Monaco Editor CDN with `vs-dark` theme, language switching (Python 3.11 & JavaScript ES6), document formatting, and real-time execution console.

- **Live AI Sparring & Tutoring**:
  - **`✨ AI Hint`**: Real-time Socratic guidance directly inside the workspace without revealing the code solution.
  - **`💡 AI Simplify Spec`**: Beginner-friendly ELI5 breakdown of complex academic or algorithmic problems.
  - **AI Solution Grading**: Automatic LLM scoring (`0-100%`) evaluating your code and Reasoning Journal.

- **Responsive Mobile & Desktop System**:
  - Full desktop layout with sidebar rail.
  - Mobile bottom navigation dock (`< 950px`) with touch feedback and clean single-word tabs.

---

## 🚀 Quick Start

No build steps or `npm install` required! Simply clone and open `index.html` in any modern web browser or serve static files:

```bash
# Clone the repository
git clone https://github.com/bilalshemsu1/The-Forge.git

# Navigate into directory
cd The-Forge

# Serve locally with Python or any static web server
python -m http.server 8000
```

Open `http://localhost:8000` in your web browser.

---

## 🛠️ Configuration (Optional LLM Integration)

To connect **THE FORGE** to live AI models (OpenAI, Groq, Ollama, etc.):
1. Click **Settings** (`#settings`) in the sidebar/navigation bar.
2. Enter your OpenAI-compatible API endpoint URL (e.g. `https://api.openai.com/v1/chat/completions`).
3. Enter your API Key and Model Identifier (e.g. `gpt-4o`).
4. Click **Save Config**.

*(Note: In Local Mode without an API key, fallback intelligent Socratic guidance is provided automatically).*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
