const API_KEY = '98d535c4e2bae5f6a2b8d5c51d1843b7';
let myChart; 

/*const mockForecastData = {
    city: { name: "Ciudad de Prueba" },
    list: [
        { dt_txt: "2024-05-20 12:00:00", main: { temp: 22.5 } },
        { dt_txt: "2024-05-20 15:00:00", main: { temp: 25.1 } },
        { dt_txt: "2024-05-20 18:00:00", main: { temp: 23.8 } },
        { dt_txt: "2024-05-20 21:00:00", main: { temp: 19.5 } },
        { dt_txt: "2024-05-21 00:00:00", main: { temp: 17.2 } },
        { dt_txt: "2024-05-21 03:00:00", main: { temp: 16.0 } },
        { dt_txt: "2024-05-21 06:00:00", main: { temp: 15.5 } },
        { dt_txt: "2024-05-21 09:00:00", main: { temp: 20.1 } }
    ]
};

const mockCurrentWeather = {
    name: "Madrid",
    main: {
        temp: 18.5,
        temp_min: 12.0,
        temp_max: 22.3,
        humidity: 45,
        pressure: 1013
    },
    wind: {
        speed: 4.5,
        deg: 180
    },
    weather: [
        { icon: "01d", description: "cielo despejado" }
    ]
};

window.onload = () => {
    displayWeather(mockCurrentWeather);
    renderChart(mockForecastData); 
};*/

async function getWeatherData(lat, lng) {
    const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`;
    const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`;

    try {
        const [resCurrent, resForecast] = await Promise.all([
            fetch(urlCurrent).then(r => r.json()),
            fetch(urlForecast).then(r => r.json())
            
        ]);
        displayWeather(resCurrent);
        renderChart(resForecast);
        const response = await fetch(urlForecast);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error de la API:", errorData.message);
            return;
        }
    } catch (error) {
        console.error("Error obteniendo datos:", error);
    }
}


const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker;

navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    updateLocation(latitude, longitude);
});

map.on('click', e => {
    const { lat, lng } = e.latlng;
    updateLocation(lat, lng);
});

function updateLocation(lat, lng) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    map.flyTo([lat, lng], 13);
    
    getWeatherData(lat, lng);
}

function displayWeather(data) {
const infoDiv = document.getElementById('current-weather');
    const cityName = document.getElementById('city-name');

    const temp = Math.round(data.main.temp);
    const tempMax = Math.round(data.main.temp_max);
    const tempMin = Math.round(data.main.temp_min);
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = data.wind.speed;
    const windDeg = data.wind.deg;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    cityName.innerText = `Clima en ${data.name}`;

    infoDiv.innerHTML = `
            <div class="weather-card">
                <div class="main-stats">
                    <img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="icono-clima">
                    <div class="temp-principal">${temp}°C</div>
                    <div class="desc-clima">${description}</div>
                </div>
                
                <div class="details-grid">
                    <div class="detail-item">
                        <span>Máx / Mín</span>
                        <strong>${tempMax}° / ${tempMin}°</strong>
                    </div>
                    <div class="detail-item">
                        <span>Humedad</span>
                        <strong>${humidity}%</strong>
                    </div>
                    <div class="detail-item">
                        <span>Presión</span>
                        <strong>${pressure} hPa</strong>
                    </div>
                    <div class="detail-item">
                        <span>Viento</span>
                        <strong>${windSpeed} m/s</strong>
                        <small>Dir: ${windDeg}°</small>
                    </div>
                </div>
            </div>
        `;
}

function renderChart(data) {
    const ctx = document.getElementById('forecast-chart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const labels = data.list.map(item => item.dt_txt.split(' ')[1].substring(0, 5));
    const temps = data.list.map(item => item.main.temp);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatura Próximas 24h (°C)',
                data: temps,
                borderColor: '#ff5733',
                backgroundColor: 'rgba(255, 87, 51, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Grados Celsius' }
                }
            }
        }
    });
}