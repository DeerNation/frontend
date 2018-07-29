function compile (data, callback) {
  // load plugins
  const glob = require('glob')
  const path = require('path')
  const fs = require('fs')
  const config = require(process.env.DEERNATION_CONFIG || '/etc/deernation/config.json')
  if (!config.PROTOS_DIR) {
    console.error('no PROTOS_DIR configured!!! Frontend will not work without it.')
  }
  if (config.PROTOS_DIR) {
    if (!fs.existsSync(config.PROTOS_DIR)) {
      console.error('PROTOS_DIR:', config.PROTOS_DIR, 'does not exist')
    } else {
      const manifestPath = path.join(config.PROTOS_DIR, 'frontend', 'Manifest.json')
      if (!fs.existsSync(manifestPath)) {
        console.error(manifestPath, 'does not exist. Please make sure, that you have generated the javascript code for your proto-files.')
      } else {
        console.log('adding library:', path.dirname(manifestPath))
        data.libraries.push(path.dirname(manifestPath))
      }
    }
  }
  glob.sync(path.join(config.PLUGINS_CONTENT_DIR, '*', 'Manifest.json')).forEach(manifest => {
    const settings = require(manifest)
    if (settings.provides.hasOwnProperty('namespace') && settings.provides.type === 'contentPlugin') {
      console.log('adding library:', path.dirname(manifest))
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
