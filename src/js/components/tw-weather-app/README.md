# tw-weather-app component

The tw-weather-app component is a web component that displays weather information for a specific location. It consists of a weather application UI, including a search field, search button, geolocation button, today's weather container, and a forecast box. The component retrieves weather data from the WeatherAPI.com service using the RapidAPI platform.

## Attributes

### City

The end user can search for a city to show the weather.

Default value: there are no default value. The user must search for a city or use the geolocator.

## Events

| Event Name    | Fired When            |
| ------------- | --------------------- |
| Geolocator      | clicked button     |
| City search| clicked button|

## Example

```html
<tw-weather-app></tw-weather-app>
