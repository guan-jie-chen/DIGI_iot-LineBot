const do_redirect = (res, redirect_url) => {
  console.log(`Redirecting user to ${redirect_url}`);
  res.writeHead(302, { Location: redirect_url });
  res.end();
};

const run_request = (req, cb) => {
  console.log(`Initiating request to ${req._headers.host}${req.path}`);

  return new Promise((resolve, reject) => {
    req.once('response', res => {
      const chunks = [];
      res.on('data', data => {
        chunks.push(data);
      });
      res.once('end', () => {
        if (res.statusCode > 400) {
          reject(new Error(
            `Request returned status code: ${res.statusCode} ` +
            `(${res.statusMessage}): ${chunks.join('')}`)
          );
        } else {
          resolve(chunks.join(''));
        }
      });
    });
    req.once('error', err => {
      reject(err);
    });
    req.end();
  });
};

module.exports = {
  do_redirect,
  run_request,
};
