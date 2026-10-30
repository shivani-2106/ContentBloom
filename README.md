# ContentBloom AI

> **Multi-Format AI Content Studio** — Repurpose raw ideas into high-performing content for LinkedIn, Instagram, YouTube Shorts, and Carousels with live platform previews, calibrated image prompts, and video storyboards.

---

## 🌟 Overview & Key Features

ContentBloom AI is a modern full-stack social media studio powered by FastAPI and Google Gemini AI. Rather than manually rewriting content for different channels, creators can input a single source document or outline and generate platform-native assets instantly.

### Core Features

1. **✨ 4-in-1 Multi-Format Generation (`/generate-all`)**:
   - Simultaneously generates **LinkedIn posts**, **Instagram captions**, **YouTube Shorts scripts**, and **Carousel slide decks** from one source input.
   - **Regenerate All** and **Improve All** actions for rapid AI-powered iteration.
   - **Live In-Place Editing**: Tweak generated copy with real-time character counting.
   - **Interactive Platform Previews**: Realistic mockups for LinkedIn feed cards, Instagram posts with reaction bars, 9:16 Shorts phone frames, and interactive slide-by-slide carousel decks.
   - **Per-Card View Toggles**: Switch between `[ ✏️ Edit ]`, `[ 👁️ Preview ]`, or `[ ⊞ Both ]` on every format card.
   - **Individual & Batch Export**: Copy or download individual formats or download all 4 formats bundled in a single `.txt` file.
   - **📸 High-Res Carousel Slide PNG Exporter**: Download individual slide PNGs or export all slides in batch at 1080×1350 resolution.

2. **🎨 Actual Graphic Designer & Image Studio (`/image-studio`)**:
   - **Dual-Mode Workflow**:
     - **Mode A: Visual Graphic Designer (Actual PNG Export)**: Real-time HTML5 canvas rendering for Instagram posts (1080×1080), Stories/Reels (1080×1920), LinkedIn graphics (1200×628), YouTube thumbnails (1280×720), and Carousel cards (1080×1350).
     - **5 Designer Themes**: Modern Minimalist, Vibrant Gradient, Cyberpunk Tech, Clean Editorial Light, and Creator Sunset.
     - **Live Customization**: Real-time headline, subhead, badge, and brand handle editor with instant canvas re-render and high-res PNG download.
     - **Mode B: AI Visual Concept & Diffusion Prompts**: Calibrated production prompts formatted for **Midjourney v6.0**, **DALL-E 3 / ChatGPT**, and Canva AI with 1-click apply to the Graphic Designer.

3. **🎬 Playable Video Studio & Storyboard Engine (`/video-studio`)**:
   - **Production Storyboard Generator**: 3-second retention hook, scene-by-scene timing, voiceover narration, on-screen text, transition cues, and sound direction.
   - **▶️ Browser-Native 9:16 Video Renderer**: Renders actual animated video files (`.webm`) with kinetic captions, smooth scene transitions, and synthesized audio track via Web Audio API at 30 FPS.
   - **Live Rendering Progress**: Shows real-time frame progress percentage, scene counter, and elapsed time.
   - **Interactive Video Player**: Embedded HTML5 `<video controls autoplay loop>` player with one-click download.

4. **🚀 30-Asset Campaign & Social Media Scheduler (`/campaign`)**:
   - **Omnichannel Growth Sprint**: Generates cohesive 10, 20, or 30-asset campaigns across LinkedIn, Instagram, YouTube Shorts, and Twitter/X.
   - **Automated UTM Parameters**: Fully configured UTM tracking links (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) for every asset.
   - **Optimal Posting Schedule**: Recommended day and time slot based on platform engagement benchmarks.
   - **Built-in Quality Validation**: Real-time validation checks for platform character limits, hashtag density, and Call-to-Action presence.
   - **Scheduler-Ready CSV Export**: Export formatted CSV compatible with Buffer, Hootsuite, Later, Sprout Social, or Google Sheets.

5. **📝 Single Post Studio (`/generate` & `/results`)**:
   - Targeted post generation for specific platforms (LinkedIn, Instagram, YouTube Shorts) and types (social post, video script, carousel).
   - Granular customization: 4 tones (Professional, Friendly, Witty, Inspirational), 5 audiences (Students, Creators, Startups, Businesses, General), target length, and hashtag/emoji toggles.
   - In-place editing, regeneration, improvement, clipboard copy, and text file export.

6. **📚 Content Library & History (`/history`)**:
   - Unified local browser storage for all generation types.
   - Filter tabs: `All`, `✨ 4-Format Collections`, `🎬 Video Storyboards`, `🎨 Image Specs`, `🚀 Campaigns`, and `📝 Single Posts`.
   - Interactive format tabs for multi-format collections.
   - Direct **"✏️ Open in Studio"** action to load saved items back into the editor with pre-filled inputs.
   - Per-item copy, individual download, batch download, individual deletion, and bulk clear with confirmation.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Vite 5 (Fast build & HMR)
  - Tailwind CSS 3 (Custom ContentBloom brand palette)
  - React Router DOM 6
  - Axios
- **Backend**:
  - FastAPI (Python 3.10+)
  - Pydantic v2 (Strict request/response validation)
  - Google GenAI SDK (`google-genai` / Gemini 3.5 Flash Lite)
  - Python-dotenv (Secure environment configuration)
  - Uvicorn (ASGI web server)
  - Pytest & pytest-asyncio (Automated unit testing)

---

## 📂 Project Structure

```
ContentBloom AI/
├── backend/                  # FastAPI Application
│   ├── main.py               # App entry, CORS, and router registration
│   ├── models.py             # Pydantic schemas (Request/Response models)
│   ├── pyproject.toml        # Pytest configuration
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Template for environment configuration
│   ├── routers/
│   │   └── generate.py       # API endpoints (/generate, /generate-all, etc.)
│   ├── services/
│   │   └── gemini_service.py # Gemini AI client & prompt engineering
│   └── tests/
│       └── test_gemini_service.py # Comprehensive unit test suite
│
├── frontend/                 # React + Vite Application
│   ├── package.json          # Node dependencies and scripts
│   ├── vite.config.js        # Vite dev server & backend proxy (:8081)
│   ├── tailwind.config.js    # Design tokens & color system
│   └── src/
│       ├── App.jsx           # Root router and layout shell
│       ├── index.css         # Global styles & Tailwind layers
│       ├── api/
│       │   └── contentApi.js # Centralized Axios API client
│       ├── components/
│       │   ├── Navbar.jsx    # Responsive navigation bar
│       │   ├── ErrorBanner.jsx
│       │   └── LoadingSpinner.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx # Landing page & feature showcase
│       │   ├── Generate.jsx  # Single format generator
│       │   ├── Results.jsx   # Single format output & editor
│       │   ├── GenerateAll.jsx # 4-in-1 signature studio
│       │   ├── ImageStudio.jsx # Visual prompt & concept studio
│       │   ├── VideoStudio.jsx # Video script & storyboard studio
│       │   └── History.jsx   # Multi-type content library
│       └── utils/
│           └── contentHistory.js # LocalStorage persistence utilities
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` folder based on `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key from Google AI Studio | *(Required)* |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.5-flash-lite` |

> 🔒 **Security Notice**: `backend/.env` is ignored by Git. API keys are strictly confined to the backend and never exposed to the frontend browser bundle.

---

## 🚀 Installation & Running

### Step 1: Start the Backend (Port 8081)

Open a terminal (Windows PowerShell):

```powershell
cd "D:\ContentBloom AI\backend"

# Activate Python virtual environment
.\.venv\Scripts\Activate.ps1

# Install requirements (if not already installed)
pip install -r requirements.txt

# Launch FastAPI on port 8081
uvicorn main:app --reload --port 8081
```

- API Health Check: `http://localhost:8081/health`
- Interactive Swagger Docs: `http://localhost:8081/docs`

### Step 2: Start the Frontend (Port 5173)

Open a second terminal:

```powershell
cd "D:\ContentBloom AI\frontend"

# Install dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run backend unit tests (all external Gemini calls are mocked):

```powershell
cd "D:\ContentBloom AI\backend"
.\.venv\Scripts\Activate.ps1
python -m pytest tests/
```

Run frontend production build verification:

```powershell
cd "D:\ContentBloom AI\frontend"
npm run build
```

---

## 🎯 Step-by-Step Demo Walkthrough

### 1. Multi-Format Studio (`/generate-all`)
1. Click **✨ 4-in-1 Studio** in the navigation bar.
2. In the source material box, paste an article, lecture note, or product pitch (min. 50 characters).
3. Select your desired Tone (e.g. *Professional*) and Audience (e.g. *Founders & Startups*).
4. Click **✨ Generate All Four Formats**.
5. Inspect the generated cards:
   - Click `[ 👁️ Preview ]` on LinkedIn to see the author card, hashtag styling, and interaction bar.
   - Click `[ 👁️ Preview ]` on YouTube Shorts to view the 9:16 phone mockup.
   - Click `[ 👁️ Preview ]` on Carousel to click through the interactive slide deck.
6. Edit text directly in any card; notice the preview updates live.
7. Click **✨ Improve All** to polish the wording and hooks.
8. Click **📦 Download All (.txt)** to export all 4 formats in one text file.

### 2. Single Post Generation (`/generate`)
1. Click **📝 Single Post** in navigation.
2. Choose target platform (*Instagram*), content type (*Social Post*), and tone (*Friendly*).
3. Click **Generate Personalized Content** to open the dedicated Results screen.
4. Use **Regenerate**, **Improve**, **Copy**, or **Download**.

### 3. Image Studio (`/image-studio`)
1. Click **🎨 Image Studio** in navigation.
2. Paste an idea (e.g., "Future of AI in healthcare and modern clinics").
3. Choose a platform (*Instagram*) and Visual Style (*3D Isometric Render*).
4. Click **Generate Visual Concept & AI Prompts**.
5. Review the dynamic aspect ratio mockup, color palette swatches, and lighting direction.
6. Click **Copy for Midjourney** or **Copy for DALL-E** to grab calibrated prompts.

### 4. Video Storyboard Studio (`/video-studio`)
1. Click **🎬 Video Studio** in navigation.
2. Enter a video topic and choose a platform preset (*YouTube Shorts*) and duration (*30s*).
3. Click **Generate Video Production Plan**.
4. Review the 3-second opening hook, audio recommendation, and scene-by-scene storyboard.
5. Edit voiceover or on-screen captions directly in the scene cards.
6. Click **⬇ Download Plan (.txt)** to export the production brief.

### 5. Content Library & History (`/history`)
1. Click **📚 History** in navigation.
2. Switch between filter tabs: `✨ Collections`, `🎬 Videos`, `🎨 Images`, and `📝 Single`.
3. Inside any collection, use the format tabs (LinkedIn, Instagram, Shorts, Carousel) to inspect outputs.
4. Click **✏️ Open in Studio** to load any saved item back into the editor for further refinement.

---

## ℹ️ Known Limitations

- **Image Studio**: Direct GPU image pixel generation (`generateImages`) is unavailable on the free-tier Google Gemini API key. ContentBloom AI provides an honest, production-calibrated visual specification and copy-ready diffusion prompts for Midjourney, DALL-E 3, and Canva AI.
- **Video Studio**: Direct MP4 video rendering is unavailable on the free-tier Gemini API key. ContentBloom AI provides complete scene-by-scene storyboards, voiceovers, on-screen text, and B-roll prompts designed for direct recording or importing into CapCut, Premiere, and Descript.
- **Storage**: Generation history is stored in local browser storage (`localStorage`). No private user drafts are stored on external tracking servers.
