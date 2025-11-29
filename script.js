const API_KEY = '10cfd092f533bce4a4cba799d80cd149';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let currentCity = 'Jakarta';
let units = 'metric'; 

const cityInput = document.getElementById('cityInput');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const unitToggle = document.getElementById('unitToggle');
const refreshBtn = document.getElementById('refreshBtn');
const saveCityBtn = document.getElementById('saveCityBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');

window.addEventListener('load', () => {
    startClock();
    loadFavorites();
    fetchWeatherData(currentCity);
    
    setInterval(() => fetchWeatherData(currentCity), 300000);
});

cityInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const city = cityInput.value.trim();
        if(city) {
            currentCity = city;
            fetchWeatherData(city);
            cityInput.value = '';
        }
    }
});

refreshBtn.addEventListener('click', () => {
    refreshBtn.classList.add('fa-spin');
    fetchWeatherData(currentCity).then(() => {
        setTimeout(() => refreshBtn.classList.remove('fa-spin'), 1000);
    });
});

unitToggle.addEventListener('click', () => {
    units = units === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = units === 'metric' ? '°C' : '°F';
    fetchWeatherData(currentCity);
});

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

saveCityBtn.addEventListener('click', () => {
    saveFavorite();
});


function startClock() {
    const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('clockTime').textContent = `${hours}:${minutes}`;
        
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        document.getElementById('clockDate').textContent = now.toLocaleDateString('en-US', options);
    };
    updateTime();
    setInterval(updateTime, 1000);
}

async function fetchWeatherData(city) {
    loading.classList.remove('hidden');
    
    try {
        const weatherRes = await fetch(`${BASE_URL}/weather?q=${city}&units=${units}&appid=${API_KEY}`);
        if(!weatherRes.ok) throw new Error("City not found");
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(`${BASE_URL}/forecast?q=${city}&units=${units}&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        updateMainUI(weatherData);
        updateForecastUI(forecastData);
        checkIfFavorite(weatherData.name); 

    } catch (error) {
        alert(error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

function updateMainUI(data) {
    const speedUnit = units === 'metric' ? 'km/h' : 'mph';
    const tempUnit = units === 'metric' ? '°C' : '°F';

    document.getElementById('cityName').textContent = data.name;
    document.getElementById('temperature').textContent = Math.round(data.main.temp) + tempUnit;
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + tempUnit;
    document.getElementById('condition').textContent = data.weather[0].main;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed) + ' ' + speedUnit;
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('uvIndex').textContent = 'Med'; 

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunriseTime').textContent = sunrise.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
    document.getElementById('sunsetTime').textContent = sunset.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
}

function updateForecastUI(data) {
    const list = data.list;
    const tempUnit = units === 'metric' ? '°C' : '°F';

    const daysContainer = document.getElementById('forecastDaysContainer');
    daysContainer.innerHTML = '';

    const dailyData = {};
    list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = { min: item.main.temp, max: item.main.temp, icon: item.weather[0].icon, dt: item.dt };
        } else {
            dailyData[date].min = Math.min(dailyData[date].min, item.main.temp);
            dailyData[date].max = Math.max(dailyData[date].max, item.main.temp);
        }
    });

    Object.values(dailyData).slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });
        
        const html = `
        <div class="forecast-row">
            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="icon">
            <div class="f-day">${dayName}</div>
            <div class="f-temp">
                <span style="opacity:0.7">${Math.round(day.min)}°</span> / ${Math.round(day.max)}${tempUnit}
            </div>
        </div>`;
        daysContainer.innerHTML += html;
    });

    const hourlyData = list.slice(0, 6);
    const hourlyContainer = document.getElementById('hourlyContainer');
    hourlyContainer.innerHTML = '';

    hourlyData.forEach(item => {
        const time = item.dt_txt.split(' ')[1].substring(0, 5);
        const windDeg = item.wind.deg;
        const speedUnit = units === 'metric' ? 'km/h' : 'mph';
        
        const html = `
        <div class="hourly-item">
            <span class="hourly-time">${time}</span>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
            <span class="hourly-temp">${Math.round(item.main.temp)}°</span>
            <div class="wind-dir" style="transform: rotate(${windDeg}deg)">
                <i class="fas fa-location-arrow"></i>
            </div>
            <span style="font-size: 0.6rem;">${Math.round(item.wind.speed)}${speedUnit}</span>
        </div>`;
        hourlyContainer.innerHTML += html;
    });
}

function saveFavorite() {
    let favorites = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    if (!favorites.includes(currentCity)) {
        favorites.push(currentCity);
        localStorage.setItem('weatherFavs', JSON.stringify(favorites));
        loadFavorites();
        checkIfFavorite(currentCity);
    }
}

function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    favorites = favorites.filter(c => c !== city);
    localStorage.setItem('weatherFavs', JSON.stringify(favorites));
    loadFavorites();
    checkIfFavorite(currentCity);
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '';

    favorites.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'fav-chip';
        chip.innerHTML = `
            <span>${city}</span>
            <i class="fas fa-times delete-fav"></i>
        `;
        
        chip.addEventListener('click', () => {
            currentCity = city;
            fetchWeatherData(city);
        });

        chip.querySelector('.delete-fav').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(city);
        });

        container.appendChild(chip);
    });
}

function checkIfFavorite(city) {
    const favorites = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    const btn = document.getElementById('saveCityBtn');
    if (favorites.includes(city)) {
        btn.classList.remove('far');
        btn.classList.add('fas', 'active'); 
    } else {
        btn.classList.add('far');
        btn.classList.remove('fas', 'active'); 
    }
}