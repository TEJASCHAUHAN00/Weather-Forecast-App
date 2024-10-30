const apiKey = 'be34fba6b7e52f49f84e07ad8f31b2d1'; 
let weatherChart; 

const iconMap = {
    'Clear': 'icons/sunny.png',
    'Clouds': 'icons/cloudy.png',
    'Rain': 'icons/rainy.png',
    'Snow': 'icons/snowy.png',
    'Drizzle': 'icons/drizzle.png',
    'Thunderstorm': 'icons/thunderstorm.png',
    'Mist': 'icons/mist.png',
    
};


const backgroundColor = '#ADD8E6'; 

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getWeatherDataByCoordinates(latitude, longitude);
            },
            () => {
                
                getWeatherData('Delhi');
            }
        );
    } else {
        
        getWeatherData('Delhi');
    }
};

document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim() || 'Delhi'; // Default to Delhi
    getWeatherData(city);
});

async function getWeatherData(city) {
    try {
        
        const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

        
        if (!currentWeatherResponse.ok) {
            throw new Error('City not found'); 
        }

        const currentWeather = await currentWeatherResponse.json();

        
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

        
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available'); 
        }

        const forecastData = await forecastResponse.json();

        
        displayCurrentWeather(currentWeather);

        
        const chartData = prepareChartData(forecastData);
        displayChart(chartData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('currentWeather').innerHTML = `<p>${error.message}</p>`;
        document.getElementById('weatherIcon').src = ''; 
    }
}

async function getWeatherDataByCoordinates(latitude, longitude) {
    try {
        
        const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);

        
        if (!currentWeatherResponse.ok) {
            throw new Error('Unable to retrieve location weather data');
        }

        const currentWeather = await currentWeatherResponse.json();

        
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);

        
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available'); 
        }

        const forecastData = await forecastResponse.json();

        // Display current weather
        displayCurrentWeather(currentWeather);

        // Prepare data for chart
        const chartData = prepareChartData(forecastData);
        displayChart(chartData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('currentWeather').innerHTML = `<p>${error.message}</p>`;
        document.getElementById('weatherIcon').src = ''; // Clear the weather icon on error
    }
}

function displayCurrentWeather(data) {
    if (data.cod === 200) {
        const weatherCondition = data.weather[0].main; // Get weather condition
        const weatherIconPath = iconMap[weatherCondition] || 'icons/default.png'; // Default icon if not found

        document.getElementById('weatherIcon').src = weatherIconPath; // Set the weather icon
        document.body.style.backgroundColor = backgroundColor; // Change background color to Light Blue

        const weatherInfo = `
            <h2>Current Weather in ${data.name}</h2>
            <p>Condition: ${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp} °C</p>
            <p>Humidity: ${data.main.humidity} %</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
            <p>Date: ${new Date().toLocaleString()}</p>
        `;
        document.getElementById('currentWeather').innerHTML = weatherInfo;
    } else {
        document.getElementById('currentWeather').innerHTML = '<p>Weather data not available</p>';
    }
}

function prepareChartData(data) {
    const labels = [];
    const temperatures = [];
    const humidities = [];

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString();

        if (!labels.includes(day)) {
            labels.push(day);
            temperatures.push(item.main.temp);
            humidities.push(item.main.humidity);
        }
    });

    return {
        labels: labels,
        temperatures: temperatures,
        humidities: humidities,
    };
}

function displayChart(data) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    if (weatherChart) {
        weatherChart.destroy(); 
    }

    weatherChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: data.temperatures,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)', 
                    borderColor: 'rgba(255, 99, 132, 1)', 
                    borderWidth: 1,
                },
                {
                    label: 'Humidity (%)',
                    data: data.humidities,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)', 
                    borderColor: 'rgba(54, 162, 235, 1)', 
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)', 
                    },
                    ticks: {
                        color: 'white', 
                    },
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)', 
                    },
                    ticks: {
                        color: 'white', 
                    },
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white', 
                    },
                },
            },
        },
    });
}
