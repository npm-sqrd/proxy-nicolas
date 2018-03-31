const fs = require('fs');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const path = require('path');

const exists = Promise.promisify(fs.stat);

const loadBundle = (cache, item, filename) => {
  setTimeout(() => {
    console.log('loading:', filename);
    cache[item] = require(filename).default;
  }, 0);
};

const fetchBundles = (path, services, suffix = '', require = false) => {
  Object.keys(services).forEach((item) => {
    const filename = `${path}/${item}${suffix}.js`;
    exists(filename)
      .then(() => {
        require ? loadBundle(services, item, filename) : null;
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          const url = `${services[item]}${suffix}.js`;
          console.log(`Fetching: ${url}`);
          fetch(url)
            .then((res) => {
              const dest = fs.createWriteStream(filename);
              res.body.pipe(dest);
              res.body.on('end', () => {
                require ? loadBundle(services, item, filename) : null;
              });
            });
        } else {
          console.log('WARNING: Unknown fs error');
        }
      });
  });
};

const fetchCSS = () => {
  const filename = path.join(__dirname, './public/fetchedstyle.css');
  exists(filename)
    .then(() => {

    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        const url = 'http://ec2-54-183-129-156.us-west-1.compute.amazonaws.com/style.css';
        console.log(`Fetching ${url}`);
        fetch(url)
          .then((res) => {
            const dest = fs.createWriteStream(filename);
            res.body.pipe(dest);
          });
      }
    });
};

module.exports = (clientPath, serverPath, services) => {
  fetchBundles(clientPath, services, 'bundle-prod');
  fetchBundles(serverPath, services, 'bundle-prod-server', true);
  fetchCSS();
  return services;
};
