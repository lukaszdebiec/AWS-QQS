const fs = require('fs');
const path = require('path');

const examDir = path.join(__dirname, '..', '..', 'Remote', 'AWS-Certified-Cloud-Practitioner-Notes', 'practice-exam');
const outputDir = path.join(__dirname, '..', 'public');
const outputFile = path.join(outputDir, 'questions.json');

// Ensure output directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function parseExamFiles() {
  const files = fs.readdirSync(examDir).filter(f => f.startsWith('practice-exam-') && f.endsWith('.md'));
  const allQuestions = [];

  for (const file of files) {
    const filePath = path.join(examDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    
    // Normalize line endings to standard LF (\n)
    const content = rawContent.replace(/\r\n/g, '\n');
    
    // Split on a newline followed by a number and dot.
    // E.g., \n1. or \n23.
    const parts = content.split(/\n(?=\d+\.\s)/);
    
    console.log(`Processing file: ${file}, split into ${parts.length} parts`);

    for (let i = 0; i < parts.length; i++) {
      const qBlock = parts[i].trim();
      if (!qBlock) continue;
      
      const lines = qBlock.split('\n');
      const firstLine = lines[0].trim();
      const matchQ = firstLine.match(/^(\d+)\.\s+(.*)$/);
      if (!matchQ) {
        // Skip non-question blocks (like headers/frontmatter)
        continue;
      }
      
      const qNum = parseInt(matchQ[1], 10);
      let questionText = matchQ[2].trim();
      
      let lineIdx = 1;
      // Gather lines for the question until we hit options (which start with -)
      while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('-')) {
        const trimmed = lines[lineIdx].trim();
        if (trimmed.startsWith('<details') || trimmed.includes('Correct answer:')) {
          break;
        }
        if (trimmed) {
          questionText += ' ' + trimmed;
        }
        lineIdx++;
      }
      
      // Extract choices
      const choices = [];
      while (lineIdx < lines.length) {
        const choiceLine = lines[lineIdx].trim();
        if (choiceLine.startsWith('-')) {
          const matchC = choiceLine.match(/^-\s+([A-Z])\.\s+(.*)$/);
          if (matchC) {
            choices.push({
              id: matchC[1],
              text: matchC[2].trim()
            });
          }
          lineIdx++;
        } else {
          break;
        }
      }
      
      // Extract answer block and explanation
      let answerText = '';
      let explanationLines = [];
      let inDetails = false;
      
      while (lineIdx < lines.length) {
        const line = lines[lineIdx].trim();
        if (line.startsWith('<details')) {
          inDetails = true;
          lineIdx++;
          continue;
        }
        if (line.startsWith('</details>')) {
          inDetails = false;
          lineIdx++;
          break;
        }
        
        if (inDetails) {
          if (/correct\s+answer:/i.test(line)) {
            const matchA = line.match(/correct\s+answer:\s*(.*)/i);
            if (matchA) {
              answerText = matchA[1].trim();
            }
          } else {
            if (line) {
              explanationLines.push(line);
            }
          }
        }
        lineIdx++;
      }
      
      // Extract all uppercase letters as correct answers (handles "A, B", "AB", "A", etc.)
      const correctAnswers = answerText
        ? (answerText.match(/[A-Z]/g) || []).map(s => s.toUpperCase())
        : [];
      
      const explanation = explanationLines.join('\n').trim();
      
      if (questionText && choices.length > 0 && correctAnswers.length > 0) {
        allQuestions.push({
          id: `${file.replace('.md', '')}_q${qNum}`,
          sourceFile: file,
          question: questionText,
          choices,
          correctAnswers,
          explanation: explanation || null
        });
      } else {
        console.log(`Skipped block in ${file} around qNum ${qNum}: QText: ${!!questionText}, Choices: ${choices.length}, Answers: ${correctAnswers.length}`);
      }
    }
  }

  console.log(`Parsed ${allQuestions.length} questions from ${files.length} files.`);
  
  fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`Saved parsed questions to ${outputFile}`);
}

try {
  parseExamFiles();
} catch (err) {
  console.error('Error parsing files:', err);
  process.exit(1);
}
