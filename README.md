# AWS Certified Cloud Practitioner Practice Quiz Simulator

An interactive web application designed to help prepare for the **AWS Certified Cloud Practitioner (CLF-C02)** certification exam. It loads raw exam data, compiles it, and presents it in a premium, modern test-taking simulator.

🔗 **Live Application:** [https://lukaszdebiec.github.io/AWS-QQS/](https://lukaszdebiec.github.io/AWS-QQS/)

---

## 🚀 Features

- **Randomized Mock Exams**: Generates a simulated test of 50 randomly selected questions from the practice question bank.
- **Progress Persistence**: Automatically saves your current exam progress to local storage so you can close the page and resume your attempt later.
- **Support for Multi-Select Questions**: Handles questions requiring multiple correct option selections, reflecting actual exam conditions.
- **Detailed Evaluation**: Displays a full scoring breakdown upon submission, with highlighted correct answers and comprehensive explanations.
- **Modern Responsive Design**: Built with a sleek glassmorphic dark-mode user interface using Vanilla CSS and Lucide React icons.

---

## 🛠️ Project Structure

The project is structured as follows:

```text
├── Remote/
│   └── AWS-Certified-Cloud-Practitioner-Notes/   # Submodule containing raw markdown (.md) exam notes
└── quiz-app/                                     # The main Vite + React application
    ├── public/
    │   └── questions.json                        # The generated database containing parsed exam questions
    ├── scripts/
    │   └── parse-exams.js                        # Node script that parses raw markdown questions into questions.json
    ├── src/
    │   ├── App.jsx                               # Main application component & quiz engine
    │   ├── index.css                             # Custom styles and design tokens
    │   └── main.jsx                              # Application entry point
    └── vite.config.js                            # Vite configuration (assets base path & dev server)
```

---

## 💻 Getting Started & Local Development

### 1. Parse Raw Exam Markdown Files
If you make changes to the raw practice exam markdown files in `Remote/`, you need to re-parse them to update the application's questions database:

```bash
cd quiz-app
node scripts/parse-exams.js
```
This script will read the markdown files, extract questions, choices, answers, and explanations, and generate the updated `quiz-app/public/questions.json` file.

### 2. Run the Development Server
Install dependencies and run the local development server:

```bash
cd quiz-app
npm install
npm run dev
```
The application will start running locally at [http://localhost:3000/](http://localhost:3000/).

### 3. Build for Production
To bundle the application for production deployment (e.g., GitHub Pages):

```bash
cd quiz-app
npm run build
```
This builds the production-ready assets into the `dist/` directory, configured with the correct relative subpath base directory routing.
