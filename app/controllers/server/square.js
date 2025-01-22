const { ApiError, Client, Environment } = require('square');

const { isProduction, SQUARE_ACCESS_TOKEN } = require('./config');

const client = new Client({
  environment: 'sandbox',
  accessToken: 'EAAAEHfk_dZU3jIFyOTetGC-AqKpdd-9sguIjqqJOpzWXkBjBfZFNHxpINhx6Qu1',
});

module.exports = { ApiError, client };
