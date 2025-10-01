document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('city-input')
  const searchBtn = document.getElementById('search-btn')

  const apiKey = 'f286f516db524679835102903252909'

  // Load initial weather for a default location
  getWeatherByQuery('Yaoundé')

  searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim()
    if (city) {
      getWeatherByQuery(city)
    }
  })

  // Allow search on pressing "Enter"
  cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      searchBtn.click()
    }
  })

  // Fetches weather data using WeatherAPI
  async function getWeatherByQuery (query) {
    // days=6 requests today + 5 forecast days, which aligns with the UI logic
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5`

    try {
      const response = await fetch(forecastUrl)
      const data = await response.json()

      if (response.ok) {
        updateUI(data)
      } else {
        updateUI(null, `Error: ${data.error.message}`)
        alert('City not found. Please try again.')
      }
    } catch (error) {
      console.error('Weather API failed:', error)
      updateUI(null, 'Failed to fetch weather data.')
      alert('Failed to fetch weather data.')
    }
  }

  function updateUI (weatherData, errorMessage = null) {
    if (errorMessage) {
      document.getElementById('city-name').textContent = 'Location Not Found'
      document.getElementById('temperature').textContent = '--°C'
      document.getElementById('weather-description').textContent = errorMessage
      document.getElementById('weather-icon').src = ""
      document.getElementById('forecast-list').innerHTML = ""
      document.body.className = ""
      return
    }

    const current = weatherData.current
    const location = weatherData.location
    const forecastDays = weatherData.forecast.forecastday
    const isDay = current.is_day
    const conditionCode = current.condition.code

    document.body.className = ""

    let weatherClass = ""
    switch (conditionCode) {
      case 1000: // Clear/Sunny
        weatherClass = isDay ? 'clear' : 'night';
        break
      case 1003: // Partly cloudy
      case 1006: // Cloudy
      case 1009: // Overcast
        weatherClass = "cloudy"
        break
      case 1063: // Patchy rain possible
      case 1183: // Light rain
      case 1189: // Moderate rain
      case 1195: // Heavy rain
      case 1150: // Light drizzle
        weatherClass = "rainy"
        break
      case 1213: // Light snow
      case 1219: // Moderate snow
      case 1225: // Heavy snow
      case 1066: // Patchy snow possible
        weatherClass = "snowy"
        break
      case 1279: // Patchy light rain with thunder
      case 1282: // Moderate or heavy rain with thunder
      case 1087: // Thundery outbreaks possible
        weatherClass = "thunderstorm"
        break
      default:
        // Fallback to cloudy for unhandled conditions
        weatherClass = "cloudy"
        break
    }

    if (weatherClass) {
      document.body.classList.add(weatherClass)
    }

    document.getElementById('city-name').textContent = location.name
    document.getElementById('temperature').textContent = `${Math.round(
      current.temp_c
    )}°C`
    document.getElementById('weather-description').textContent =
      current.condition.text
    document.getElementById('weather-icon').src = current.condition.icon

    // Update the current weather section
    const forecastList = document.getElementById('forecast-list')
    forecastList.innerHTML = "" // Clear previous forecast

    //Loop from index 1 to get the next 5 days of forecast (index 0 is today)
    for (let i = 1; i < forecastDays.length; i++) {
      const day = forecastDays[i]
      const date = new Date(day.date)

      const forecastItem = document.createElement('div')
      forecastItem.classList.add('forecast-item')
      forecastItem.innerHTML = `
            <p class='day-info'>${date.toLocaleDateString('en-US', {
              weekday: 'long',
            })}</p>
            <img src='${day.day.condition.icon}' alt='Forecast Icon'>
            <p class='temp-info'>${Math.round(
              day.day.maxtemp_c
            )}° / ${Math.round(day.day.mintemp_c)}°</p>
        `;
      forecastList.appendChild(forecastItem);
    }
  }
});
