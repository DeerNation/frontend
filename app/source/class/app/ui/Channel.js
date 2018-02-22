/**
 * The main menu on the left side, showing the current Actor, his subscribed channels and more.
 *
 * @author tobiasb
 * @since 2018
 */

qx.Class.define('app.ui.Channel', {
  extend: qx.ui.core.Widget,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())
    this.setActivities(new qx.data.Array())
    this.__dateFormat = new qx.util.format.DateFormat(qx.locale.Date.getDateFormat('long'))

    // bind to global selected subscription
    app.Model.getInstance().bind('selectedSubscription', this, 'subscription')

    this._createChildControl('list')
    this._createChildControl('status-bar')

    this.addListener('swipe', this._onSwipe, this)

    qx.event.message.Bus.subscribe('channel.activities.delete', this._onActivityDelete, this)

    const selectUp = new qx.ui.command.Command('Up')
    const selectDown = new qx.ui.command.Command('Down')
    selectUp.addListener('execute', this._onSelectUp, this)
    selectDown.addListener('execute', this._onSelectDown, this)
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    /**
     * The channel subscription currently shown
     */
    subscription: {
      check: 'app.model.Subscription',
      nullable: true,
      event: 'changedSubscription',
      apply: '_applySubscription'
    },

    /**
     * All Activities in this channel
     */
    activities: {
      check: 'qx.data.Array',
      init: null,
      event: 'changeActivities',
      apply: '_applyActivities'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __currentSCChannel: null,
    __dateFormat: null,

    _onSwipe: function (ev) {
      if (ev.getDirection() === 'right') {
        const main = qx.core.Init.getApplication().getMain()
        main.getChildControl('menu').getChildControl('list').getSelection().removeAll()
      }
    },

    // property apply
    _applySubscription: function (subscription, oldSubscription) {
      const socket = app.io.Socket.getInstance()
      if (oldSubscription) {
        const chan = this.__currentSCChannel ? this.__currentSCChannel : socket.getScChannel(oldSubscription.getChannelId())
        if (chan) {
          chan.unwatch()
          chan.unsubscribe()
        }
      }
      if (subscription) {
        this.__currentSCChannel = socket.getScChannel(subscription.getChannelId())
        // get all messages published on this channel (aka the history)
        let activities = this.getActivities()
        activities.removeAll()
        app.io.Rpc.getProxy().getChannelActivities(subscription.getChannelId(), subscription.getViewedUntil()).then(messages => {
          activities.append(app.model.Factory.createAll(messages, app.model.Activity, {
            converter: function (model) {
              if (!model.published) {
                model.published = model.created
              }
            }
          }))
        })

        this.__currentSCChannel.subscribe()
        this.__currentSCChannel.watch(this._onActivity.bind(this))

        this.getChildControl('header').setSubscription(subscription)
        this.getChildControl('header').show()

        this.getChildControl('message-field').setModel(subscription.getChannel())
        this.getChildControl('message-field').show()
      }
    },

    // property apply
    _applyActivities: function (value) {
      if (this.hasChildControl('list')) {
        this.getChildControl('list').setModel(value)
      }
    },

    /**
     * Select the next editable activity above the current selection (or the last one when no one is selected)
     * @protected
     */
    _onSelectUp: function () {
      const selection = this.getChildControl('list').getSelection().getItem(0)
      const activities = this.getActivities()
      let index = selection ? activities.indexOf(selection) : activities.getLength() - 1
      if (index > 0) {
        index--
      }
      this.getChildControl('list').getSelection().replace([activities.getItem(index)])
    },

    /**
     * Select the next editable activity below the current selection (stops at the end of the list)
     * @protected
     */
    _onSelectDown: function () {
      const selection = this.getChildControl('list').getSelection().getItem(0)
      const activities = this.getActivities()
      let index = selection ? activities.indexOf(selection) : activities.getLength() - 1
      if (index + 1 < activities.getLength()) {
        index++
      }
      this.getChildControl('list').getSelection().replace([activities.getItem(index)])
    },

    /**
     * Handle bus messages of deleted activities
     * @param ev {Event}
     * @private
     */
    _onActivityDelete: function (ev) {
      const activity = ev.getData()
      if (activity.getChannelId() === this.getSubscription().getChannelId()) {
        this.getActivities().remove(activity)
      }
    },

    __findActivity: function (id) {
      let found
      this.getActivities().some(act => {
        if (act.getId() === id) {
          found = act
          return true
        }
      })
      return found
    },

    /**
     * Handler for channel watching
     *
     * @param payload {Object} incoming data
     * @protected
     */
    _onActivity: function (payload) {
      if (payload.hasOwnProperty('a') && payload.hasOwnProperty('c')) {
        let found
        switch (payload.a) {
          case 'd':
            // delete
            found = this.__findActivity(payload.c)
            if (found) {
              this.getActivities().remove(found)
            }
            break

          case 'u':
            // update
            found = this.__findActivity(payload.c.id)
            if (found) {
              found.set(payload.c)
            } else {
              // add new activity
              if (!payload.c.published) {
                payload.c.published = payload.c.created
              }
              this.getActivities().push(app.model.Factory.create(payload.c, app.model.Activity))
            }
            break

          case 'a':
            if (!payload.c.published) {
              payload.c.published = payload.c.created
            }
            this.getActivities().push(app.model.Factory.create(payload.c, app.model.Activity))
            break

          case 'i':
            // internal messaging, like states, writing users etc
            switch (payload.c.type) {
              case 'writes':
                const model = this._writingUsersController.getModel()
                const label = app.data.Label.get(payload.c.uid)
                if (!model.includes(label)) {
                  model.push(label)
                  label.$$timer = qx.event.Timer.once(function () {
                    model.remove(label)
                    delete label.$$timer
                    label.dispose()
                  }, this, 5000)
                } else if (payload.c.done) {
                  // user is done writing
                  model.remove(label)
                  label.$$timer.stop()
                  delete label.$$timer
                  label.dispose()
                } else {
                  label.$$timer.restart()
                }
                break

              default:
                this.warning('unhandled internal message type: ', payload.c.type)
                break
            }
            break
        }
      } else {
        throw new Error('wrong activity payload')
      }
      // if (!qx.lang.Type.isArray(payload)) {
      //   payload = [payload]
      // }
      // // create Activity instances and add them to the model
      // this.getActivities().append(app.model.Factory.createAll(payload, app.model.Activity, {
      //   converter: function (model) {
      //     if (!model.published) {
      //       model.published = model.created
      //     }
      //   }
      // }))
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'header':
          control = new app.ui.ChannelHeader()
          if (this.getSubscription()) {
            control.setSubscription(this.getSubscription())
          } else {
            control.exclude()
          }
          this._addAt(control, 0)
          break

        case 'list':
          control = new qx.ui.list.List(this.getActivities())
          control.setVariableItemHeight(true)
          const deferredScroll = qx.util.Function.debounce(() => {
            control.scrollToY(1e99)
          }, 100)
          this.getActivities().addListener('changeLength', deferredScroll, this)
          control.getSelection().addListener('change', this._onSelection, this)
          this.__applyListDelegate(control)
          this._addAt(control, 1, {flex: 1})
          break

        case 'status-bar':
          control = new qx.ui.container.Composite(new qx.ui.layout.Flow())
          this._writingUsersController = new qx.data.controller.List(new qx.data.Array(), control, 'label')
          this._addAt(control, 2)
          break

        case 'message-field':
          control = new (app.model.activity.Registry.getFormClass('message'))()
          if (this.getSubscription()) {
            control.setModel(this.getSubscription().getChannel())
          } else {
            control.exclude()
          }
          this._addAt(control, 3)
          break
      }
      return control || this.base(arguments, id, hash)
    },

    /**
     * Handle activity selections
     * @protected
     */
    _onSelection: function () {
      const selection = this.getChildControl('list').getSelection()
      // TODO handle other Activity types
      if (selection.getLength() === 1) {
        const activity = selection.getItem(0)
        const actor = app.Model.getInstance().getActor()
        if (actor.isAdmin() ||
            activity.getActorId() === actor.getId() ||
            this.getSubscription().getChannel().getOwnerId() === actor.getId()
        ) {
          switch (activity.getType()) {
            case 'Message':
              this.getChildControl('message-field').setActivity(activity)
              break

            case 'Event':
              this.error('Not implemented')
              break
          }
        }
      } else {
        this.getChildControl('message-field').resetActivity()
      }
    },

    __applyListDelegate: function (list) {
      const dateFormat = this.__dateFormat

      list.setDelegate({
        createItem: function () {
          return new app.ui.form.ActivityItem()
        },

        bindItem: function (controller, item, index) {
          controller.bindProperty('', 'model', null, item, index)
        },

        group: function (model) {
          const date = model.getPublished() || model.getCreated()
          return date ? dateFormat.format(date) : null
        },

        // createGroupItem: function () {
        //   return new app.ui.form.ActivityActor()
        // },
        //
        configureGroupItem: function (item) {
          item.setAppearance('activity-group-item')
        },
        //
        // bindGroupItem: function (controller, item, index) {
        //
        // },

        sorter: function (a, b) {
          const adate = a.getPublished() || a.getCreated()
          const bdate = b.getPublished() || b.getCreated()
          return adate.getTime() - bdate.getTime()
        }
      })
    }
  }
})
