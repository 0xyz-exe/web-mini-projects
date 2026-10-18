const texts = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "JavaScript is a versatile language that powers modern web applications across the globe.",
  "Practice makes perfect. The more you type, the faster and more accurate you become.",
  "Web development combines creativity with technical skills to build amazing experiences."
];

let currentText = '';
let currentIndex = 0;
let startTime = null;
let timerInterval = null;
let errorCount = 0;
let isTestActive = false;

const textDisplay = document.getElementById('textDisplay');
const inputArea = document.getElementById('inputArea');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const newTextBtn = document.getElementById('newTextBtn');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timerEl = document.getElementById('timer');
const errorsEl = document.getElementById('errors');
const results = document.getElementById('results');
const themeToggle = document.getElementById('themeToggle');

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

function loadNewText() {
  currentText = texts[Math.floor(Math.random() * texts.length)];
  renderText();
}

function renderText() {
  textDisplay.innerHTML = currentText.split('').map((char, i) => 
    `<span class="char" data-index="${i}">${char === ' ' ? '&nbsp;' : char}</span>`
  ).join('');
}

startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);
newTextBtn.addEventListener('click', () => {
  resetTest();
  loadNewText();
});

inputArea.addEventListener('input', handleInput);

function startTest() {
  if (isTestActive) return;
  
  isTestActive = true;
  startTime = Date.now();
  inputArea.disabled = false;
  inputArea.value = '';
  inputArea.focus();
  startBtn.disabled = true;
  results.classList.remove('active');
  
  timerInterval = setInterval(updateTimer, 100);
}

function handleInput() {
  const typedText = inputArea.value;
  currentIndex = typedText.length;
  
  const chars = textDisplay.querySelectorAll('.char');
  let correct = 0;
  errorCount = 0;
  
  chars.forEach((char, i) => {
    char.classList.remove('correct', 'incorrect', 'current');
    
    if (i < typedText.length) {
      if (typedText[i] === currentText[i]) {
        char.classList.add('correct');
        correct++;
      } else {
        char.classList.add('incorrect');
        errorCount++;
      }
    } else if (i === typedText.length) {
      char.classList.add('current');
    }
  });
  
  // Update stats
  const elapsed = (Date.now() - startTime) / 1000 / 60;
  const words = typedText.trim().split(/\s+/).length;
  const wpm = Math.round(words / elapsed) || 0;
  const accuracy = Math.round((correct / typedText.length) * 100) || 100;
  
  wpmEl.textContent = wpm;
  accuracyEl.textContent = accuracy + '%';
  errorsEl.textContent = errorCount;
  
  // Check if complete
  if (typedText.length === currentText.length) {
    completeTest();
  }
}

function updateTimer() {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  timerEl.textContent = elapsed + 's';
}

function completeTest() {
  isTestActive = false;
  clearInterval(timerInterval);
  inputArea.disabled = true;
  startBtn.disabled = false;
  
  const elapsed = (Date.now() - startTime) / 1000 / 60;
  const words = currentText.trim().split(/\s+/).length;
  const wpm = Math.round(words / elapsed);
  const correct = currentText.length - errorCount;
  const accuracy = Math.round((correct / currentText.length) * 100);
  
  document.getElementById('finalWpm').textContent = wpm;
  document.getElementById('finalAccuracy').textContent = accuracy + '%';
  document.getElementById('finalChars').textContent = currentText.length;
  
  results.classList.add('active');
}

function resetTest() {
  isTestActive = false;
  clearInterval(timerInterval);
  currentIndex = 0;
  errorCount = 0;
  startTime = null;
  inputArea.value = '';
  inputArea.disabled = true;
  startBtn.disabled = false;
  
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100%';
  timerEl.textContent = '0s';
  errorsEl.textContent = '0';
  
  results.classList.remove('active');
  renderText();
}

loadNewText();
