module.exports = items => `
<link rel="stylesheet" type="text/css" href="fetchedstyle.css">
<script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  ${items.map(item => `<script src="services/${item}bundle-prod.js"></script>`).join('\n')}
  <script>
    ${items.map(item => `
        ReactDOM.hydrate(
        React.createElement(App, {id: 10}),
        document.getElementById('${item}')
      );`).join('\n')}
  </script>
`;
