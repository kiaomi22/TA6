const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let currentCity = 'Jakarta';
let units = 'metric'; 
let isDarkMode = false;
let updateInterval;

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const themeToggle = document.getElementById('themeToggle');
const unitToggle = document.getElementById('unitToggle');
const saveCityBtn = document.getElementById('saveCityBtn');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

window.addEventListener('load', () => {
    loadPreferences();
    loadFavorites();
    fetchWeatherData(currentCity);
    
    startRealTimeUpdates();
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        fetchWeatherData(city);
    }
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        currentCity = city;
        fetchWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

refreshBtn.addEventListener('click', () => {
    fetchWeatherData(currentCity);
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon();
});

unitToggle.addEventListener('click', () => {
    units = units === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = units === 'metric' ? '°C' : '°F';
    fetchWeatherData(currentCity); 
});

saveCityBtn.addEventListener('click', saveFavoriteCity);

async function fetchWeatherData(city) {
    showLoading(true);
    errorMessage.classList.add('hidden');
    
    try {
        const currentRes = await fetch(`${BASE_URL}/weather?q=${city}&units=${units}&appid=${API_KEY}`);
        if (!currentRes.ok) throw new Error('Kota tidak ditemukan');
        const currentData = await currentRes.json();

        const forecastRes = await fetch(`${BASE_URL}/forecast?q=${city}&units=${units}&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        updateCurrentWeatherUI(currentData);
        updateForecastUI(forecastData.list);
        
        saveToHistory(city);

    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function updateCurrentWeatherUI(data) {
    document.getElementById('currentWeather').classList.remove('hidden');
    
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    
    const now = new Date();
    document.getElementById('dateTimestamp').textContent = `Update: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('unitDisplay').textContent = units === 'metric' ? '°C' : '°F';
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('windSpeed').textContent = data.wind.speed;
    document.getElementById('speedUnit').textContent = units === 'metric' ? 'm/s' : 'mph';
    document.getElementById('condition').textContent = data.weather[0].description;
    
    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function updateForecastUI(forecastList) {
    const grid = document.getElementById('forecastGrid');
    grid.innerHTML = ''; 
    document.getElementById('forecastSection').classList.remove('hidden');

    const dailyData = forecastList.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
            <p><strong>${Math.round(day.main.temp)}°</strong></p>
            <p class="text-small">${day.weather[0].main}</p>
        `;
        grid.appendChild(card);
    });
}

function startRealTimeUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        console.log('Auto-updating weather data...');
        fetchWeatherData(currentCity);
    }, 300000); 
}

function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
        document.getElementById('currentWeather').classList.add('hidden');
        document.getElementById('forecastSection').classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function saveFavoriteCity() {
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    if (!favorites.includes(currentCity)) {
        favorites.push(currentCity);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        loadFavorites();
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    const list = document.getElementById('favoritesList');
    const container = document.getElementById('favoritesSection');
    
    list.innerHTML = '';
    
    if (favorites.length > 0) {
        container.classList.remove('hidden');
        favorites.forEach(city => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `${city} <i class="fas fa-times" onclick="removeFavorite('${city}')"></i>`;
            
            chip.addEventListener('click', (e) => {
                if (e.target.tagName !== 'I') {
                    currentCity = city;
                    cityInput.value = city;
                    fetchWeatherData(city);
                }
            });
            list.appendChild(chip);
        });
    } else {
        container.classList.add('hidden');
    }
}

window.removeFavorite = function(city) {
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    favorites = favorites.filter(c => c !== city);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();
};

function saveToHistory(city) {
    // Digunakan untuk Auto-complete suggestions [cite: 1050]
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
    updateSuggestions();
}

function updateSuggestions() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const datalist = document.getElementById('citySuggestions');
    datalist.innerHTML = '';
    history.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
    }
    updateThemeIcon();
    updateSuggestions();
}