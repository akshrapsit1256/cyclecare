# CycleCare — a local cycle companion

> **Built for the DEV / Hacktoberfest 2026 "Build for a Friend" challenge. The friend I built it for is me.**
> *A small, local menstrual-cycle tracker with wellness and meal suggestions from an open-weight AI model running on my own laptop.*

---

## 🌸 About CycleCare

**CycleCare** is a small web app I built for myself to track my menstrual cycle, log daily symptoms, and get general self-care, hydration, and meal ideas from a local open-weight AI model (Gemma, run through Ollama). Everything runs on my own laptop, with no account and no cloud service.

---

## 💡 The Problem

I wanted a simple way to understand where I am in my cycle, but most cycle apps ask me to create an account and keep my health data on their servers. I didn't want that for something this personal.

So I built CycleCare to run entirely on my own machine. My data stays in a local SQLite file, and the AI suggestions come from a small open-weight model running locally through Ollama, so nothing is sent to a third party.

I built it for myself, and so far it has only been tested by me.

---

## ✨ Features

- **Cycle dashboard and phase estimate:**
  - Shows the current cycle day, an estimated phase (**Menstrual**, **Follicular**, **Ovulation**, **Luteal**), a progress ring, and an estimated next period date.
  - The calculation is simple (last period date + average cycle length) and is easy to read and change in `backend/services/cycle_service.py`. It is a rough estimate, not a medical prediction.
- **Daily check-in:**
  - Select symptoms (*cramps, bloating, headache, fatigue, back discomfort, cravings, low energy*).
  - Pick a mood, rate energy from 1 to 5, and add optional notes.
  - Recent check-ins are listed from the local database.
- **Food preferences:**
  - Preferences (*Vegetarian, Non-vegetarian, Vegan, High-protein, Light meals, Indian food, No preference*).
  - Free-text dietary restrictions (for example gluten-free or dairy-free) and a wellness goal.
- **AI wellness suggestions (Gemma via Ollama):**
  - General self-care, a hydration reminder, a gentle movement idea, and a rest tip.
  - 2 to 3 meal ideas with key ingredients and a short explanation.
  - One short piece of guidance based on the cycle phase and the symptoms selected.
- **Fallback if Ollama is unavailable:**
  - The app doesn't crash. It shows a generic built-in plan, labelled as coming from the built-in knowledge base rather than the AI model.
  - This built-in text is not AI-generated and has not been reviewed by any medical professional.

---

## 🏗️ Architecture

```
[ Frontend: React + Vite ]
           │  (HTTP / JSON)
           ▼
[ Backend: FastAPI (Python) ]
     │                   │
     │ (Local SQL)       │ (HTTP POST localhost:11434)
     ▼                   ▼
[ SQLite: cyclecare.db ]   [ Local Ollama: gemma2:2b ]
```

1. **Frontend (React + Vite):** The UI, with a cycle progress ring and four pages.
2. **Backend (FastAPI):** Cycle calculations, SQLite reads and writes, and prompt building.
3. **Storage (SQLite):** A single local file, `cyclecare.db`, which is excluded from git.
4. **AI layer (Ollama):** The backend sends a structured prompt to Ollama's `/api/generate` endpoint, asks for JSON, and validates the response before showing it.

---

## 🧠 Why Open-Weight AI?

I used Gemma (`gemma2:2b`), an open-weight model, through Ollama. For a personal health tool that gave me:

1. **Privacy:** The prompts, which include cycle and symptom data, are processed on my laptop and are not sent to a third-party API.
2. **No cost:** After the one-time model download there are no API fees or subscriptions.
3. **Swappable models:** The model name is a setting in `.env`, so a different model can be tried without code changes. Only `gemma2:2b` has been tested so far.
4. **Visible prompts:** The system prompt and output schema are in the source code and can be read and changed.

---

## 🚀 Setup & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ and npm**
- **Ollama** ([download from ollama.com](https://ollama.com))

---

### Step 1: Install Ollama and pull the model

1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull the model:
   ```bash
   ollama pull gemma2:2b
   ```
3. Make sure Ollama is running:
   ```bash
   ollama serve
   ```
*(If Ollama is not running, CycleCare shows its generic built-in plan instead of AI suggestions, and labels it as such.)*

---

### Step 2: Install backend dependencies

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
3. Install the dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

---

### Step 3: Install frontend dependencies

In a separate terminal:
```bash
cd cyclecare/frontend
npm install
```

---

### Step 4: Run the application

#### 1. Start the FastAPI backend
```bash
# From the cyclecare/ root, with the virtual environment activated:
python backend/main.py
```
*Backend:* `http://127.0.0.1:8000`
*API docs:* `http://127.0.0.1:8000/docs`

#### 2. Start the React frontend
```bash
# In cyclecare/frontend:
npm run dev
```
*Frontend:* `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 User Flow

1. **Profile:** Enter the start date of your last period and your typical cycle length.
2. **Preferences (Profile page):** Choose food preferences and any restrictions.
3. **Check-in:** Select today's symptoms, a mood, and an energy level, then save.
4. **Dashboard:** See your estimated phase, cycle day, and estimated next period date.
5. **AI Wellness:** Click **Generate Suggestions** to get self-care, hydration, rest, and meal ideas. Each result shows whether it came from the local model or the built-in fallback.

---

## 🛡️ Safety

> **CycleCare is a wellness companion and is not intended to diagnose, treat, or prevent medical conditions. AI-generated suggestions are general wellness information and should not replace professional medical advice.**

- The system prompt instructs the model not to diagnose conditions and not to suggest medication or doses. A small model can still make mistakes, so treat every suggestion as general information.
- If you have severe, unusual, or worrying symptoms, talk to a healthcare professional.
- Phase estimates are rough and unreliable for irregular cycles. Do not use them to plan or avoid pregnancy.

---

## ⚠️ Limitations

- Built for one user and tested only by me.
- Needs a laptop running Ollama, so it can't easily be deployed for others to try.
- A 2B model can be slow, generic, or inconsistent. Meal ideas are general suggestions, not nutritional advice.
- Data is stored locally and **unencrypted** in SQLite, so anyone with access to the computer could read it. Keep the backend bound to `127.0.0.1`.
- There is no data export or delete button yet.
- Free-text notes are included in the prompt sent to the local model.

---

## 🔮 Future Improvements

- Learn the real cycle length from past entries instead of a fixed average.
- Export and delete local data from the app.
- Compare outputs from different open-weight models.

---

## 📄 License

MIT License. See the `LICENSE` file.
