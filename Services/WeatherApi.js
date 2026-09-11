import { supabase } from '../supabaseClient'; // Adjust path if your client is located elsewhere

// OpenWeatherMap API Integration with Supabase caching & dynamic key retrieval

const DEFAULT_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch current weather conditions and storm alerts for Kampala or regional areas
 * Pulls API key dynamically from Supabase if stored in an admin/system config table, with fallback to local env or default.
 * @param {string} city - Default is 'Kampala'
 */
export async function getRegionalWeather(city = 'Kampala') {
  try {
    let apiKey = 'your-openweathermap-api-key-here'; // Default fallback

    // Attempt to fetch API key dynamically from Supabase system settings table if available
    try {
      const { data, error } = await supabase
        .from('admin_system_switches') // Or a dedicated system_config table if you have one
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data && data.weather_api_key) {
        apiKey = data.weather_api_key;
      }
    } catch (dbErr) {
      // Fallback silently if table column doesn't exist yet
    }

    const response = await fetch(`${DEFAULT_BASE_URL}?q=${encodeURIComponent(city)},UG&units=metric&appid=${apiKey}`);
    const data = await response.json();

    if (response.ok) {
      const weatherResult = {
        success: true,
        temp: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        cityName: data.name,
        timestamp: new Date().toISOString(),
      };

      // Optionally log weather telemetry or cache to Supabase for offline mesh access
      try {
        await supabase.from('weather_telemetry_cache').upsert([
          {
            city: data.name,
            temp: data.main.temp,
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            updated_at: new Date(),
          }
        ], { onConflict: 'city' });
      } catch (cacheErr) {}

      return weatherResult;
    } else {
      console.error('Weather API Error:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Network request failed:', error);
    return { success: false, message: 'Network connection error' };
  }
}