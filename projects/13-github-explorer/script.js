const usernameInput = document.getElementById('usernameInput');
const searchBtn = document.getElementById('searchBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const profileDiv = document.getElementById('profile');
const reposSection = document.getElementById('reposSection');
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

searchBtn.addEventListener('click', search);
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') search();
});

async function search() {
  const username = usernameInput.value.trim();
  if (!username) {
    showError('Please enter a username');
    return;
  }

  hideAll();
  loadingDiv.style.display = 'block';

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`)
    ]);

    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error('User not found');
      } else if (userRes.status === 403) {
        throw new Error('Rate limit exceeded. Try again later.');
      } else {
        throw new Error('Failed to fetch user data');
      }
    }

    const user = await userRes.json();
    const repos = await reposRes.json();

    displayProfile(user);
    displayRepos(repos);
  } catch (error) {
    showError(error.message);
  } finally {
    loadingDiv.style.display = 'none';
  }
}

function displayProfile(user) {
  document.getElementById('avatar').src = user.avatar_url;
  document.getElementById('name').textContent = user.name || user.login;
  document.getElementById('username').textContent = '@' + user.login;
  document.getElementById('bio').textContent = user.bio || 'No bio available';
  document.getElementById('repos').textContent = user.public_repos;
  document.getElementById('followers').textContent = user.followers;
  document.getElementById('following').textContent = user.following;

  profileDiv.style.display = 'block';
}

function displayRepos(repos) {
  if (repos.length === 0) {
    reposSection.style.display = 'none';
    return;
  }

  const reposHTML = repos.map(repo => `
    <div class="repo-card">
      <a href="${repo.html_url}" target="_blank" style="text-decoration:none;color:inherit">
        <div class="repo-name">${escapeHtml(repo.name)}</div>
      </a>
      <div class="repo-desc">${escapeHtml(repo.description || 'No description')}</div>
      <div class="repo-meta">
        ${repo.language ? `<span>🔵 ${repo.language}</span>` : ''}
        <span>⭐ ${repo.stargazers_count}</span>
        <span>🍴 ${repo.forks_count}</span>
      </div>
    </div>
  `).join('');

  document.getElementById('reposGrid').innerHTML = reposHTML;
  reposSection.style.display = 'block';
}

function showError(message) {
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
  profileDiv.style.display = 'none';
  reposSection.style.display = 'none';
}

function hideAll() {
  errorDiv.style.display = 'none';
  profileDiv.style.display = 'none';
  reposSection.style.display = 'none';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
