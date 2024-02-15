# tw-memory-game component

 This web component is an implementation of a memory game. An overview of its functionality:

- There is a constant `NO_OF_HIGH_SCORES` that specifies the number of high scores to be saved in localStorage.
- There is a constant `MY_MEMORY_HIGH_SCORES` that represents the key name in localStorage where high scores are stored.
- There is a constant `NUMBER_OF_IMAGES` that specifies the number of images used in the game.
- There is an array `IMG_URLS` that contains the URLs of the images used in the game.

- The `attributeChangedCallback` method is called when the component's attributes change and is used here to restart the game when the `boardsize` attribute changes.
- The `init` method initializes the game board and creates the tiles based on the selected size (`boardsize`).
- The `onTileFlip` method handles the events when a tile is flipped and checks if two tiles match or not.
- The `reStart` method resets the game by resetting the game board, the number of attempts, and resetting the high score modal.
- The `addModal` method adds a modal that displays the total number of attempts and checks if the player has achieved a high score.
- The `showNumberOfTries` method displays the total number of attempts in the modal.
- The `closeModal` method closes the modal and resets the game.
- The `checkHighscore` method checks if the player has achieved a high score and allows the player to enter their name if they have.


## Attributes

### Boardsize

The board can have 3 different sizes, 2x2, 4x2 and 4x4.


## Events

| Event Name    | Fired When            |
| ------------- | --------------------- |
| CloseModal      | click    |
| UpgradeProperty      | change    |
| onTileFlip      | click    |
| Disable element dragging      | dragstart   |


## Example

```html
 <tw-memory-game></tw-memory-game>
