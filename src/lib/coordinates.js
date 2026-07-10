const CITY_COORDINATES = {
  'hong kong': { latitude: 22.3193, longitude: 114.1694 },
  '香港': { latitude: 22.3193, longitude: 114.1694 },
  'tokyo': { latitude: 35.6762, longitude: 139.6503 },
  '東京': { latitude: 35.6762, longitude: 139.6503 },
  'taipei': { latitude: 25.033, longitude: 121.5654 },
  '台北': { latitude: 25.033, longitude: 121.5654 },
  '臺北': { latitude: 25.033, longitude: 121.5654 },
  'osaka': { latitude: 34.6937, longitude: 135.5023 },
  '大阪': { latitude: 34.6937, longitude: 135.5023 },
  'seoul': { latitude: 37.5665, longitude: 126.978 },
  '首爾': { latitude: 37.5665, longitude: 126.978 },
  'bangkok': { latitude: 13.7563, longitude: 100.5018 },
  '曼谷': { latitude: 13.7563, longitude: 100.5018 },
  'singapore': { latitude: 1.3521, longitude: 103.8198 },
  '新加坡': { latitude: 1.3521, longitude: 103.8198 },
  'london': { latitude: 51.5072, longitude: -0.1276 },
  '倫敦': { latitude: 51.5072, longitude: -0.1276 },
  'paris': { latitude: 48.8566, longitude: 2.3522 },
  '巴黎': { latitude: 48.8566, longitude: 2.3522 },
  'new york': { latitude: 40.7128, longitude: -74.006 },
  '紐約': { latitude: 40.7128, longitude: -74.006 }
}

export const supportedCities = [
  'Hong Kong',
  'Tokyo',
  'Taipei',
  'Osaka',
  'Seoul',
  'Bangkok',
  'Singapore',
  'London',
  'Paris',
  'New York'
]

export function getCityCoordinates(city) {
  const normalizedCity = city.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
  return CITY_COORDINATES[normalizedCity] ?? null
}
