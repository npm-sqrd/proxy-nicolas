require('newrelic');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
const { redisClient } = require('./redisindex');

const port = process.env.PORT || 8000;

// app.use(express.static(path.join(__dirname, './public')));

const clientBundles = './public/services';
const serverBundles = './templates/services';
const serviceConfig = require('./service-config.json');
const services = require('./loader.js')(clientBundles, serverBundles, serviceConfig);

// services = {
//   Reviews: require('path to file server bundle ').default,
//   Photo: require('path to photo server bundle').default,
// }

const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('./templates/layout');
const App = require('./templates/app');
const Scripts = require('./templates/scripts');

const renderComponents = (components, props = {}) => Object.keys(components).map((item) => {
  const component = React.createElement(components[item], props);
  return ReactDom.renderToString(component);
  // '<Reviews />'
});

http.createServer((req, res) => {
  if (req.url.startsWith('/restaurants')) {
    const id = Number(req.url.slice(13));
    const redisKey = `Restaurant${id}`;
    redisClient.get(redisKey, (err, reply) => {
      if (err) {
        res.writeHead(404);
        res.write('Redis', err);
        res.end();
      } else if (reply !== null) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(reply);
      } else {
        axios({
          method: 'get',
          url: `http://localhost:3001/restaurants/${id}`,
        }).then((response) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          const jsonString = JSON.stringify(response.data);
          redisClient.setex(redisKey, 60, jsonString);
          res.end(jsonString);
        }).catch((error) => {
          res.writeHead(404);
          res.write('Not Found!', error);
          res.end();
        });
      }
    });
  } else if (req.url === '/') {
    const components = renderComponents(services);
    res.end(Layout(
      'Proxy Server',
      App(...components),
      Scripts(Object.keys(services)),
    ));
  } else if (req.url === '/services/Reviewsbundle-prod.js') {
    fs.readFile('./public/services/Reviewsbundle-prod.js', 'utf8', (err, file) => {
      if (err) {
        res.writeHead(404);
        res.write(err.toString());
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.write(file);
        res.end();
      }
    });
  } else if (req.url === '/fetchedstyle.css') {
    fs.readFile('./public/fetchedstyle.css', 'utf8', (err, file) => {
      if (err) {
        res.writeHead(404);
        res.write(err.toString());
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(file);
        res.end();
      }
    });
  }
}).listen(port);
console.log(`Proxy Server Up on port: ${port}`);
