const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const getCurrentLocation = document.getElementById('getCurrentLocation');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const weatherContent = document.getElementById('weatherContent');
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

searchBtn.addEventListener('click', () => {
  const query = locationInput.value.trim();
  if (!query) {
    showError('Please enter a city name or coordinates');
    return;
  }
  
  // Check if input is coordinates (lat,lon)
  const coordMatch = query.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const [, lat, lon] = coordMatch;
    fetchWeather(parseFloat(lat), parseFloat(lon), query);
  } else {
    geocodeLocation(query);
  }
});

locationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

getCurrentLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation not supported by your browser');
    return;
  }

  showLoading();
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeather(position.coords.latitude, position.coords.longitude, 'Your Location');
    },
    (error) => {
      hideLoading();
      showError('Unable to get your location: ' + error.message);
    }
  );
});

async function geocodeLocation(cityName) {
  showLoading();
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('Location not found');
    }

    const location = data.results[0];
    fetchWeather(location.latitude, location.longitude, location.name + (location.country ? `, ${location.country}` : ''));
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}

async function fetchWeather(lat, lon, locationName) {
  showLoading();
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!response.ok) throw new Error('Weather data unavailable');

    const data = await response.json();
    hideLoading();
    displayWeather(data, locationName);
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}

function displayWeather(data, locationName) {
  weatherContent.style.display = 'block';
  errorDiv.style.display = 'none';

  // Current weather
  document.getElementById('locationName').textContent = locationName;
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.getElementById('currentTemp').textContent = Math.round(data.current.temperature_2m);
  document.getElementById('feelsLike').textContent = Math.round(data.current.apparent_temperature) + '°C';
  document.getElementById('humidity').textContent = data.current.relative_humidity_2m + '%';
  document.getElementById('windSpeed').textContent = Math.round(data.current.wind_speed_10m) + ' km/h';
  document.getElementById('conditions').textContent = getWeatherDescription(data.current.weather_code);
  document.getElementById('weatherIcon').textContent = getWeatherIcon(data.current.weather_code);

  // Forecast
  const forecastHTML = data.daily.time.slice(1, 6).map((date, index) => {
    const dayIndex = index + 1;
    return `
      <div class="forecast-card">
        <div class="forecast-day">${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
        <div class="forecast-icon">${getWeatherIcon(data.daily.weather_code[dayIndex])}</div>
        <div class="forecast-temp">
          <span class="temp-max">${Math.round(data.daily.temperature_2m_max[dayIndex])}°</span>
          <span class="temp-min">${Math.round(data.daily.temperature_2m_min[dayIndex])}°</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('forecast').innerHTML = forecastHTML;
}

function getWeatherIcon(code) {
  const iconMap = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '🌨️',
    77: '❄️', 80: '🌦️', 81: '🌧️', 82: '⛈️',
    85: '🌨️', 86: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  return iconMap[code] || '🌡️';
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy rain showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
  };
  return descriptions[code] || 'Unknown';
}

function showLoading() {
  loadingDiv.style.display = 'block';
  weatherContent.style.display = 'none';
  errorDiv.style.display = 'none';
}

function hideLoading() {
  loadingDiv.style.display = 'none';
}

function showError(message) {
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
  weatherContent.style.display = 'none';
}

// Load default location
geocodeLocation('London');
