# tw-chat component

The MyChat component is a custom web component that provides chat functionality. It allows users to enter their name, send and receive messages, and select emojis from an emoji picker.

Make sure to import the required dependencies, such as @picmo/popup-picker, before using the MyChat component.

## Features
   * User Registration: Users can enter their name in the input field and register for the chat.
   * Chat Window: The component displays a chat window where users can view incoming and outgoing messages.
   * Message Input: Users can enter their messages in the input field and send them by clicking the "Send" button or pressing Enter.
   * Emoji Picker: The component includes an emoji picker that users can open by clicking the "Emoji" button. Selected emojis can be added to the message input field.
   * Local Storage: Usernames and chat message history are saved in the browser's local storage, allowing users to resume their chat session and view previous messages upon page reload.


## Events

| Event Name    | Fired When            |
| ------------- | --------------------- |
| Save user name| clicked button|
| Start chat| clicked button|
| Show emoji picker| clicked button|
| Select emoji| emoji:select|
| Show Server Message| message|
| Send message      | clicked button  or keypress enter   |


## Example

```html
<tw-chat></tw-chat>

