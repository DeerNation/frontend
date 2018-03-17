/**
 * Config
 *
 * @author tobiasb
 * @since 2018
 */
qx.Class.define('app.Config', {
  type: 'static',

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    isApp: !!window.cordova,
    socket: {
      hostname: 'localhost',
      secure: false,
      port: 8000,
      rejectUnauthorized: false, // Only necessary during debug if using a self-signed certificate
      // codecEngine: scCodecMinBin
    },

    channelPrefix: 'hbg.channel.',
    crudChannelPrefix: 'crud>',
    target: qx.core.Environment.get('device.type'),

    firebaseConfig: {
      messagingSenderId: '1022981480494'
    },

    /**
     * Adds the current target to the classpath
     * @param path {String} class path
     * @returns {Class}
     */
    getTargetClass: function (path) {
      let newPath = path
      if (this.target !== 'desktop') {
        let parts = path.split('.')
        qx.lang.Array.insertAt(parts, this.target, 1)
        newPath = parts.join('.')
      }
      if (qx.Class.isDefined(newPath)) {
        return qx.Class.getByName(newPath)
      } else {
        throw new Error('Class ' + newPath + ' not defined')
      }
    },

    icons: {
      favorite: '@FASolid/f005',
      noFavorite: '@FARegular/f005',
      hide: '@FASolid/f070',
      show: '@FASolid/f06e',
      unsubscribe: '@FASolid/f2f5',
      subscribe: '@FASolid/f2f6',
      menu: '@FASolid/f142',
      online: '@FASolid/f111',
      offline: '@FARegular/f111',
      private: '@FASolid/f023',
      public: '@FASolid/f292',
      logout: '@FASolid/f2f5',
      smiley: '@FARegular/f118',
      plus: '@FASolid/f067',
      event: '@FARegular/f073',
      delete: '@FASolid/f2ed',
      edit: '@FARegular/f044',
      share: '@FASolid/f1e0',
      back: '@FASolid/f104'
    },

    init: function () {
      this.isApp = !!window.cordova
      let storeSocket = qx.bom.Storage.getLocal().getItem('socket')
      if (storeSocket) {
        this.socket = storeSocket
      } else if (this.isApp) {
        this.socket.hostname = 'app.hirschberg-sauerland.de'
        this.socket.secure = true
      }
    }
  }
})
