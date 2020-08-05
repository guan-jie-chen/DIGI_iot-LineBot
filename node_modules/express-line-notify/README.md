# express-line-notify

Middleware that authenticates line's oauth and sets `req['line-notify-access-token']`.

## Install

    $ npm install express-line-notify

## Usage

The authentication middleware go throught line oauth process.
If success, `req['line-notify-access-token']` will be set with the returned access_token,
and can be used by later middleware for pushing notification.

For example,

```javascript
var lineNotify = require('express-line-notify');

var config = {
  clientId:      'your-line-notify-client-id',
  clientSecret:  'your-line-notify-client-secret'
}

app.use('/linenotify',
  lineNotify(config),
  function(req, res) {
    const token = req['line-notify-access-token'];
    //...
  });
```

Due to oauth2 redirect mechanism, the req object is missing.
The later middleware will get the different req object.
If you want keep some data to use for later middleware,
put them into `req['context']`

For example,

```javascript
var lineNotify = require('express-line-notify');

var config = {
  clientId:      'your-line-notify-client-id',
  clientSecret:  'your-line-notify-client-secret'
}

//curl ~host/linenotify?userid=123&email=456
app.use('/linenotify',
  function(req, res) {
    req['context'] = req.query;    //store whatever in query string
    next();
  },
  lineNotify(config),
  function(req, res) {
    const token = req['line-notify-access-token'];
    const data = req['context']    //data will be { userid: "123", email: "456" }
    //...
  });
```


## Author

HoMuchen
