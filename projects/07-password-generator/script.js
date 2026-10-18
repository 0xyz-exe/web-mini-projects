const passwordDisplay = document.getElementById('passwordDisplay');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const uppercase = document.getElementById('uppercase');
const lowercase = document.getElementById('lowercase');
const numbers = document.getElementById('numbers');
const symbols = document.getElementById('symbols');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const themeToggle = document.getElementById('themeToggle');

let currentPassword = '';

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

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

lengthSlider.addEventListener('input', (e) => {
  lengthValue.textContent = e.target.value;
});

generateBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentPassword);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    alert('Failed to copy: ' + err.message);
  }
});

function generatePassword() {
  const length = parseInt(lengthSlider.value);
  let charset = '';
  
  if (uppercase.checked) charset += UPPERCASE_CHARS;
  if (lowercase.checked) charset += LOWERCASE_CHARS;
  if (numbers.checked) charset += NUMBER_CHARS;
  if (symbols.checked) charset += SYMBOL_CHARS;

  if (charset === '') {
    alert('Please select at least one character type');
    return;
  }

  // Use crypto.getRandomValues for secure random generation
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  currentPassword = password;
  passwordDisplay.textContent = password;
  copyBtn.disabled = false;
  
  calculateStrength(password);
}

function calculateStrength(password) {
  let strength = 0;
  const length = password.length;
  
  // Length score
  if (length >= 8) strength += 1;
  if (length >= 12) strength += 1;
  if (length >= 16) strength += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  
  const maxStrength = 7;
  const percentage = (strength / maxStrength) * 100;
  
  strengthFill.style.width = `${percentage}%`;
  
  if (strength <= 2) {
    strengthFill.style.background = '#ef4444';
    strengthText.textContent = 'Weak';
    strengthText.style.color = '#ef4444';
  } else if (strength <= 4) {
    strengthFill.style.background = '#f59e0b';
    strengthText.textContent = 'Fair';
    strengthText.style.color = '#f59e0b';
  } else if (strength <= 5) {
    strengthFill.style.background = '#3b82f6';
    strengthText.textContent = 'Good';
    strengthText.style.color = '#3b82f6';
  } else {
    strengthFill.style.background = '#10b981';
    strengthText.textContent = 'Strong';
    strengthText.style.color = '#10b981';
  }
}

// Generate on load
generatePassword();
