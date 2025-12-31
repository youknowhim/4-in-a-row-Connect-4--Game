const { createGame } = require("./gameManager");

// simple waiting queue
const waitingPlayers = [];

function addToQueue(username, onMatch) {
  // If someone already waiting, match them
  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.shift();
    const game = createGame(opponent, username);
    onMatch(game);
    return;
  }

  // Otherwise wait
  waitingPlayers.push(username);

  setTimeout(() => {
    const index = waitingPlayers.indexOf(username);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
      onMatch(null); // bot later
    }
  }, 10000);
}

module.exports = {
  addToQueue
};
