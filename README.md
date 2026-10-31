# ContentBloom AI 🌸
### AI-Powered Social Media Content Generation Platform

ContentBloom AI is an AI-powered content generation platform that transforms long-form content into engaging, platform-specific social media assets. It helps creators, marketers, and businesses save time, maintain consistency, and scale their content strategy.

## 🚀 Key Features

- **AI Content Generation:** Transform blogs, articles, and transcripts into social media content.
- **Multi-Platform Support:** Generate content for LinkedIn, Instagram, and YouTube Shorts.
- **Multiple Content Formats:** Create social media posts, video scripts, and carousels.
- **Content Customization:** Configure tone, target audience, content length, hashtags, and emojis.
- **Content Improvement:** Edit, improve, and regenerate generated content.
- **Generate All:** Create content across multiple platforms and formats.
- **Content History:** Access previously generated content.
- **Campaign Manager:** Organize campaigns and manage content assets.
- **30-Day Content Calendar:** Plan and organize social media publishing.
- **Image Studio:** Create and export PNG graphics.
- **Video Studio:** Create and export WebM video assets.
- **CSV Export:** Export campaign and calendar data for scheduling.
- **UTM Attribution:** Support campaign tracking through UTM parameters.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| AI Integration | Google Gemini API |
| API Communication | Axios |
| Frontend Build | Vite |

## 📁 Project Structure

```text
ContentBloom AI/
│
├── backend/
│   ├── main.py
│   ├── routers/
│   │   └── generate.py
│   ├── services/
│   │   └── gemini_service.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

*Note: Adjust the structure above to match the actual files in your repository.*

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd "ContentBloom AI"
```

### 2. Backend Setup

```powershell
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the backend directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your own API key. Never commit this file to GitHub.

Start the FastAPI backend:

```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8081
```

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed by Vite, usually:

`http://localhost:5173`

Ensure the frontend API proxy configuration points to the backend port being used.

## 🧪 Testing

### Backend Tests

Run from the backend directory:

```powershell
python -m pytest -v
```

### Frontend Production Build

Run from the frontend directory:

```powershell
npm run build
```

A successful build generates the production-ready files in the `dist` directory.

### Engine Validation

The application is evaluated using the following test scenarios:

1. Normal content generation.
2. Same-input repeat generation.
3. New-input refresh generation.
4. Failure handling and recovery.
5. Backend test execution and frontend production build.

Actual test counts and execution results should be recorded from the latest test runs.

## 🔐 Security

- Gemini API credentials are stored in backend environment variables.
- API keys are not exposed in frontend source code.
- Environment files are excluded from version control.
- API credentials must never be committed to the public repository.

## 🎯 Project Objective

The objective of ContentBloom AI is to simplify social media content creation through AI-powered automation. By converting a single source of information into multiple platform-specific formats, the platform helps users reduce manual effort and maintain a consistent digital presence.

## 🌱 Future Enhancements

- Social media publishing integrations.
- Advanced performance analytics.
- Brand voice personalization.
- Automated content scheduling.
- AI-powered engagement recommendations.

## 👩‍💻 Developed For

**IncuBrix – Growth Engineer Assessment**

**Track:** GTM / Growth Engineer  
**Option:** Social Media and Content  
**Project:** ContentBloom AI

---

*Turn one idea into a complete content strategy with ContentBloom AI.*
