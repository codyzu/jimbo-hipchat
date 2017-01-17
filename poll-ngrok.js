const req = require('request-promise')

waitForNgrok()
.then(t => {
  console.error('RESULT:', t)
  console.log(t.tunnels.find(tunnel => tunnel.public_url.startsWith('https')).public_url)
})
.catch(err => {
  console.error('ERROR:', err)
  process.exit(1)
})

// polls ngrok and prints the external port
function waitForNgrok () {
  const timeout = 5 * 60 * 1000
  const pollInterval = 1000
  let iterations = Math.ceil(timeout / pollInterval)

  return pollNgrok()

  function pollNgrok (err, response) {
    // always return a promise
    // check if we should continue the recursion
    if (--iterations) {
      console.error(`Waiting for ngrok... (${iterations}s)`)
      return new Promise(resolve => setTimeout(resolve, pollInterval))
        .then(() => req.get({
          uri: 'http://ngrok:4040/api/tunnels',
          simple: true,
          json: true
        }))
        .then(t => {
          if (t.tunnels.length < 1) {
            throw new Error('No tunnels running')
          }

          return t
        })
        .catch(pollNgrok)
    } else {
      return Promise.reject(new Error(`Timeout waiting for ngrok: ${err}`))
    }
  }
}
