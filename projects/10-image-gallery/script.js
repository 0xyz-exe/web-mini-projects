let images = JSON.parse(localStorage.getItem('gallery-images')) || [];
let currentCategory = 'all';
let lightboxIndex = 0;

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const gallery = document.getElementById('gallery');
const themeToggle = document.getElementById('themeToggle');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const closeLightbox = document.getElementById('closeLightbox');

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

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const category = prompt('Category (e.g., nature, people, tech):', 'general') || 'general';
      
      const image = {
        id: Date.now() + Math.random(),
        name: file.name,
        category: category.toLowerCase(),
        dataUrl: event.target.result,
        addedAt: new Date().toISOString()
      };

      images.push(image);
      saveImages();
      updateCategories();
      render();
    };
    reader.readAsDataURL(file);
  });

  fileInput.value = '';
});

searchInput.addEventListener('input', render);
categoryFilter.addEventListener('change', (e) => {
  currentCategory = e.target.value;
  render();
});

function updateCategories() {
  const categories = ['all', ...new Set(images.map(img => img.category))];
  categoryFilter.innerHTML = categories.map(cat => 
    `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
  ).join('');
  categoryFilter.value = currentCategory;
}

function render() {
  const search = searchInput.value.toLowerCase();
  
  let filtered = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(search) || 
                         img.category.toLowerCase().includes(search);
    const matchesCategory = currentCategory === 'all' || img.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    gallery.innerHTML = '<div class="empty-state">📷 No images. Upload some to get started!</div>';
  } else {
    gallery.innerHTML = filtered.map((img, index) => `
      <div class="gallery-item" onclick="openLightbox(${images.indexOf(img)})">
        <img src="${img.dataUrl}" alt="${escapeHtml(img.name)}" loading="lazy">
        <div class="item-info">
          <div class="item-name">${escapeHtml(img.name)}</div>
          <div class="item-category">${img.category}</div>
        </div>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteImage(${img.id})">🗑️</button>
      </div>
    `).join('');
  }
}

function openLightbox(index) {
  lightboxIndex = index;
  showLightbox();
}

function showLightbox() {
  const img = images[lightboxIndex];
  lightboxImg.src = img.dataUrl;
  lightboxTitle.textContent = img.name;
  lightbox.classList.add('active');
}

function closeLightboxFn() {
  lightbox.classList.remove('active');
}

prevBtn.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
  showLightbox();
});

nextBtn.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % images.length;
  showLightbox();
});

closeLightbox.addEventListener('click', closeLightboxFn);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightboxFn();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  
  if (e.key === 'ArrowLeft') prevBtn.click();
  if (e.key === 'ArrowRight') nextBtn.click();
  if (e.key === 'Escape') closeLightboxFn();
});

function deleteImage(id) {
  if (confirm('Delete this image?')) {
    images = images.filter(img => img.id !== id);
    saveImages();
    updateCategories();
    render();
  }
}

function saveImages() {
  // ponytail: localStorage has ~5-10MB limit; large galleries will fail
  try {
    localStorage.setItem('gallery-images', JSON.stringify(images));
  } catch (e) {
    alert('Storage full. Consider deleting some images.');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

updateCategories();
render();
