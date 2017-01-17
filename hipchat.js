const req = require('request-promise')

module.exports = register

function register({capabilitiesUrl, botUrl, roomId, oauthId, oauthSecret}) {
  return req.get({
    uri: capabilitiesUrl,
    json: true,
    simple: true
  })
  .then(caps => {
    // get a new access token from the server
    const token = () => req.post({
      uri: caps.capabilities.oauth2Provider.tokenUrl,
      form: {
        grant_type: 'client_credentials'
      },
      auth: {
        username: oauthId,
        password: oauthSecret
      },
      simple: true,
      json: true
    })
    .then(r => r.access_token)

    return {
      message({message, color = 'yellow', format = 'text'}) {
        return token()
        .then(t => req.post({
          baseUrl: caps.capabilities.hipchatApiProvider.url,
          uri: `/room/${roomId}/notification`,
          body: {
            message_format: format,
            color,
            message
          },
          auth: {
            bearer: t
          },
          simple: true,
          json: true
        }))
      }
    }
  })
}
