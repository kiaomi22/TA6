const API_KEY = '10cfd092f533bce4a4cba799d80cd149';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let currentCity = 'Depok';
let units = 'metric';

const cityInput = document.getElementById('cityInput');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const currentLocationBtn = document.getElementById('currentLocationBtn');

window.addEventListener('load', () => {
    startClock();
    fetchWeatherData(currentCity);
    
    setInterval(() => fetchWeatherData(currentCity), 300000);
});

cityInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const city = cityInput.value.trim();
        if(city) {
            currentCity = city;
            fetchWeatherData(city);
        }
    }
});

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

currentLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            alert("Fitur auto-location akan diaktifkan segera!"); 
        });
    }
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

    } catch (error) {
        alert(error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

function updateMainUI(data) {
    document.getElementById('cityName').textContent = data.name;

    document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°C';
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
    document.getElementById('condition').textContent = data.weather[0].main;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed) + ' km/h';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('uvIndex').textContent = 'Med';

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunriseTime').textContent = sunrise.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
    document.getElementById('sunsetTime').textContent = sunset.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
}

function updateForecastUI(data) {
    const list = data.list;

    const dailyData = list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
    const daysContainer = document.getElementById('forecastDaysContainer');
    daysContainer.innerHTML = '';

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
        
        const html = `
        <div class="forecast-row">
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
            <div class="f-temp">${Math.round(day.main.temp)}°C</div>
            <div class="f-day">${dayName}</div>
        </div>`;
        daysContainer.innerHTML += html;
    });

    const hourlyData = list.slice(0, 6);
    const hourlyContainer = document.getElementById('hourlyContainer');
    hourlyContainer.innerHTML = '';

    hourlyData.forEach(item => {
        const time = item.dt_txt.split(' ')[1].substring(0, 5);
        
        const windDeg = item.wind.deg;
        
        const html = `
        <div class="hourly-item">
            <span class="hourly-time">${time}</span>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
            <span class="hourly-temp">${Math.round(item.main.temp)}°C</span>
            <div class="wind-dir" style="transform: rotate(${windDeg}deg)">
                <i class="fas fa-location-arrow"></i>
            </div>
            <span style="font-size: 0.7rem;">${Math.round(item.wind.speed)}km/h</span>
        </div>`;
        hourlyContainer.innerHTML += html;
    });
}