# Deriv View

**Deriv View** is a comprehensive real-time trading dashboard that connects to Deriv's WebSocket API to fetch market data for synthetic indices like Boom 500 and Crash 500. It provides powerful technical analysis with multiple Exponential Moving Averages (EMAs), interactive candlestick charts powered by TradingView's Lightweight Charts library, and AI-driven market analysis using Groq's LLM API. This application is designed for traders who want to visualize market movements across multiple timeframes and leverage AI insights for better decision-making.

---

## 🚀 Features

### Core Functionality
- **Real-Time Market Data**: Fetches historical and live candle data from Deriv WebSocket API for synthetic indices (Boom 500, Crash 500)
- **Multi-Timeframe Analysis**: Switch seamlessly between 1-minute, 1-hour, and 1-day timeframes
- **Technical Indicators**: Automatically calculates and overlays 4 EMAs (20, 50, 100, 200) on the chart
- **Interactive Charts**: Beautiful, responsive TradingView Lightweight Charts with zoom, pan, and crosshair functionality
- **AI-Powered Analysis**: Integrates with Groq LLM (GPT-4) to provide narrative market analysis, trend projections, and trading insights
- **Analysis History**: Save and organize AI analyses into custom groups with color coding
- **Persistent Storage**: Local storage for analysis history and groups across sessions

### Technical Highlights
- **Backend**: FastAPI-based REST API with async WebSocket client for Deriv integration
- **Frontend**: Modern React + TypeScript application built with Vite for blazing-fast development
- **Real-Time Updates**: Auto-refresh capability for candle data
- **Error Handling**: Comprehensive error handling and user-friendly error messages
- **CORS Enabled**: Configured for local development with flexible CORS settings
- **Type Safety**: Full TypeScript support for reliable frontend code

---

## 🏗️ Architecture

### Backend (FastAPI)
The backend is a Python-based REST API that handles all external communications:

```
backend/
├── main.py           # FastAPI app with endpoints
├── config.py         # Settings and environment configuration
├── deriv.py          # Deriv WebSocket client
├── ema.py            # EMA calculation logic
├── llm.py            # Groq LLM integration
└── requirements.txt  # Python dependencies
```

**Key Endpoints:**
- `GET /health` - Health check
- `GET /api/candles` - Fetch candle data with EMAs
- `POST /api/analyze` - Request AI market analysis

### Frontend (React + Vite)
Modern single-page application with TypeScript:

```
frontend/
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Main component
│   ├── api.ts             # Backend API client
│   ├── types.ts           # TypeScript definitions
│   ├── style.css          # Global styles
│   └── components/
│       └── Chart.tsx      # TradingView chart component
├── index.html
├── package.json
└── vite.config.ts
```

---

## 📦 Technology Stack

### Backend
- **FastAPI** - Modern, high-performance Python web framework
- **Uvicorn** - Lightning-fast ASGI server
- **websockets** - Async WebSocket client for Deriv API
- **httpx** - Modern HTTP client
- **Pydantic** - Data validation and settings management
- **python-dotenv** - Environment variable management
- **Groq SDK** - AI analysis via Groq's LLM API

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Axios** - HTTP client for API calls
- **TradingView Lightweight Charts** - Professional charting library

---

## ⚙️ Setup & Installation

### Prerequisites
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **Deriv API Token** (get from [Deriv API](https://api.deriv.com/))
- **Groq API Key** (optional, for AI analysis from [Groq](https://console.groq.com/))

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd deriv-view
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
cd backend
```

Create `.env` with the following content:
```env
DERIV_TOKEN=your_deriv_api_token_here
DERIV_APP_ID=1089
DERIV_API_ENDPOINT=wss://ws.binaryws.com/websockets/v3

# Optional: For AI Analysis
LLM_API_KEY=your_groq_api_key_here
LLM_MODEL=gpt-4o-mini

# CORS (adjust if needed)
CORS_ALLOW_ORIGINS=["*"]
```

**Note:** 
- `DERIV_TOKEN` is required for fetching market data
- `LLM_API_KEY` is optional but required for AI analysis features

### Step 3: Backend Setup

#### Option A: Using Virtual Environment (Recommended)
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Option B: Quick Start (if environment is configured)
```bash
cd backend
C:/Projects/Hobby/1/.venv/Scripts/python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will start on **http://localhost:8000**

### Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on **http://localhost:5173** (or another port if 5173 is busy)

---

## 🎯 Usage Guide

### 1. Access the Application
Open your browser and navigate to **http://localhost:5173**

### 2. Select Market & Timeframe
- **Symbol**: Choose between Boom 500 or Crash 500
- **Timeframe**: Select 1m, 1h, or 1d
- The chart will automatically update when you change these settings

### 3. View the Chart
- **EMA Lines**: 4 colored lines representing 20, 50, 100, and 200-period EMAs
- **Candlesticks**: Green for bullish, red for bearish
- **Interactions**: Hover for price details, scroll to zoom, drag to pan

### 4. Request AI Analysis
- Click **"AI Analysis"** button
- The system performs multi-timeframe analysis:
  - **1d timeframe**: Analyzes daily trend + hourly structure
  - **1h timeframe**: Analyzes hourly trend + 1-minute structure  
  - **1m timeframe**: Provides intraday scalping insights
- Analysis includes:
  - Bias check (Boom = longs, Crash = shorts)
  - Trend projection
  - Key support/resistance levels
  - Risk assessment
  - Entry suggestions (when applicable)

### 5. Manage Analysis History
- **Create Groups**: Organize analyses by creating custom groups with colors
- **Assign to Groups**: Categorize each analysis for easy retrieval
- **View History**: Toggle history panel to review past analyses
- **Delete**: Remove individual analyses or entire groups

---

## 🔍 API Documentation

### GET `/health`
Health check endpoint
```json
{
  "status": "ok"
}
```

### GET `/api/candles`
Fetch historical candles with EMA overlays

**Query Parameters:**
- `symbol` (required): Instrument code (e.g., BOOM500, CRASH500)
- `timeframe` (optional): 1m, 1h, or 1d (default: 1m)
- `count` (optional): Number of candles, 50-600 (default: 200)

**Response:**
```json
{
  "symbol": "BOOM500",
  "timeframe": "1m",
  "granularity": 60,
  "candles": [
    {
      "epoch": 1735308060,
      "open": 12345.67,
      "high": 12350.00,
      "low": 12340.00,
      "close": 12348.50,
      "ema20": 12340.23,
      "ema50": 12335.45,
      "ema100": 12330.67,
      "ema200": 12325.89
    }
  ]
}
```

### POST `/api/analyze`
Request AI-powered market analysis

**Query Parameters:**
- `symbol` (required): Instrument code
- `timeframe` (optional): 1m, 1h, or 1d (default: 1m)
- `count` (optional): Candles to analyze, 50-400 (default: 200)

**Response:**
```json
{
  "analysis": "Bias Check: Boom 500 → Long setups only. Daily Projection: Bullish close expected..."
}
```

---

## 🛠️ Development

### Backend Development
```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests (if available)
pytest
```

### Frontend Development
```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Features
1. **New Endpoints**: Add routes in `backend/main.py`
2. **New Indicators**: Implement calculation logic in a new module
3. **UI Components**: Create in `frontend/src/components/`
4. **Type Definitions**: Update `frontend/src/types.ts`

---

## 🔒 Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** - Always add `.env` to `.gitignore`
2. **Keep API tokens server-side** - Frontend should never access tokens directly
3. **Production deployment**:
   - Use proper authentication middleware
   - Implement rate limiting
   - Configure CORS restrictively
   - Use HTTPS/WSS protocols
   - Add request validation and sanitization
4. **Token Permissions**: Use read-only Deriv tokens when possible

---

## 📝 Configuration Options

### Backend Configuration (`backend/config.py`)
```python
deriv_app_id: int = 1089
deriv_api_endpoint: str = "wss://ws.binaryws.com/websockets/v3"
deriv_token: str | None = None
llm_api_key: str | None = None
llm_model: str = "gpt-4o-mini"
cors_allow_origins: list[str] = ["*"]
```

### Timeframe Mappings
- `1m` → 60 seconds granularity
- `1h` → 3600 seconds granularity
- `1d` → 86400 seconds granularity

---

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
# Ensure virtual environment is activated
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

**"Connection refused" or WebSocket errors:**
- Check your internet connection
- Verify `DERIV_TOKEN` is valid and not expired
- Ensure firewall allows WebSocket connections

**"LLM API not configured":**
- Add `LLM_API_KEY` to your `.env` file
- Restart the backend server

### Frontend Issues

**"Failed to load candles":**
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify API endpoint configuration

**Chart not rendering:**
- Clear browser cache
- Check for JavaScript errors in console
- Ensure `lightweight-charts` is installed

**Port 5173 already in use:**
```bash
# Vite will automatically use next available port
# Or specify a different port:
npm run dev -- --port 3000
```

---

## 🚀 Deployment

### Backend Deployment
1. Use production ASGI server: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
2. Set up environment variables in production
3. Enable HTTPS
4. Configure proper CORS origins

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)
3. Configure API endpoint to production backend URL

---

## 📄 License

This is a personal/hobby project. Use at your own risk. No warranty provided.

---

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support

For issues related to:
- **Deriv API**: Visit [Deriv API Documentation](https://api.deriv.com/)
- **Groq API**: Visit [Groq Documentation](https://console.groq.com/docs)
- **TradingView Charts**: Visit [Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)

---

## ✨ Future Enhancements

Potential features for future development:
- [ ] Real-time streaming data via WebSocket
- [ ] More technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Multi-symbol watchlist
- [ ] Trade alerts and notifications
- [ ] Historical backtest functionality
- [ ] User authentication and personalization
- [ ] Database persistence for analysis history
- [ ] Mobile-responsive design improvements
- [ ] Dark/light theme toggle
- [ ] Export analysis reports as PDF

---

**Built with ❤️ for traders who love data-driven decisions**
