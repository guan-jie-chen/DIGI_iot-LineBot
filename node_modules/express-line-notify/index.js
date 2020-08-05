const url = require('url');
const https = require('https');
const querystring = require('querystring');

const { do_redirect, run_request } = require('./utils');

const lineNotification = config => (req, res, next) => {
  const request_url = url.parse(req.originalUrl, true);
  const return_url = url.format({
    protocol: req.protocol,
    host: req.headers.host,
    pathname: request_url.pathname,
  });
  const code = request_url.query && request_url.query.code;
  const state = request_url.query && request_url.query.state;
  const error = request_url.query && request_url.query.error;

  if (error) {
    const description = request_url.query.error_description || error;
    return next(new Error(description));
  }

  if (!code) {
    let reqContext = JSON.stringify({});
    if (req.context) {
      reqContext = JSON.stringify(req.context);
    }

    do_redirect(res, make_acquire_url(config, reqContext, return_url));
  }

  if (code) {
    const reqContext = JSON.parse(state);

    run_request(make_token_request(config, code, return_url))
      .then(data => {
        const info = JSON.parse(data);
        const accessToken = info && info.access_token;
        return accessToken;
      })
      .then(accessToken => {
        req['context'] = reqContext;
        req['line-notify-access-token'] = accessToken;
        next();
      })
      .catch(e => {
        return next(e);
      });
  }
};

const make_acquire_url = (config, reqContext, redirect_uri) =>
  url.format({
    protocol: 'https',
    host: 'notify-bot.line.me',
    pathname: '/oauth/authorize',
    query: {
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri,
      scope: 'notify',
      state: reqContext,
    },
  });

const make_token_request = (config, code, redirect_uri) => {
  const req = https.request({
    method: 'POST',
    host: 'notify-bot.line.me',
    path: '/oauth/token',
    headers: { 'Content-type': 'application/x-www-form-urlencoded' },
  });
  req.write(
    querystring.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri,
      code,
      grant_type: 'authorization_code',
    })
  );
  return req;
};

module.exports = lineNotification;
