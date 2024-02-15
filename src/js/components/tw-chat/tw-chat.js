import { createPopup } from '@picmo/popup-picker'
import { v4 as uuidv4 } from 'uuid'

const MY_CHAT_MESSAGES = 'messageHistory'
const USERNAME_KEY = 'userName'

const template = document.createElement('template')
template.innerHTML = `

<style>

#selection {
  display: flex;
  align-items: center;
  flex-direction: row;
}

#selection-outer {
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #eee;
  padding: 0.5rem;
  width: 360px;
  margin-bottom: 2rem;
}

h2 {
  margin: 0;
  /* margin-bottom: 1rem; */
  font-size: 1rem;
  text-align: center;
}

#selection-name.empty {
  opacity: 0.5;
}
.path{
  font-size: 1rem;
}
#picker{
  height: 300px;
  width: 100px;
  padding: 20px;
  display:inline;
}
.EmojiCategory_categoryName__zHcOq{
  display: none;
}
.emojiPickerPopUp{
  z-index: 3;
}

.hidden {
  display: none;
}
#user-box{
  height: 340px;
  width: 600px;
  background: #fff;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
  position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3), 
                0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
#username-input{
  align-bottom:-20px;
  margin-bottom: 20px;
  padding:5px;
  background: pink;
  font-size: 20px;
  border-radius: 5px;
}
#username-register-button{
  background: pink;
  box-shadow: 0 2px 4px 0
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  padding:5px;
  border-radius: 5px;
  margin-bottom: 20px;  
}
#start-button {
  background: pink;
  box-shadow: 0 2px 4px 0
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  padding:7px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.send-button { 
  background: pink;
  box-shadow: 0 2px 4px 0
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  padding:7px;
  border-radius: 5px;
  white-space: pre-line;
  white-space: nowrap;
}

#chat-window{
  height: auto;
  width: 300px;
  border: solid;
  background: pink;
  margin: 20px; 
  white-space: pre-line;
}
#message{
  border: solid;
  width: 300px !important;
  margin: 20px; 
  flex: 1;
  margin-right: 1rem;
}
#form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}


</style>

<div>
<div id="user-box">
<form>
  <h1>Welcome <span id="username-placeholder"></span></h1>
  <p>Please enter your name here:</p>
  <input type="text" id="username-input" class="username-input" placeholder="Username" autocomplete="off" autofocus /> 
  <button class="username-register-button" id="username-register-button" type="submit">Submit</button>
</form>
<button id="start-button">Start chat</button>
</div>

<div id= "chat-window">
    <div id ="output"></div>
    <div id ="feedback"></div>
</div>

<form id = "form">
 <textarea rows="4" cols="40" id="message" class="message-input" placeholder="Write your message here" autocomplete="off" autofocus ></textarea>
 <button class = "send-button" id ="emoji-button">Emoji</button>
 <button class = "send-button" id ="send" type="submit">Send</button>
</form>

<div id="picker"></div>
</div>
`
/*
 * Define custom element.
 */
customElements.define('tw-chat',
/**
 *
 */
  class extends HTMLElement {
    #sendButton
    #message
    #output
    #usernameInput
    #usernameRegisterButton
    #startButton
    #socket
    #triggerButton
    #picker
    #usernamePlaceholder
    #usernameValue
    #messageHistoryKey

    /**
     * Constructor for the chat component.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      this.instanceKey = uuidv4()
      this.#messageHistoryKey = `${MY_CHAT_MESSAGES}_${this.instanceKey}`

      // Get the send button element in the shadow root
      this.#sendButton = this.shadowRoot.querySelector('#send')
      this.#message = this.shadowRoot.querySelector('#message')
      this.#output = this.shadowRoot.querySelector('#output')
      this.#usernameInput = this.shadowRoot.querySelector('#username-input')
      this.#usernameRegisterButton = this.shadowRoot.querySelector('#username-register-button')
      this.#startButton = this.shadowRoot.querySelector('#start-button')
      this.#triggerButton = this.shadowRoot.querySelector('#emoji-button')

      this.#usernamePlaceholder = this.shadowRoot.querySelector('#username-placeholder')
      this.#usernameValue = this.shadowRoot.querySelector('#username-value')

      const rootElement = this.shadowRoot.querySelector('#picker')

      this.#picker = createPopup(
        {},
        {
          referenceElement: rootElement,
          triggerElement: this.#triggerButton,
          position: 'bottom-start',
          showCloseButton: false,
          className: 'emojiPickerPopUp'
        }
      )
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      // Listen for klick on send button
      this.#sendButton.addEventListener('click', (event) => this.#sendMessage(event))
      // Listen for user to press enter when writing messages
      this.#message.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') { this.#sendMessage(event) }
      })
      this.#usernameRegisterButton.addEventListener('click', (event) => this.#saveUserName(event))
      this.#startButton.addEventListener('click', () => this.#startChat())

      this.#triggerButton.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        this.#picker.toggle()
      })
      this.#picker.addEventListener('emoji:select', (selection) => {
        this.#message.value += selection.emoji // Lägg till emojin i slutet av befintligt innehåll
        this.#message.classList.remove('empty')
      })

      this.#socket = new WebSocket('wss://courselab.lnu.se/message-app/socket', 'chatMess')
      this.#socket.addEventListener('open', (event) => {
        console.log('connected to websocket')
      })
      this.#socket.addEventListener('message', (event) => {
        this.#showServerMessage(event)
      })

      // Activate if you don't want the username pop-up to show.
      /*
      const savedUserName = localStorage.getItem(USERNAME_KEY)
      if (savedUserName) {
        this.#usernameInput.textContent = savedUserName
        // this.#startChat()
      }
    */
    }

    /**
     * Start the chat.
     */
    #startChat () {
      const userBox = this.shadowRoot.querySelector('#user-box')
      userBox.classList.add('hidden')
      const savedUserName = localStorage.getItem(USERNAME_KEY)
      this.#usernamePlaceholder.textContent = savedUserName
    }

    /**
     * Show and save messages from server.
     *
     * @param {object} event - the event object.
     */
    #showServerMessage (event) {
      console.log('Message from server ', event.data)
      const data = JSON.parse(event.data)

      if (data.type === 'message') {
        this.#saveMessage(data.username, data.data)
        this.#showMessage(data.username, data.data)
      }
    }

    /**
     * Show message and name in the chatbox.
     *
     * @param {string} name - the name of the user.
     * @param {string} message - the chat message.
     */
    #showMessage (name, message) {
      // Save message to array with messages, if no array, create one
      const messageHistory = JSON.parse(localStorage.getItem(this.#messageHistoryKey)) ?? []
      this.#output.textContent = messageHistory
        .map((message) => `${message.name} : ${message.message}`)
        .join('\r\n  ')
    }

    /**
     * Send chat message.
     *
     * @param {object} event - the event objecct.
     */
    #sendMessage (event) {
      event.preventDefault()

      const message = this.#message.value
      const name = localStorage.getItem('userName')

      const sendData = {
        type: 'message',
        data: message,
        username: name,
        channel: 'my, not so secret, channel',
        key: 'placePasswordHere'
      }
      this.#socket.send(JSON.stringify(sendData))
      this.#message.value = ''
    }

    /**
     * Save the username.
     *
     * @param {object} event - the event object.
     */
    #saveUserName (event) {
      event.preventDefault()

      let userName
      if (this.#usernameInput.value === null) {
        userName = ' '
      } else {
        userName = this.#usernameInput.value
      }
      console.log(userName)
      localStorage.setItem('userName', userName)
      this.#startChat()
    }

    /**
     * Save the message.
     *
     * @param {string} name - name of the user.
     * @param {string} message - chat message.
     */
    #saveMessage (name, message) {
      const newMessage = { name, message }
      const messageHistory = JSON.parse(localStorage.getItem(this.#messageHistoryKey)) ?? []

      // Add to list
      messageHistory.push(newMessage)

      // Select new list
      if (messageHistory.length > 20) {
        messageHistory.splice(0, 1)
      }
      // Save
      localStorage.setItem(this.#messageHistoryKey, JSON.stringify(messageHistory))
    }

    /**
     * Close the socket when disconnect.
     */
    disconnectedCallback () {
      this.#socket.close()
    }
  })
