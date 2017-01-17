const glue = require('glue')
const config = require('./config')
const hipchat = require('./hipchat')
const jibot = require('jibot')()
const pack = require('./package.json')

module.exports = build

function build(publicUrl) {
  let hip

  return glue.compose(config, {relativeTo: __dirname})
  .then(server => {
    const renderIssue = issue => {
      issue.descriptionLines = issue.description.split('\n')
      return server.render('issue.html', issue)
    }
    const renderIssues = issues => server.render('issues.html', {issues})

    server.route({
      method: 'GET',
      path: '/descriptor.json',
      config: {
        handler: (request, reply) => {
          reply.view('descriptor.json', {localBaseUrl: publicUrl, name: pack.name}).type('application/json')
        }
      }
    })

    server.route({
      method: 'POST',
      path: '/installable',
      config: {
        handler: (request, reply) => {
          console.log('HEADERS:', request.headers)
          console.log('BODY:', request.payload)
          reply()
          return hipchat({
            capabilitiesUrl: request.payload.capabilitiesUrl,
            botUrl: publicUrl,
            roomId: request.payload.roomId,
            oauthId: request.payload.oauthId,
            oauthSecret: request.payload.oauthSecret
          })
          .then(c => {
            hip = c
            console.log('hipclient setup')
          })
          .then(() => hip.message({
              message: '@all jimbo here, ask me stuff with the /jimbo command'
          }))
        }
      }
    })

    server.route({
      method: 'GET',
      path: '/',
      config: {
        handler: (request, reply) => reply.redirect('/descriptor.json')
      }
    })

    server.route({
      method: 'POST',
      path: '/message',
      config: {
        handler: (request, reply) => {
          const requester = request.payload.item.message.from.mention_name
          const headers = [
            `Ok @${requester} this is what I found:`,
            `@${requester} here is what you asked for:`,
            `this is the best I could do @${requester}...`
          ]

          const header = headers[getRandomInt(0, headers.length)]
          const jibotPhrase = request.payload.item.message.message.slice('/jimbo'.length).trim()
          console.log('PHRASE:', jibotPhrase)
          // console.log('BODY:', JSON.stringify(request.payload, null, 2))

          reply()

          return jibot(jibotPhrase)
          .then(i => Array.isArray(i) ? renderIssues(i) : renderIssue(i))
          .then(m => {
            console.log('MESSAGE:', m)
            return m
          })
          .then(message => hip.message({
            format: 'html',
            message: `${header}<br><br>${message}`
          }))
          .catch(err => console.log('ERR:', err))
        }
      }
    })

    return server
  })
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
