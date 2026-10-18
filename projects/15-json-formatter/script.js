const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');
const statusEl = document.getElementById('status');
const errorMsg = document.getElementById('errorMsg');
const themeToggle = document.getElementById('themeToggle');

const validateBtn = document.getElementById('validateBtn');
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');

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

validateBtn.addEventListener('click', validate);
formatBtn.addEventListener('click', format);
minifyBtn.addEventListener('click', minify);
copyBtn.addEventListener('click', copy);
clearBtn.addEventListener('click', clear);
sampleBtn.addEventListener('click', loadSample);

function validate() {
  const input = inputEl.value.trim();
  if (!input) {
    showError('Input is empty');
    return;
  }

  try {
    JSON.parse(input);
    showSuccess('Valid JSON ✓');
    hideError();
  } catch (err) {
    showError('Invalid JSON: ' + err.message);
    showInvalid();
  }
}

function format() {
  const input = inputEl.value.trim();
  if (!input) {
    showError('Input is empty');
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    outputEl.textContent = formatted;
    showSuccess('Formatted ✓');
    hideError();
  } catch (err) {
    showError('Invalid JSON: ' + err.message);
    showInvalid();
  }
}

function minify() {
  const input = inputEl.value.trim();
  if (!input) {
    showError('Input is empty');
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    outputEl.textContent = minified;
    showSuccess('Minified ✓');
    hideError();
  } catch (err) {
    showError('Invalid JSON: ' + err.message);
    showInvalid();
  }
}

async function copy() {
  const text = outputEl.textContent;
  if (!text) {
    alert('Output is empty');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    const original = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 2000);
  } catch (err) {
    alert('Failed to copy: ' + err.message);
  }
}

function clear() {
  inputEl.value = '';
  outputEl.textContent = '';
  hideError();
  hideStatus();
}

function loadSample() {
  const sample = {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "hobbies": ["reading", "coding", "gaming"],
    "active": true
  };

  inputEl.value = JSON.stringify(sample);
}

function showSuccess(message) {
  statusEl.textContent = message;
  statusEl.className = 'status valid';
  statusEl.style.display = 'block';
}

function showInvalid() {
  statusEl.textContent = 'Invalid';
  statusEl.className = 'status invalid';
  statusEl.style.display = 'block';
  outputEl.textContent = '';
}

function hideStatus() {
  statusEl.style.display = 'none';
}

function showError(message) {
  errorMsg.textContent = '❌ ' + message;
  errorMsg.style.display = 'block';
}

function hideError() {
  errorMsg.style.display = 'none';
}

// Load sample on start
loadSample();
format();
