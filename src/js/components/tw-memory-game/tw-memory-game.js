/**
 * The tw-memory-game web component module.
 *
 * @author Therese Weidenstedt <kw222mi@lnu.student.se>
 * @version 1.0.0
 */

import '../tw-flipping-tile/tw-flipping-tile.js'

const NO_OF_HIGH_SCORES = 5
const MY_MEMORY_HIGH_SCORES = 'highScores'

/*
 * Get image URLs.
 */
const NUMBER_OF_IMAGES = 9

const IMG_URLS = new Array(NUMBER_OF_IMAGES)
for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
  IMG_URLS[i] = (new URL(`./images/${i}.png`, import.meta.url)).href
}

/*
 * Define template.
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>

  *, *::after, *::before {
    box-sizing: border-box;
  }
  
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: 200ms ease-in-out;
    border: 1px solid black;
    border-radius: 10px;
    z-index: 10;
    background-color: white;
    width: 500px;
    max-width: 80%;
    white-space: pre-line;
  }
  
  .modal.active {
    transform: translate(-50%, -50%) scale(1);
  }
  
  .modal-header {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid black;
  }
  
  .modal-header .title {
    font-size: 1.25rem;
    font-weight: bold;
  }
  
  .modal-header .close-button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-size: 1.25rem;
    font-weight: bold;
  }
  
  .modal-body {
    padding: 10px 15px;
    user-select: none;
  }
  
  #overlay {
    position: fixed;
    opacity: 0;
    transition: 200ms ease-in-out;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .5);
    pointer-events: none;
  }
  
  #overlay.active {
    opacity: 1;
    pointer-events: all;
  }
  
    :host {
      --tile-size: 80px;
    }
    #game-board {
      display: grid;
      grid-template-columns: repeat(4, var(--tile-size));
      gap: 20px;
    }
    #game-board.zero {
      grid-template-columns: repeat(0, var(--tile-size));
    }
    #game-board.small {
      grid-template-columns: repeat(2, var(--tile-size));
    }
    my-flipping-tile {
      width: var(--tile-size);
      height: var(--tile-size);
    }
    my-flipping-tile::part(tile-back) {
      border-width: 5px;
      background: url("${IMG_URLS[0]}") no-repeat center/80%, radial-gradient(#fff, #ffd700);;
    }
  </style>
  <label for="boardsize">Choose gameboard size:</label>
  <select id= "choose-boardsize" name="boardsize" id="board">
  <option value="zero">------</option>
    <option value="small" tabindex="0">Small</option>
    <option value="medium" tabindex="0">Medium</option>
    <option value="large" tabindex="0">Large</option>
  </select>
  
  <h2>Number of tries:</h2>
  <h2 id="number-of-tries"> </h2>
  <template id="tile-template">
    <my-flipping-tile>
      <img />
    </my-flipping-tile>
  </template>
  <div id="game-board">
  </div>

 
  <div class="modal" id="modal">
    <div class="modal-header">
      <div class="title">Game Over</div>
      <button data-close-button class="close-button" id="tries-close-button">&times;</button>
    </div>
    <div class="modal-body">
    <div id="total-tries-box"></div>
    <h2 id="total-number-of-tries"> </h2>
    <h2 id="player-score"> </h2>
    <div id="highscore-box"></div>
    </div>
  </div>
    
`

/*
 * Define custom element.
 */
customElements.define('tw-memory-game',
  /**
   * Represents a memory game
   */
  class extends HTMLElement {
    #gameBoard
    #tileTemplate
    #numberOfTries = 0
    #numberOfTriesElement
    #chooseBoardsize
    #modal
    #totalNumberOfTriesElement
    #closeModalBtn
    #highscoreBox
    #playernameButton

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      // Get elements in the shadow root.
      this.#gameBoard = this.shadowRoot.querySelector('#game-board')
      this.#tileTemplate = this.shadowRoot.querySelector('#tile-template')
      this.#numberOfTriesElement = this.shadowRoot.querySelector('#number-of-tries')
      this.#totalNumberOfTriesElement = this.shadowRoot.querySelector('#total-number-of-tries')
      this.#chooseBoardsize = this.shadowRoot.querySelector('#choose-boardsize')
      this.#modal = this.shadowRoot.querySelector('#modal')
      this.#closeModalBtn = this.shadowRoot.querySelector('#tries-close-button')
      this.#highscoreBox = this.shadowRoot.querySelector('#highscore-box')
    }

    /**
     * Get the board size.
     *
     * @returns {string} The size of the game board.
     */
    get boardSize () {
      return this.getAttribute('boardsize')
    }

    /**
     * Sets the board size.
     *
     * @param {string} value - The size of the game board.
     */
    set boardSize (value) {
      this.setAttribute('boardsize', value)
    }

    /**
     * Attributes to monitor for changes.
     *
     * @returns {string[]} A string array of attributes to monitor.
     */
    static get observedAttributes () {
      return ['boardsize']
    }

    /**
     * Get the game board size dimensions.
     *
     * @returns {object} The width and height of the game board.
     */
    get #gameBoardSize () {
      const gameBoardSize = {
        width: 4,
        height: 4
      }

      switch (this.boardSize) {
        case 'zero' : {
          gameBoardSize.width = gameBoardSize.height = 0
          break
        }
        case 'small' : {
          gameBoardSize.width = gameBoardSize.height = 2
          break
        }
        case 'medium' : {
          gameBoardSize.height = 2
          break
        }
      }
      return gameBoardSize
    }

    /**
     * Get all tiles.
     *
     * @returns {object} An object containing grouped tiles.
     */
    get #tiles () {
      const tiles = Array.from(this.#gameBoard.children)

      return {
        all: tiles,
        faceUp: tiles.filter(tile => tile.hasAttribute('face-up') && !tile.hasAttribute('hidden')),
        faceDown: tiles.filter(tile => !tile.hasAttribute('face-up') && !tile.hasAttribute('hidden')),
        hidden: tiles.filter(tile => tile.hasAttribute('hidden'))
      }
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      this.#closeModalBtn.addEventListener('click', () => this.#closeModal())
      this.#chooseBoardsize.addEventListener('change', (event) =>
        this.setAttribute('boardsize', event.target.value),
      this.#upgradeProperty('boardsize'))

      this.#gameBoard.addEventListener('click', () => this.#onTileFlip())
      this.addEventListener('dragstart', (event) => {
        // Disable element dragging.
        event.preventDefault()
        event.stopPropagation()
      })
    }

    /**
     * Called when observed attribute(s) changes.
     *
     * @param {string} name - The attribute's name.
     * @param {*} oldValue - The old value.
     * @param {*} newValue - The new value.
     */
    attributeChangedCallback (name, oldValue, newValue) {
      if (name === 'boardsize') {
        this.#reStart()
      }
    }

    /**
     * Run the specified instance property through the class setter.
     *
     * @param {string} prop - The property's name.
     */
    #upgradeProperty (prop) {
      if (Object.hasOwnProperty.call(this, prop)) {
        const value = this[prop]
        delete this[prop]
        this[prop] = value
      }
    }

    /**
     * Initializes the game board size and tiles.
     */
    #init () {
      const { width, height } = this.#gameBoardSize
      const tilesCount = width * height

      if (tilesCount !== this.#tiles.all.length) {
        // Remove existing tiles, if any.
        while (this.#gameBoard.firstChild) {
          this.#gameBoard.removeChild(this.#gameBoard.lastChild)
        }

        if (width === 0) {
          this.#gameBoard.classList.add('zero')
        } else {
          this.#gameBoard.classList.remove('zero')
        }

        if (width === 2) {
          this.#gameBoard.classList.add('small')
        } else {
          this.#gameBoard.classList.remove('small')
        }

        // Add tiles.
        for (let i = 0; i < tilesCount; i++) {
          const tile = this.#tileTemplate.content.cloneNode(true)
          this.#gameBoard.appendChild(tile)
        }
      }

      // Create a sequence of numbers between 0 and 15,
      // and then shuffle the sequence.
      const indexes = [...Array(tilesCount).keys()]

      for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]]
      }

      // Set the tiles' images.
      this.#tiles.all.forEach((tile, i) => {
        tile.querySelector('img').setAttribute('src', IMG_URLS[indexes[i] % (tilesCount / 2) + 1])
        tile.faceUp = tile.disabled = tile.hidden = false
      })
    }

    /**
     * Handles flip events.
     */
    #onTileFlip () {
      const tiles = this.#tiles
      const tilesToDisable = Array.from(tiles.faceUp)

      if (tiles.faceUp.length > 1) {
        tilesToDisable.push(...tiles.faceDown)
      }
      tilesToDisable.forEach(tile => (tile.setAttribute('disabled', '')))
      const [first, second, ...tilesToEnable] = tilesToDisable

      if (second) {
        this.#numberOfTries++
        this.#numberOfTriesElement.textContent = this.#numberOfTries
        const isEqual = first.isEqual(second)
        const delay = isEqual ? 1000 : 1500
        window.setTimeout(() => {
          let eventName = 'memory-game:tiles-mismatch'
          if (isEqual) {
            first.setAttribute('hidden', '')
            second.setAttribute('hidden', '')
            eventName = 'memory-game:tiles-match'
          } else {
            first.removeAttribute('face-up')
            second.removeAttribute('face-up')
            tilesToEnable.push(first, second)
          }
          this.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            detail: { first, second }
          }))

          if (tiles.all.every(tile => tile.hidden)) {
            tiles.all.forEach(tile => (tile.disabled = true))
            this.#addModal()
            this.dispatchEvent(new CustomEvent('memory-game:game-over', {
              bubbles: true
            }))

            this.#init()
          } else {
            tilesToEnable?.forEach(tile => (tile.removeAttribute('disabled')))
          }
        }, delay)
      }
    }

    /**
     * Restart the game.
     */
    #reStart () {
      this.#init()

      // Reset the number of tries
      this.#numberOfTries = 0
      this.#numberOfTriesElement.textContent = this.#numberOfTries
      // Reset the modal and highscores
      this.#modal.classList.remove('active')
      this.#totalNumberOfTriesElement.textContent = ''
      this.#highscoreBox.innerHTML = ''
    }

    /**
     * Add modal for highscore.
     */
    #addModal () {
      // Add modal window.
      this.#modal.classList.add('active')
      this.#showNumberOfTries()
      this.#checkHighscore()
    }

    /**
     * Show number of tries.
     */
    #showNumberOfTries () {
      this.#totalNumberOfTriesElement.textContent = ('Total number of tries: ' + this.#numberOfTries)
    }

    /**
     * Close modal.
     */
    #closeModal () {
      this.#modal.classList.remove('active')
      this.#numberOfTries = 0
      this.#numberOfTriesElement.textContent = this.#numberOfTries
      this.#chooseBoardsize.selectedIndex = 0
      // set the size of the board to zero
      this.setAttribute('boardsize', 'zero')
      this.#upgradeProperty('boardsize')
    }

    /**
     * Check for highscore.
     */
    #checkHighscore () {
      let size = this.getAttribute('boardsize')
      if (size === 'small') {
        size = 1
      } else if (size === 'medium') {
        size = 1.5
      } else if (size === 'large') {
        size = 2
      } else {
        size = 0
      }
      const score = (100 - this.#numberOfTries) * size
      const highScores = JSON.parse(localStorage.getItem(MY_MEMORY_HIGH_SCORES)) ?? []
      const lowestScore = highScores[NO_OF_HIGH_SCORES - 1]?.score ?? 0
      console.log(highScores)
      this.playerScore = this.shadowRoot.querySelector('#player-score')
      this.playerScore.textContent = ('Score: ' + score)
      if (score > lowestScore) {
        const html = '<form><label>You got highscore! Please enter your name: </label><input type="text" id="playername"><button id="playername-button">Submit</button></form>'
        this.#highscoreBox.insertAdjacentHTML('beforeend', html)
        this.#playernameButton = this.shadowRoot.querySelector('#playername-button')
        if (this.#playernameButton) {
          this.#playernameButton.addEventListener('click', (event) => this.#saveHighScore(event, score)
          )
        } else {
          console.log('no button')
        }
      } else {
        this.#showHighScores()
      }
    }

    /**
     * Show the highscore.
     */
    #showHighScores () {
      // Save highscore to array with highscores, if no array, create one
      const highScores = JSON.parse(localStorage.getItem(MY_MEMORY_HIGH_SCORES)) ?? []
      this.#highscoreBox.textContent = highScores
        .map((score) => `${score.score} - ${score.name}`)
        .join('\r\n  ')
    }

    /**
     * Save the highscore.
     *
     * @param {object} event - the event.
     * @param {number} score - the score of the game.
     */
    #saveHighScore (event, score) {
      // remove eventListener
      event.preventDefault()
      event.stopPropagation()
      score = parseInt(score)
      console.log(score)
      const name = this.shadowRoot.querySelector('#playername').value
      const highScores = JSON.parse(localStorage.getItem(MY_MEMORY_HIGH_SCORES)) ?? []
      const newScore = { score, name }
      // Add to list
      highScores.push(newScore)
      // Sort the list
      highScores.sort((a, b) => b.score - a.score)
      // Select new list
      highScores.splice(NO_OF_HIGH_SCORES)
      // Save
      localStorage.setItem(MY_MEMORY_HIGH_SCORES, JSON.stringify(highScores))
      // Show the highscore
      this.#showHighScores()
    }
  }
)
