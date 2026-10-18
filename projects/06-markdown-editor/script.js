const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeToggle = document.getElementById('themeToggle');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const toolBtns = document.querySelectorAll('.btn-tool');

// Sample content
const sampleMarkdown = `# Welcome to Markdown Editor

## Features

This is a **live preview** markdown editor with:

- Real-time rendering
- Syntax shortcuts
- Download support
- Dark/light theme

## Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## More Markdown

You can use *italic*, **bold**, and \`inline code\`.

> Blockquotes are also supported!

[Learn more about Markdown](https://www.markdownguide.org/)
`;

// Load saved or sample
editor.value = localStorage.getItem('markdown') || sampleMarkdown;

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

// Toolbar
toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const md = btn.dataset.md;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);

    let newText;
    if (md === '**' || md === '*') {
      newText = text.substring(0, start) + md + selectedText + md + text.substring(end);
      editor.value = newText;
      editor.selectionStart = start + md.length;
      editor.selectionEnd = end + md.length;
    } else if (md === '[]()') {
      newText = text.substring(0, start) + '[' + selectedText + ']()' + text.substring(end);
      editor.value = newText;
      editor.selectionStart = end + 3;
    } else {
      newText = text.substring(0, start) + md + selectedText + text.substring(end);
      editor.value = newText;
      editor.selectionStart = start + md.length;
      editor.selectionEnd = end + md.length;
    }

    editor.focus();
    updatePreview();
  });
});

// Update preview
function updatePreview() {
  const markdown = editor.value;
  const html = parseMarkdown(markdown);
  preview.innerHTML = html;
  localStorage.setItem('markdown', markdown);
}

// Simple markdown parser (safe rendering)
function parseMarkdown(md) {
  // Escape HTML first
  let html = escapeHtml(md);

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.match(/^<(h|ul|ol|li|blockquote|pre)/)) {
      return para;
    }
    return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Download
downloadBtn.addEventListener('click', () => {
  const content = editor.value;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `markdown-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

// Clear
clearBtn.addEventListener('click', () => {
  if (confirm('Clear all content?')) {
    editor.value = '';
    updatePreview();
  }
});

// Live update
editor.addEventListener('input', updatePreview);

// Initial render
updatePreview();
