// OpenWeatherMap API Integration for Kampala & Regional Ugandan Forecasts

const WEATHER_API_KEY = 'your-openweathermap-api-key-here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch current weather conditions and storm alerts for Kampala or regional areas
 * @param {string} city - Default is 'Kampala'
 */
export async function getRegionalWeather(city = 'Kampala') {
  try {
    const response = await fetch(`${BASE_URL}?q=${city},UG&units=metric&appid=${WEATHER_API_KEY}`);
    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        temp: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        cityName: data.name,
      };
    } else {
      console.error('Weather API Error:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Network request failed:', error);
    return { success: false, message: 'Network connection error' };
  }
}