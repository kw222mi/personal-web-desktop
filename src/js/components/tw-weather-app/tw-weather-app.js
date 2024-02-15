/**
 * The tw-weather-app web component module.
 *
 * @author Therese Weidenstedt <kw222mi@lnu.student.se>
 * @version 1.0.0
 */

import '../tw-weather-app/index.js'

const template = document.createElement('template')
template.innerHTML = `

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.weather-app {
  height: 500px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(rgb(47, 150, 163), rgb(48, 62, 143));
  font-family: sans-serif;
  color: white;
}

#forecast-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 30px;
}
#forecast{
 
  margin: 10px;
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid white;
  box-shadow: 0px 0px 5px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}


.today-weather-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  padding: 20px;
  margin: 20px;
  border-radius: 5px;
  border: 1px solid white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.location {
  text-align: center;
}

.temperature {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.degree-section {
  display: flex;
  align-items: center;
}

.degree-section span {
  margin: 10px;
  font-size: 30px;
}

.degree-section h2 {
  font-size: 40px;
}

.temperature-description {
  text-align: center;
}

.wind-speed {
  text-align: center;
}

#search-field {
  margin-right: 10px;
  margin-top:20px;
  border-radius: 3px;
  height:25px;
}

#search-button {
  padding: 5px 10px;
  background-color: #ffffff;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
  margin-top:20px;
  height:25px;
}

#geolocation {
  padding: 5px 10px;
  background-color: #ffffff;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

</style>
<div class="weather-app">
<form>
<input type="text" id="search-field"></input>
<button id="search-button">Search</button>
</form>
<button id="geolocation">Get your location</button>
<div class="today-weather-container">
    <div class="location">
        <h1 id="name-of-today">Monday</h1>
        <h4 class="location-timezone">Timezone</h4>
        <div><img id= "icon" alt="weather icon" /></div>
    </div>

    <div class="temperature">
        <div class="deree-section">
        <h2 class="temperature-degree">-24 &#176; C</h2>
        
    </div>
    <div class ="temperature-description">freezing cold</div>
    <div class ="wind-speed">4 m/s</div>

 </div>
 </div>
    <template id="forecast-template">
        <tw-weather-forecast id="forecast">
        <p slot="forecast-name-of-day"></p>
        <img slot="forecast-icon" />
        <p slot="forecast-temperature"> </p>
        </tw-weather-forecast>
    </template>
    <div id="forecast-box"></div>
 
`

customElements.define('tw-weather-app',

  /**
   *
   */
  class extends HTMLElement {
    #locationName
    #temperatureDegree
    #temperatureDescription
    #nameOfToday
    #icon
    #forecastTemplate
    #forecastBox
    #forecastIcon
    #slot
    #windSpeed

    #searchButton
    #searchField
    #geoloc

    #currentUrl
    #forecastUrl
    /**
     * Constructor for the weather app component.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.#locationName = this.shadowRoot.querySelector('.location-timezone')
      this.#temperatureDegree = this.shadowRoot.querySelector('.temperature-degree')
      this.#temperatureDescription = this.shadowRoot.querySelector('.temperature-description')
      this.#nameOfToday = this.shadowRoot.querySelector('#name-of-today')
      this.#icon = this.shadowRoot.querySelector('#icon')
      this.#forecastTemplate = this.shadowRoot.querySelector('#forecast-template')
      this.#forecastBox = this.shadowRoot.querySelector('#forecast-box')
      this.#forecastIcon = this.shadowRoot.querySelector('#forecast-icon')
      this.#windSpeed = this.shadowRoot.querySelector('.wind-speed')

      this.#searchButton = this.shadowRoot.querySelector('#search-button')
      this.#searchField = this.shadowRoot.querySelector('#search-field')
      this.#geoloc = this.shadowRoot.querySelector('#geolocation')
    }

    /**
     * ConnectedCallback function, sets eventlisteners.
     */
    connectedCallback () {
      // get the cordinates from the user
      this.#geoloc.addEventListener('click', () => this.#getCords())
      // get the city from the user
      this.#searchButton.addEventListener('click', (event) => this.#getCity(event))
    }

    /**
     * Get cords for the users location.
     */
    #getCords () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const long = position.coords.longitude
          const lat = position.coords.latitude
          this.#setUrlPosition(long, lat)
        })
      } else {
        console.log("couldn't get your location")
      }
    }

    /**
     * Let the user search for a city.
     *
     * @param {object} event - event object.
     */
    #getCity (event) {
      event.preventDefault()
      const city = this.#searchField.value
      this.#setUrlCity(city)
    }

    /**
     * Sets the urls for city searched weather.
     *
     * @param {string} city - the city to search for.
     */
    #setUrlCity (city) {
      this.#currentUrl = `https://weatherapi-com.p.rapidapi.com/current.json?q=${city}`
      this.#forecastUrl = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=7`
      this.getWeather(this.#currentUrl)
      this.getForecastData(this.#forecastUrl)
    }

    /**
     * Sets the urls for user location weather.
     *
     * @param {number} long - longitude
     * @param {number} lat - latitude
     */
    #setUrlPosition (long, lat) {
      this.#currentUrl = `https://weatherapi-com.p.rapidapi.com/current.json?q=${lat},${long}`
      this.#forecastUrl = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${lat},${long}&days=7`
      this.getWeather(this.#currentUrl)
      this.getForecastData(this.#forecastUrl)
    }

    /**
     * Get the weather of today.
     *
     * @param {string} url - the url for the api fetch.
     */
    async getWeather (url) {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'replaceWithYourAPIKey',
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'

        }
      }

      try {
        const response = await fetch(url, options)
        const result = await response.json()
        console.log(result)
        // get wind in ms
        const windMs = result.current.wind_kph * 0.44704
        this.#windSpeed.textContent = `Wind: ${Math.floor(windMs)} m/s`
        // get weather icon
        const icon = result.current.condition.icon
        this.#icon.setAttribute('src', icon)
        // set content
        this.#temperatureDescription.textContent = `Feels like: ${Math.floor(result.current.feelslike_c)}`
        this.#temperatureDegree.textContent = `${Math.floor(result.current.temp_c)}° C`
        this.#locationName.textContent = result.location.name
      } catch (error) {
        console.error(error)
      }

      this.#getDateOfToday()
      this.#addForecast()
    }

    /**
     * Add the forecast.
     */
    async #addForecast () {
      // Add forecast.
      for (let i = 0; i < 2; i++) {
        const day = this.#forecastTemplate.content.cloneNode(true)
        this.#forecastBox.appendChild(day)
      }
    }

    /**
     * Get the forecast weather.
     *
     * @param {string} url - the url for the api.
     */
    async getForecastData (url) {
      // Clear the box before adding forecast
      while (this.#forecastBox.firstChild) {
        this.#forecastBox.removeChild(this.#forecastBox.firstChild)
      }
      const forecastData = []
      let result

      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "replaceWithYourAPIKey",
          "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        },
      };
      try {
        const response = await fetch(url, options)
        result = await response.json()
        console.log(result)
        for (let i = 1; i < 3; i++) {
          const day = {
            date: result.forecast.forecastday[i].date,
            temp: result.forecast.forecastday[i].day.maxtemp_c,
            description: result.forecast.forecastday[i].day.condition.text,
            icon: result.forecast.forecastday[i].day.condition.icon
          }
          console.log(day)
          forecastData.push(day)
        }
        this.#slot = Array.from(this.shadowRoot.querySelectorAll('tw-weather-forecast'))

        for (let i = 0; i < 2; i++) {
          this.#slot[i].insertAdjacentHTML('beforeEnd', `<p slot="forecast-name-of-day">${this.#getForecastDay(forecastData[i].date)}</p><img slot="forecast-icon" src ="${forecastData[i].icon}"/><p slot="forecast-temperature">${Math.floor(forecastData[i].temp)} &#176; C</p><p slot="forecast-description">${forecastData[i].description}</p>`)
        }
      } catch (error) {
        console.error(error)
      }
    }

    /**
     * Get the name of the day.
     *
     * @param {string} date - the date of the day (YY-MM-DD).
     * @returns {string} - the name of the day.
     */
    #getForecastDay (date) {
      const forecastDay = new Date(date)
      const day = forecastDay.getDay()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return dayNames[day]
    }

    /**
     * Get the date of today as text.
     */
    #getDateOfToday () {
      const time = new Date()
      const month = time.getMonth()
      const date = time.getDate()
      const day = time.getDay()

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      this.#nameOfToday.textContent = `${days[day]}, ${date}  ${months[month]}`
    }

    /**
     * DisconnectedCallback.
     */
    disconnectedCallback () {

    }
  })
