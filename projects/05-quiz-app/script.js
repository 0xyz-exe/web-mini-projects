const questions = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
    correct: 0
  },
  {
    question: "Which CSS property controls text size?",
    options: ["text-size", "font-size", "text-style", "font-style"],
    correct: 1
  },
  {
    question: "What is the correct JavaScript syntax to print 'Hello World'?",
    options: ["print('Hello World')", "console.log('Hello World')", "echo('Hello World')", "printf('Hello World')"],
    correct: 1
  },
  {
    question: "Which HTML element defines the title of a document?",
    options: ["<head>", "<meta>", "<title>", "<header>"],
    correct: 2
  },
  {
    question: "What does CSS stand for?",
    options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
    correct: 1
  },
  {
    question: "Which is NOT a JavaScript data type?",
    options: ["Number", "String", "Boolean", "Float"],
    correct: 3
  },
  {
    question: "How do you select an element with id 'demo' in CSS?",
    options: [".demo", "*demo", "#demo", "demo"],
    correct: 2
  },
  {
    question: "Which operator is used for strict equality in JavaScript?",
    options: ["==", "===", "=", "!="],
    correct: 1
  },
  {
    question: "What is the correct HTML for creating a hyperlink?",
    options: ["<a url='http://example.com'>", "<a href='http://example.com'>", "<link>http://example.com</link>", "<hyperlink>http://example.com</hyperlink>"],
    correct: 1
  },
  {
    question: "Which method is used to add an element at the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correct: 0
  }
];

let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let timerInterval;
let timeRemaining = 600; // 10 minutes
let startTime;

const themeToggle = document.getElementById('themeToggle');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const quizView = document.getElementById('quizView');
const resultsView = document.getElementById('resultsView');
const reviewBtn = document.getElementById('reviewBtn');
const restartBtn = document.getElementById('restartBtn');
const reviewSection = document.getElementById('reviewSection');

// Theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  timeRemaining = 600;
  startTime = Date.now();
  startTimer();
  showQuestion();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimer();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (timeRemaining < 60) {
    timerEl.style.color = '#ef4444';
  }
}

function showQuestion() {
  const q = questions[currentQuestion];
  
  questionEl.textContent = `${currentQuestion + 1}. ${q.question}`;
  
  optionsEl.innerHTML = q.options.map((option, index) => `
    <button class="option" data-index="${index}">${option}</button>
  `).join('');

  // Safe: only user click events, no external HTML
  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', selectOption);
  });

  progressFill.style.width = `${((currentQuestion) / questions.length) * 100}%`;
  progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  
  nextBtn.disabled = true;
}

function selectOption(e) {
  document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
  e.target.classList.add('selected');
  nextBtn.disabled = false;
}

nextBtn.addEventListener('click', () => {
  const selected = document.querySelector('.option.selected');
  if (!selected) return;

  const selectedIndex = parseInt(selected.dataset.index);
  const correct = questions[currentQuestion].correct;
  
  userAnswers.push({
    question: questions[currentQuestion].question,
    selected: selectedIndex,
    correct: correct,
    isCorrect: selectedIndex === correct
  });

  if (selectedIndex === correct) {
    score++;
  }

  currentQuestion++;
  
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  clearInterval(timerInterval);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  
  quizView.style.display = 'none';
  resultsView.style.display = 'block';

  const percentage = Math.round((score / questions.length) * 100);
  document.getElementById('scorePercent').textContent = `${percentage}%`;
  document.getElementById('correctCount').textContent = score;
  document.getElementById('incorrectCount').textContent = questions.length - score;
  
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  document.getElementById('timeTaken').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

reviewBtn.addEventListener('click', () => {
  reviewSection.style.display = 'block';
  
  const reviewHTML = userAnswers.map((answer, index) => {
    const q = questions[index];
    return `
      <div class="review-item">
        <div class="review-question">${index + 1}. ${answer.question}</div>
        <div class="review-answer ${answer.isCorrect ? 'correct-text' : 'incorrect-text'}">
          Your answer: ${q.options[answer.selected]} ${answer.isCorrect ? '✓' : '✗'}
        </div>
        ${!answer.isCorrect ? `<div class="review-answer correct-text">Correct answer: ${q.options[answer.correct]}</div>` : ''}
      </div>
    `;
  }).join('');

  document.getElementById('reviewList').innerHTML = reviewHTML;
  reviewBtn.style.display = 'none';
});

restartBtn.addEventListener('click', () => {
  quizView.style.display = 'block';
  resultsView.style.display = 'none';
  reviewSection.style.display = 'none';
  reviewBtn.style.display = 'block';
  timerEl.style.color = '';
  startQuiz();
});

startQuiz();
