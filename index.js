const buildServer = require('./server')
const hipchat = require('./hipchat')

let server

buildServer(process.env.JIMBO_PUBLIC_URL)
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
