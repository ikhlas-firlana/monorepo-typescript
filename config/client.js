const compiler = require('../compiler.json');

const handler = (env) => {
  if (env?.source && compiler[env?.source]?.client) {
    const options = {};
    return options;
  }
  return {
    stats: 'none',
  }
};

module.exports = handler;
