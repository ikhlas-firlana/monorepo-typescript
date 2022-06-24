const server = require('./server');
const client = require('./client');

module.exports = Promise.all([server, client]);
