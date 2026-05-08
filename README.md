# 🏅 USA Wrapped

> **License:** Apache 2.0 — See [LICENSE](./LICENSE) for details.

**USA Wrapped** is a personalized, AI-powered dashboard that lets users discover their Team USA athletic identity. Inspired by Spotify Wrapped, it analyzes your physical metrics and matches them against historical Team USA performance data from US-hosted Olympic and Paralympic Games — then generates a unique "Athletic Archetype" powered by Google Gemini.

Built by **Sagar Sahu** for the 2025 Google Cloud Hackathon.

---

## 🌐 Live Demo

> **[https://usa-wrapped-google-cloud-XXXXXXXX-uc.a.run.app](https://usa-wrapped-google-cloud-XXXXXXXX-uc.a.run.app)**
> *(Replace with your actual Cloud Run URL)*

---

## 📋 Project Overview

USA Wrapped combines historical Olympic data, real-time AI generation, and an interactive dashboard to create a deeply personal Team USA experience. Users input their physical metrics (height, weight, strength, agility, endurance) and receive:

- 🏆 **A Personalized Athletic Archetype** — AI-generated title based on their physical profile
- 📊 **A Bento-Style Dashboard** — Medal distributions, participation trends, geographic heat maps, and a state-level performance radar chart
- 🤖 **Ask Gemini** — A live AI historian chat grounded in official `teamusa.com` content via Vertex AI Search
- 🎲 **Coaching Corner** — Quirky historical Team USA trivia powered by Gemini
- ✨ **Surprise Me** — AI-generated research questions for users who need inspiration

### Data Compliance
All data is sourced exclusively from publicly available Team USA datasets:
- **Historical Olympic data** filtered strictly for Team USA athletes (NOC = USA), further narrowed to US-hosted Games only
- **Official Team USA website** (`teamusa.com`) indexed via Vertex AI Search
- **No NIL violations** — all individual athlete identities are anonymized via MD5 hashing. The AI is explicitly instructed never to name specific athletes

---

## 🛠️ Tech Stack

### Languages & Frameworks
| Technology | Role |
| :--- | :--- |
| **TypeScript / TSX** | Frontend components and pages |
| **JavaScript (Node.js)** | API route handlers |
| **Python** | ETL data processing (`scripts/etl.py`) |
| **Next.js 14** | Full-stack framework (SSR + API Routes) |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **D3.js** | Geographic US heat map visualization |
| **Three.js / GLSL** | 3D animated hero background |

### Google Cloud Integrations
| Service | Purpose |
| :--- | :--- |
| **Cloud Run** | Containerized hosting with auto-scaling, GitHub CI/CD |
| **Cloud Build** | Automated Docker image builds on every GitHub push |
| **Artifact Registry** | Stores built Docker container images |
| **Secret Manager** | Secure storage of project credentials |
| **Cloud Logging** | Real-time NIL compliance monitoring and audit trail |
| **Vertex AI (Gemini 2.5 Pro)** | Athletic Archetype generation, AI historian chat, Coaching Corner trivia, Surprise Me prompts |
| **Vertex AI Search (Discovery Engine)** | Indexes `teamusa.com` for grounded, citation-backed chat responses |

### Specific Vertex AI Features Used
- **`gemini-2.5-pro`** via `@google/genai` SDK for all generative text
- **Vertex AI Search / Discovery Engine** — Website data store crawling `www.teamusa.com/*` for live RAG grounding
- **Dual-Grounding Architecture** — Combines local JSON athlete data + live Vertex Search results before each Gemini call
- **Safety & NIL Guardrails** — Server-side prompt hardening to enforce compliant output at every generation call

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js 20+
- A Google Cloud project with **Vertex AI API** enabled
- Google Cloud credentials configured locally

### 1. Clone the Repository
```bash
git clone https://github.com/sagars2004/USA-Wrapped-Google-Cloud.git
cd USA-Wrapped-Google-Cloud
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the project root:
```env
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
VERTEX_SEARCH_ENGINE_ID=your-vertex-search-engine-id
```

### 4. Authenticate with Google Cloud (for local AI calls)
```bash
gcloud auth application-default login
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Project

### Full User Flow Test
1. **Landing Page:** Enter your name, state, and physical metrics → Click **"Get My Wrapped"**
2. **Dashboard:** Verify all 6 tiles render with data (Medal Distribution, Archetype, Participation Trend, Coaching Corner, US Heat Map, Ask Gemini)
3. **Archetype Tile:** Should display a unique AI-generated title (e.g., "The Versatile Competitor")
4. **Ask Gemini Chat:** Type a question like *"What sports dominated the Olympic Games Atlanta 1996?"* and verify a grounded response
5. **Surprise Me Button (✨):** Click the sparkle button in the chat and verify a full, complete question is generated
6. **Coaching Corner:** Verify a quirky Team USA historical fact is displayed

### API Endpoint Tests
```bash
# Test the wrapped stats endpoint
curl http://localhost:3000/api/wrapped-stats

# Test archetype generation (POST)
curl -X POST http://localhost:3000/api/generate-archetype \
  -H "Content-Type: application/json" \
  -d '{"height":70,"weight":165,"strength":7,"endurance":6,"agility":8,"wingspan":71}'

# Test the Surprise Me prompt generator
curl http://localhost:3000/api/surprise-me
```

---

## 📦 Project Structure

```
├── components/ui/        # All dashboard UI components
│   ├── ai-chat-input.tsx     # Ask Gemini chat with Surprise Me
│   ├── coaching-corner.tsx   # Historical trivia tile
│   ├── medal-distribution.tsx
│   ├── participation-trend.tsx
│   ├── us-heatmap.tsx        # D3 geographic visualization
│   └── radar-chart.tsx       # Physical metrics radar
├── pages/
│   ├── index.tsx         # Landing page with metric input form
│   ├── wrapped.tsx       # Main dashboard (bento grid layout)
│   └── api/
│       ├── chat.js           # Dual-grounded Gemini + Vertex Search
│       ├── generate-archetype.js
│       ├── surprise-me.js
│       └── wrapped-stats.js  # Reads from usa_athletes.json
├── data/
│   └── usa_athletes.json     # ETL-processed, NIL-safe Team USA records
├── scripts/
│   └── etl.py                # Data pipeline: Kaggle → compliance-safe JSON
├── Dockerfile                # Multi-stage production build for Cloud Run
└── next.config.mjs
```

---

## 📄 License

This project is licensed under the **Apache License 2.0**.
See the [LICENSE](./LICENSE) file for full details.
