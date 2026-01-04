
const clients = new Map();      
const waitingQueue = [];
const activeGames = new Map();
const disconnectTimers = new Map();

module.exports = {
  clients,
  waitingQueue,
  activeGames,
  disconnectTimers
};