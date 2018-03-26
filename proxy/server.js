require('newrelic');
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, './public')));

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

app.get('/', (req, res) => {
  const components = renderComponents(services);
  res.end(Layout(
    'Proxy Server',
    App(...components),
    Scripts(Object.keys(services)),
  ));
});

app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id;
  axios({
    method: 'get',
    url: `http://localhost:3001/restaurants/${id}`,
  }).then((response) => {
    res.json(response.data);
  });
});

app.listen(port, () => console.log(`Proxy Server Up on port: ${port}`));
