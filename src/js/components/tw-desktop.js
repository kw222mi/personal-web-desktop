/**
 * The tw-desktop web component module.
 *
 * @author Therese Weidenstedt <kw222mi@lnu.student.se>
 * @version 1.0.0
 */

const IMG_URL_MEMORY = (new URL('images/1.png', import.meta.url)).href
const IMG_URL_CHAT = (new URL('images/2.png', import.meta.url)).href
const IMG_URL_WEATHER = (new URL('images/3.png', import.meta.url)).href

customElements.define('tw-desktop',
/**
 *
 */
  class extends HTMLElement {
  /**
   * Constructor for the desktop component.
   */
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })

      this.shadowRoot.innerHTML = `
      <style>
        #desktop {
          width: 100%;
          height: 100vh;
          background-color: #f0f0f0;
          position: relative;
        }
        
        #taskbar {
          height: 40px;
          background-color: #333;
          color: #fff;
          padding: 10px;
        }
        
        #icons {
          margin-top: 30px;
          display: flex;
          justify-content: center;
        }
        
        .icon {
          text-align: center;
          margin: 10px;
          cursor: pointer;
        }
        
        .icon img {
          width: 80px;
          height: 80px;
        }
        
        .icon span {
          display: block;
          margin-top: 5px;
          font-size: 14px;
          color: #333;
        }
        
        .window {
          position: absolute;
          top: 50px;
          left: 50px;
          width: 400px;
          height: 300px;
          background-color: #fff;
          border: 1px solid #333;
          border-radius: 5px;
          padding: 10px;
          resize: both;
          overflow: auto;
          z-index: 0;
        }
        .window:focus{
          background-color: wite;
          z-index: 1;
          border: 3px solid #000000;
        }
        
        .title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 30px;
          background-color: #333;
          color: #fff;
          padding: 5px;
          border-bottom: 1px solid #666;
        }
        .close-button{
          cursor: pointer;
        }
      </style>
      
      <div id="desktop">
        <div id="taskbar">
          <span></span>
        </div>
        <div id="icons">
          <div class="icon" data-app="Memory Game" tabindex="0">
            <img src= ${IMG_URL_MEMORY}>
            <span>Memory Game</span>
          </div>
          <div class="icon" data-app="Chat" tabindex="0">
            <img src=${IMG_URL_CHAT}>
            <span>Chat</span>
          </div>
          <div class="icon" data-app="Weather App" tabindex="0">
          <img src=${IMG_URL_WEATHER}>
          <span>Weather App</span>
        </div>
        </div>
      </div>
    `
    }

    /**
     * Connected callback - add eventlistener to icons.
     */
    connectedCallback () {
      const icons = this.shadowRoot.querySelectorAll('.icon')
      icons.forEach(icon => {
        icon.addEventListener('click', this.#openApplication.bind(this))
      })

      icons.forEach(icon => {
        icon.addEventListener('keyup', event => {
          if (event.key === 'Enter') {
            this.#openApplication(event)
          }
        })
      })
    }

    /**
     * Open the application when icon is clicked.
     *
     * @param {object} event - event object.
     */
    #openApplication (event) {
      const applicationName = event.currentTarget.dataset.app
      const windowElement = document.createElement('div')
      windowElement.classList.add('window')
      // make the window able to tab.
      windowElement.setAttribute('tabindex', '0')
      // create titlebar.
      const titleBar = document.createElement('div')
      titleBar.classList.add('title-bar')
      // create titletext
      const titleText = document.createElement('span')
      titleText.classList.add('title-text')
      titleText.textContent = applicationName
      // create close button
      const closeButton = document.createElement('span')
      closeButton.classList.add('close-button')
      closeButton.textContent = 'X'
      // add to the modal element
      titleBar.appendChild(titleText)
      titleBar.appendChild(closeButton)
      windowElement.appendChild(titleBar)
      // make it resizeable
      this.makeResizable(windowElement)
      // Add application to the window
      if (applicationName === 'Memory Game') {
        const application = document.createElement('tw-memory-game')
        windowElement.appendChild(application)
      } else if (applicationName === 'Chat') {
        const application = document.createElement('tw-chat')
        windowElement.appendChild(application)
      } else if (applicationName === 'Weather App') {
        const application = document.createElement('tw-weather-app')
        windowElement.appendChild(application)
      }
      this.shadowRoot.appendChild(windowElement)
      // make it draggable
      this.makeDraggable(windowElement)
      // add eventlistener for close button
      closeButton.addEventListener('click', () => {
        this.shadowRoot.removeChild(windowElement)
      })
    }

    /**
     * Make the modal window resizeable.
     *
     * @param {HTMLElement} windowElement - the modal window.
     */
    makeResizable (windowElement) {
      let isResizing = false
      let resizeStartX = 0
      let resizeStartY = 0

      const resizeHandle = document.createElement('div')
      resizeHandle.classList.add('resize-handle')
      windowElement.appendChild(resizeHandle)

      resizeHandle.addEventListener('mousedown', startResize)
      resizeHandle.addEventListener('mousemove', resize)
      resizeHandle.addEventListener('mouseup', endResize)
      resizeHandle.addEventListener('mouseleave', endResize)

      /**
       * Start the resize.
       *
       * @param {object} event - event object.
       */
      function startResize (event) {
        isResizing = true
        resizeStartX = event.clientX
        resizeStartY = event.clientY
      }

      /**
       * Resize the window.
       *
       * @param {object} event - event object.
       */
      function resize (event) {
        if (!isResizing) return
        const widthDiff = event.clientX - resizeStartX
        const heightDiff = event.clientY - resizeStartY
        const newWidth = parseInt(windowElement.style.width) + widthDiff
        const newHeight = parseInt(windowElement.style.height) + heightDiff

        windowElement.style.width = `${newWidth}px`
        windowElement.style.height = `${newHeight}px`
        resizeStartX = event.clientX
        resizeStartY = event.clientY
      }

      /**
       * End the resize.
       */
      function endResize () {
        isResizing = false
      }
    }

    /**
     * Make the modal window draggable.
     *
     * @param {HTMLElement} windowElement - the modal window.
     */
    makeDraggable (windowElement) {
      let isDragging = false
      let dragOffsetX = 0
      let dragOffsetY = 0

      const titleBar = windowElement.querySelector('.title-bar')

      titleBar.addEventListener('mousedown', startDrag)
      titleBar.addEventListener('mousemove', drag)
      titleBar.addEventListener('mouseup', endDrag)
      titleBar.addEventListener('mouseleave', endDrag)

      /**
       * Start dragging.
       *
       * @param {object} event - event object.
       */
      function startDrag (event) {
        isDragging = true
        dragOffsetX = event.clientX - windowElement.offsetLeft
        dragOffsetY = event.clientY - windowElement.offsetTop
      }

      /**
       * Drag the object.
       *
       * @param {object} event - event object.
       */
      function drag (event) {
        if (isDragging) {
          windowElement.style.left = `${event.clientX - dragOffsetX}px`
          windowElement.style.top = `${event.clientY - dragOffsetY}px`
        }
      }

      /**
       * End the dragging.
       */
      function endDrag () {
        isDragging = false
      }
    }
  }

)
