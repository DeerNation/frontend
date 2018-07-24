function compile (data, callback) {
  // load plugins
  const glob = require('glob')
  const path = require('path')
  console.log(process.env.DEERNATION_PLUGINS_CONTENT_DIR)
  glob.sync(path.join(process.env.DEERNATION_PLUGINS_CONTENT_DIR, '*', 'Manifest.json')).forEach(manifest => {
    const settings = require(manifest)
    if (settings.provides.type === 'contentPlugin' && settings.provides.hasOwnProperty('namespace')) {
      data.libraries.push(path.dirname(manifest))
    }
  })

  if (process.env.CORDOVA) {
    console.log('building cordova app')
    data.targets.forEach(target => {
      if (!target.hasOwnProperty('environment')) {
        target.environment = {}
      }
      target.environment['app.cordova'] = true
    })
  }
  callback(null, data)
}
