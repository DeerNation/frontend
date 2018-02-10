/**
 * Actor model class
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.model.Actor', {
  extend: app.model.AbstractModel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (props) {
    this.base(arguments, props)

    const icon = new app.ui.basic.AvatarIcon()
    this.setIcon(icon)
    this.bind('username', icon, 'title')
    this.bind('color', icon, 'backgroundColor')
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {

    name: {
      check: 'String',
      init: '',
      event: 'changedName'
    },
    type: {
      check: ['Person', 'Server', 'Bot'],
      init: 'Person'
    },
    role: {
      check: 'String',
      nullable: true,
      event: 'changedRole'
    },
    desc: {
      check: 'String',
      nullable: true
    },
    email: {
      check: 'String',
      nullable: true,
      validate: qx.util.Validate.email()
    },
    username: {
      check: 'String',
      init: null,
      event: 'changedUsername'
    },
    password: {
      check: 'String',
      init: null
    },
    defaultNotification: {
      check: 'Object',
      nullable: true
    },
    online: {
      check: 'Boolean',
      init: false,
      event: 'changedOnline',
      apply: '_applyOnline'
    },
    status: {
      check: 'String',
      init: 'online',
      event: 'changedStatus',
      apply: '_persistProperty'
    },

    color: {
      check: 'Color',
      init: null,
      event: 'changedColor'
    },

    icon: {
      check: 'qx.ui.basic.Atom',
      nullable: true
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    // property apply
    _applyOnline: function (value) {
      if (app.Model.getInstance().getActor() === this) {
        app.io.Socket.getInstance().emit('$INT.users', {id: this.getId(), online: value})
      }
    },

    // property apply, overridden
    _persistProperty: function (value, old, name) {
      if (app.Model.getInstance().getActor() === this) {
        this.base(arguments, value, old, name)
      }
    }
  }
})
