# QuizForge 🧠⚡

Turn any study material into interactive, high-quality quizzes in seconds using Google's Gemini AI.

🚀 **Live Demo:** [https://quizforge-pc.netlify.app/](https://quizforge-pc.netlify.app/)

---

## ✨ Features

- 📄 **Multiple Input Sources:** Upload PDF documents or directly paste text notes and articles.
- 🎯 **Multiple Question Types:**
  - Multiple Choice Questions (MCQ)
  - Fill in the Blanks
  - Match the Following
  - True / False
  - Short Answer Questions
- 🎚️ **Custom Difficulty Levels:** Choose between **Normal** or **Competitive Exam-Style** questions.
- ⚡ **Bring Your Own Key (BYOK):** Seamless client-side integration using your free Google Gemini API Key.
- 💾 **Local Quiz Storage:** Quizzes are automatically stored in local storage so you can review, practice, and delete them anytime.
- 📝 **Interactive Practice & Results:** Test your knowledge interactively with immediate feedback and scoring.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **PDF Processing:** PDF.js (`pdfjs-dist`)
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`)
- **Deployment:** Netlify

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/quiz-forge.git
   cd quiz-forge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173`.

5. **Configure API Key:**
   Click the ⚙️ **Settings** icon in the top right header and enter your **Gemini API Key**.

---

## 📄 License

This project is licensed under the MIT License.
