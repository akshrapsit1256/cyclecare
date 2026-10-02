# CycleCare — Personal Menstrual Wellness Companion

> **Built for the DEV / Hacktoberfest 2026 "Build for a Friend" Challenge**  
> *Privacy-first, open-source AI powered menstrual cycle tracker and holistic lifestyle companion.*

---

## 🌸 About CycleCare

**CycleCare** is a clean, comforting web application designed to help women track their menstrual cycle rhythms, log daily symptoms, and receive personalized, non-medical self-care, hydration, and phase-aligned meal suggestions powered by **local, open-source AI (Ollama + Gemma)**.

---

## 💡 The Problem

Many commercial cycle tracking applications commodify women's health data, flood interfaces with ads, lock basic insights behind costly subscriptions, or upload intimate biometric logs to third-party ad networks.

When speaking with a close family member about her daily experience managing menstrual symptoms, three friction points emerged:
1. **Uncertainty around phase-aligned nutrition:** Not knowing what foods support energy during the luteal phase vs. what eases inflammation during menstruation.
2. **Generic, cookie-cutter tips:** Reading robotic articles that don't take into account *today's* specific cramps, mood, or dietary restrictions (e.g., vegetarian or Indian food preferences).
3. **Data privacy anxiety:** Reluctance to share deeply personal health data with proprietary cloud servers or paid AI chatbots.

**CycleCare was built to solve this directly:** a lightweight, aesthetically soothing, completely private companion that runs on the user's personal machine using local open-weight AI and local SQLite storage.

---

## ✨ Features

- **Cycle Dashboard & Phase Tracking:**
  - Displays current cycle day, estimated phase (**Menstrual**, **Follicular**, **Ovulation**, **Luteal**), cycle progress ring, and projected next period date.
  - Transparent, non-medical phase calculation logic.
- **Daily Symptom & Mood Check-in:**
  - One-tap selection of physical symptoms (*cramps, bloating, headache, fatigue, back discomfort, cravings, low energy*).
  - Mood selector and 1–5 vitality energy rating with optional personal reflection notes.
  - Local history log of recent check-ins.
- **Nutritional & Dietary Customization:**
  - Dietary preferences (*Vegetarian, Non-vegetarian, Vegan, High-protein, Light meals, Indian food, No preference*).
  - Custom dietary restrictions (e.g. gluten-free, dairy-free) and personal wellness goals.
- **Open-Source AI Wellness Engine:**
  - Generates phase-aligned self-care practices, hydration reminders, gentle movement, and sleep wind-down advice.
  - Delivers 2–3 phase-aligned meal ideas with key ingredients and explanations of nutritional rationale.
  - Offers an empathetic gentle guidance thought of the day.
- **Resilient Offline Architecture:**
  - Works with local Ollama (`gemma2:2b`, `llama3.2`, etc.).
  - If Ollama is offline or downloading models, CycleCare automatically falls back to its built-in evidence-based wellness knowledge base without crashing.

---

## 🏗️ Architecture

CycleCare is designed around local execution and privacy:

```
[ Frontend: React + Vite ]
           │  (HTTP / JSON)
           ▼
[ Backend: FastAPI (Python) ]
     │                   │
     │ (Local SQL)       │ (HTTP POST localhost:11434)
     ▼                   ▼
[ SQLite: cyclecare.db ]   [ Local Ollama: Gemma 2B ]
```

1. **Frontend (React + Vite):** A responsive UI built with calming pastel aesthetics, accessible typography, and SVG visualizations.
2. **Backend (FastAPI):** Python REST service managing cycle calculations, SQLite records, and structured prompt engineering.
3. **Storage (SQLite):** Embedded, single-file database (`cyclecare.db`) stored strictly on the local filesystem.
4. **AI Layer (Ollama):** Local open-source model execution. Queries are generated and answered locally without third-party API keys or internet dependencies.

---

## 🧠 Why Open-Source AI?

Using a local, open-source model (such as Google DeepMind's **Gemma 2B** via **Ollama**) provides distinct advantages for personal health tools:

1. **True Intimate Privacy:** Menstrual cycle data, physical symptoms, and mental wellbeing notes never leave the user's laptop.
2. **No Cost or Subscription Paywalls:** Eliminates expensive API tokens and recurring subscriptions.
3. **No Vendor Lock-In:** The user can swap between open-weight models (`gemma2:2b`, `llama3.2`, `mistral`) simply by setting an environment variable.
4. **Transparency & Auditability:** Prompts, system rules, and schemas are visible and fully controllable in the source code.

---

## 🚀 Setup & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Ollama** ([Download from ollama.com](https://ollama.com))

---

### Step 1: Install Ollama & Pull the Model

1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Pull the recommended lightweight open model:
   ```bash
   ollama pull gemma2:2b
   ```
3. Ensure Ollama is running:
   ```bash
   ollama serve
   ```
*(Note: If Ollama is not running, CycleCare will smoothly activate its built-in offline wellness knowledge base).*

---

### Step 2: Install Backend Dependencies

1. Open a terminal in the project root:
   ```bash
   cd cyclecare
   ```
2. Create and activate a Python virtual environment:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

---

### Step 3: Install Frontend Dependencies

In a separate terminal:
```bash
cd cyclecare/frontend
npm install
```

---

### Step 4: Run the Application

#### 1. Start the FastAPI Backend:
```bash
# From cyclecare/ root with virtual environment activated:
python backend/main.py
```
*Backend runs at:* `http://127.0.0.1:8000`  
*Interactive Swagger docs:* `http://127.0.0.1:8000/docs`

#### 2. Start the React Frontend:
```bash
# In cyclecare/frontend:
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📱 User Flow

1. **Cycle Setup (Profile Tab):** Enter the start date of your last period and your typical cycle length (e.g. 28 days).
2. **Dietary Preferences (Profile Tab):** Choose your food preferences (e.g. *Vegetarian*, *Indian food*) and any restrictions (e.g. *gluten-free*).
3. **Daily Check-in (Check-in Tab):** Select today's symptoms (*cramps, fatigue, bloating*), select your current mood and energy level, and save your daily entry.
4. **View Cycle Dashboard (Dashboard Tab):** Check your current phase, cycle day progress ring, and days until your next period.
5. **Receive AI Wellness Plan (AI Wellness Tab):** Click **"Generate Suggestions"** to receive AI-crafted self-care, hydration, rest tips, and 2–3 phase-aligned meal recipes.

---

## 🛡️ Medical Safety & Ethical Boundaries

> **Important Disclaimer:**  
> **CycleCare is a wellness companion and is not intended to diagnose, treat, cure, or prevent medical conditions. AI-generated suggestions are general lifestyle and nutritional wellness information and should never replace professional medical advice, diagnosis, or care from a qualified healthcare practitioner.**

CycleCare incorporates hard-coded ethical safeguards:
- Does **not** diagnose medical conditions (e.g. endometriosis, PCOS, PMDD).
- Does **not** prescribe or recommend pharmaceuticals or medicinal dosages.
- Refers users with severe or abnormal pain to licensed medical doctors.

---

## 🔮 Future Improvements

- Historical cycle length variance tracking and standard deviation estimation.
- Export / import of local SQLite data as encrypted JSON backup.
- Native desktop wrapper (e.g. Electron or Tauri) for a single double-clickable offline app.
- Customizable reminder notifications for hydration and rest breaks.

---

## 📄 License

MIT License. Created with ❤️ for family, friends, and the open-source community.
