const weatherEmojis = {
    'clear sky': '🌞',
    'few clouds': '🌤️',
    'scattered clouds': '⛅️',
    'broken clouds': '☁️',
    'overcast clouds': '☁️',
    'rain': '🌧️',
    'light rain': '🌧️',
    'moderate rain': '🌧️',
    'drizzle': '🌧️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️'
}

// Function to get the current weather using XMLHttpRequest
function getCurrentWeather(city) {
  const apiKey = '7ded80d91f2b280ec979100cc8bbba94';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      const weatherData = JSON.parse(xhr.responseText);
      console.log("Current weather data:");
      console.log(weatherData);
      displayCurrentWeather(weatherData);
    }
  };
  xhr.send();
}

// Function to get the 5-day forecast using Fetch API
function getForecast(city) {
  const apiKey = '7ded80d91f2b280ec979100cc8bbba94';
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(response => response.json())
    .then(forecastData => displayForecast(forecastData));
}

// Function to display the current weather
function displayCurrentWeather(weatherData) {
  const weatherHtml = `
    <h1>${weatherData.name}</h1>
    <div id="display">
        <div id="current">
            <h2>Current Weather</h2>
        </div>
        <div id="cityWeather">
            <p class="emoji">${weatherEmojis[weatherData.weather[0].description]}</p>
            <p>${weatherData.weather[0].description}</p>
            <p>Temperature: ${weatherData.main.temp}°C</p>
        </div>
    </div>
  `;
  document.getElementById('weather').innerHTML = weatherHtml;
}

// Function to display the 5-day forecast
function displayForecast(forecastData) {
    console.log("Forecast data:");
    console.log(forecastData);
    const hours = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
    const now = new Date(); // Current date and time

    let forecastHtml = `
      <h2>5-day forecast</h2>
      <table>
        <tr>
          <th>Day</th>
          ${hours.map(hour => `<th>${hour}</th>`).join('')}
        </tr>
    `;

    // Group forecast data by day
    const days = [];
    forecastData.list.forEach(forecast => {
        const date = forecast.dt_txt.split(' ')[0];
        if (!days[date]) days[date] = [];
        days[date].push(forecast);
    });

    let skip = 0;

    // Populate forecast data in the table
    Object.keys(days).forEach((date, dayIndex) => {
        if (dayIndex < 5) {
            if(dayIndex === 0) {
                forecastHtml += `<tr><td>Today</td>`;
            }
            else {
                forecastHtml += `<tr><td>Day ${dayIndex + 1}</td>`;
            }

            hours.forEach(hour => {
                const forecast = days[date].find(f => f.dt_txt.includes(hour));
                
                if(skip === 0) {
                    skip = 1;
                    forecastHtml += `<td>&nbsp;</td>`;
                } else {
                    if (forecast) {
                        const forecastDateTime = new Date(forecast.dt_txt);

                        // Skip past forecasts on Day 1
                        if (dayIndex === 0 && forecastDateTime <= now) {
                            forecastHtml += `<td>&nbsp;</td>`;
                        } else {
                            forecastHtml += `<td>
                            <p class="emoji">${weatherEmojis[forecast.weather[0].description]}</p>
                            <p>${forecast.weather[0].description}</p>
                            <p>Temp: ${forecast.main.temp}°C</p>
                            </td>`;
                        }
                    } else {
                        forecastHtml += `<td>&nbsp;</td>`;
                    }
                }
            });

            forecastHtml += `</tr>`;
        }
    });

    forecastHtml += `</table>`;
    document.getElementById('forecast').innerHTML = forecastHtml;
}

// Main function to handle the button click
function getWeather() {
  const city = document.getElementById('city').value;
  if (city) {
    getCurrentWeather(city);
    getForecast(city);
  }
}