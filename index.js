const buildServer = require('./server')
const hipchat = require('./hipchat')

let server

buildServer('https://071f1b78.ngrok.io')
.then(s => {
  server = s
})
.then(() => server.start())
.then(() => {
  console.log(`Server running. Swagger UI at: ${server.info.uri}/documentation`)
})
.catch((err) => {
  console.log('ERROR:', err)
  process.exit(1)
})
