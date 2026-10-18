const display = document.getElementById('display');
const themeToggle = document.getElementById('themeToggle');
const buttons = document.querySelectorAll('.btn');

let currentValue = '0';
let previousValue = null;
let operation = null;
let waitingForOperand = false;

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

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.num !== undefined) {
      inputDigit(btn.dataset.num);
    } else if (btn.dataset.action) {
      handleAction(btn.dataset.action);
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key);
  } else if (e.key === '.') {
    handleAction('decimal');
  } else if (e.key === '+') {
    handleAction('add');
  } else if (e.key === '-') {
    handleAction('subtract');
  } else if (e.key === '*') {
    handleAction('multiply');
  } else if (e.key === '/') {
    e.preventDefault();
    handleAction('divide');
  } else if (e.key === '%') {
    handleAction('percent');
  } else if (e.key === 'Enter' || e.key === '=') {
    handleAction('equals');
  } else if (e.key === 'Escape') {
    handleAction('clear');
  } else if (e.key === 'Backspace') {
    handleAction('backspace');
  }
});

function inputDigit(digit) {
  if (waitingForOperand) {
    currentValue = digit;
    waitingForOperand = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  updateDisplay();
}

function handleAction(action) {
  switch (action) {
    case 'clear':
      currentValue = '0';
      previousValue = null;
      operation = null;
      waitingForOperand = false;
      break;
    
    case 'backspace':
      if (!waitingForOperand) {
        currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
      }
      break;
    
    case 'decimal':
      if (waitingForOperand) {
        currentValue = '0.';
        waitingForOperand = false;
      } else if (currentValue.indexOf('.') === -1) {
        currentValue += '.';
      }
      break;
    
    case 'percent':
      currentValue = String(parseFloat(currentValue) / 100);
      break;
    
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      performOperation();
      operation = action;
      previousValue = currentValue;
      waitingForOperand = true;
      break;
    
    case 'equals':
      performOperation();
      operation = null;
      previousValue = null;
      waitingForOperand = true;
      break;
  }
  
  updateDisplay();
}

function performOperation() {
  if (operation === null || previousValue === null) return;
  
  const prev = parseFloat(previousValue);
  const current = parseFloat(currentValue);
  let result;
  
  switch (operation) {
    case 'add':
      result = prev + current;
      break;
    case 'subtract':
      result = prev - current;
      break;
    case 'multiply':
      result = prev * current;
      break;
    case 'divide':
      if (current === 0) {
        currentValue = 'Error';
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }
  
  // Round to avoid floating point errors
  currentValue = String(Math.round(result * 100000000) / 100000000);
}

function updateDisplay() {
  display.textContent = currentValue;
}

updateDisplay();
