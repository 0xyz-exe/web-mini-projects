let currentMode = 'work';
let timeRemaining = 25 * 60;
let isRunning = false;
let interval;
let currentSession = 1;
let completedSessions = 0;
let totalMinutes = 0;

const timerDisplay = document.getElementById('timerDisplay');
const sessionInfo = document.getElementById('sessionInfo');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeTabs = document.querySelectorAll('.mode-tab');
const themeToggle = document.getElementById('themeToggle');
const workDuration = document.getElementById('workDuration');
const shortBreakDuration = document.getElementById('shortBreakDuration');
const longBreakDuration = document.getElementById('longBreakDuration');
const completedCount = document.getElementById('completedCount');
const totalTime = document.getElementById('totalTime');

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

// Load stats
const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || { completed: 0, totalMinutes: 0 };
completedSessions = stats.completed;
totalMinutes = stats.totalMinutes;
updateStats();

modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (isRunning) return;
    
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    currentMode = tab.dataset.mode;
    resetTimer();
  });
});

startBtn.addEventListener('click', () => {
  if (isRunning) {
    pause();
  } else {
    start();
  }
});

resetBtn.addEventListener('click', resetTimer);

function start() {
  isRunning = true;
  startBtn.textContent = 'Pause';
  
  interval = setInterval(() => {
    timeRemaining--;
    updateDisplay();
    
    if (timeRemaining <= 0) {
      complete();
    }
  }, 1000);
}

function pause() {
  isRunning = false;
  startBtn.textContent = 'Start';
  clearInterval(interval);
}

function resetTimer() {
  pause();
  
  if (currentMode === 'work') {
    timeRemaining = parseInt(workDuration.value) * 60;
  } else if (currentMode === 'short') {
    timeRemaining = parseInt(shortBreakDuration.value) * 60;
  } else {
    timeRemaining = parseInt(longBreakDuration.value) * 60;
  }
  
  updateDisplay();
}

function complete() {
  pause();
  
  if (currentMode === 'work') {
    completedSessions++;
    totalMinutes += parseInt(workDuration.value);
    
    if (currentSession === 4) {
      currentSession = 1;
      notify('Time for a long break!');
      switchMode('long');
    } else {
      currentSession++;
      notify('Time for a short break!');
      switchMode('short');
    }
  } else {
    notify('Break is over! Time to work!');
    switchMode('work');
  }
  
  updateStats();
  saveStats();
}

function switchMode(mode) {
  currentMode = mode;
  modeTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  resetTimer();
}

function updateDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  sessionInfo.textContent = currentMode === 'work' ? `Session ${currentSession} of 4` : 'Break Time';
  
  // Update page title
  document.title = `${timerDisplay.textContent} - Pomodoro Timer`;
}

function updateStats() {
  completedCount.textContent = completedSessions;
  totalTime.textContent = `${totalMinutes}m`;
}

function saveStats() {
  localStorage.setItem('pomodoroStats', JSON.stringify({
    completed: completedSessions,
    totalMinutes: totalMinutes
  }));
}

function notify(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Pomodoro Timer', {
      body: message,
      icon: '🍅'
    });
  } else {
    alert(message);
  }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

updateDisplay();
