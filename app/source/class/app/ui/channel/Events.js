/**
 * Calendar
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 * @ignore($)
 */
qx.Class.define('app.ui.channel.Events', {
  extend: app.ui.channel.AbstractChannel,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    this._setLayout(new qx.ui.layout.VBox())
    this._createChildControl('header')
    this._createChildControl('calendar-container')
    this._createChildControl('status-bar')

    this.addListener('refresh', this.__refresh, this)
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __calendar: null,

    /**
     * Refresh calendar events
     * @private
     */
    __refresh: function () {
      if (this.__calendar) {
        this.__calendar.fullCalendar('refetchEvents')
      }
    },

    _getEvents: function (start, end, timezone, callback) {
      const startDate = start.toDate()
      const endDate = end.toDate()
      this.debug('collect events from', startDate, 'to', endDate)
      let events = []
      const dayInMs = (24 * 60 * 60 * 1000)
      const actor = app.Model.getInstance().getActor()
      const channelRelation = app.Model.getInstance().getChannelRelation(this.getSubscription().getChannel())


      this.getActivities().forEach(act => {
        if (act.getType() === 'Event') {
          const event = act.getContentObject()
          if (event.getEnd() >= startDate && event.getStart() <= endDate) {
            // workaround for wrong allDay events
            const durationInDays = (event.getEnd() - event.getStart()) / dayInMs
            const data = Object.assign(act.getContent(), {
              title: act.getTitle(),
              id: act.getId()
            })
            // use the parsed date objects
            data.start = event.getStart()
            data.end = event.getEnd()
            if (Number.isInteger(durationInDays) &&
              event.getStart().getHours() === 0 && event.getEnd().getHours() === 0) {
              data.allDay = true
            }
            if (data.categories && data.categories.length > 0) {
              data.title = `${data.categories.join(', ')}: ${data.title}`
            }
            let aclTypeToCheck = 'actions'
            if (actor.getId() === data.id) {
              aclTypeToCheck = 'ownerActions'
            } else if (channelRelation === 'member') {
              aclTypeToCheck = 'memberActions'
            }
            // check event permissions
            data.editable = this.getChannelActivitiesAcls().hasOwnProperty(aclTypeToCheck) &&
              this.getChannelActivitiesAcls()[aclTypeToCheck].includes('u')

            events.push(data)
          }
        }
      })
      console.log(events)
      callback(events)
    },

    /**
     * Handle clicks on events
     * @param calEvent {Object} calendar event which has been changed
     * @param jsEvent {Event} native browser event
     * @param view {Object} current view
     * @protected
     */
    _onEventClick: function (calEvent, jsEvent, view) {
      if (jsEvent.ctrlKey === true) {
        this._deleteActivity(calEvent.id)
      }
      return false
    },

    /**
     * Handle activity selections
     * @protected
     */
    _onSelection: function () {
    },

    /**
     * Handle event resize events which are fired after an event has been changed in duration
     * @param event {Object} calendar event which has been changed
     * @param delta {Object} duration object that represents the amount of time the event’s end was extended by
     * @param revertFunc {Function} is a function that, if called, reverts the event’s end date to the value before the drag. This is useful if an ajax call should fail.
     * @param jsEvent {Event} holds the native javascript event with low-level information such as mouse coordinates.
     * @param ui {null} holds an empty object Before version 2.1, the jQuery UI object.
     * @param view {Object} the current view object
     * @protected
     */
    _onEventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
      console.log(event.title + ' end is now ' + event.end.format())
      app.io.Rpc.getProxy().updateObjectProperty('Activity',
        event.id,
        {
          content: {
            end: event.end.format()
          }
        }).catch(err => {
        this.error(err)
        revertFunc()
      })
    },

    /**
     * Handle event drop events which are fired after an event has been moved to a different day/time
     * @param event {Object} calendar event which has been changed
     * @param delta {Object} duration object that represents the amount of time the event’s end was extended by
     * @param revertFunc {Function} is a function that, if called, reverts the event’s end date to the value before the drag. This is useful if an ajax call should fail.
     * @param jsEvent {Event} holds the native javascript event with low-level information such as mouse coordinates.
     * @param ui {null} holds an empty object Before version 2.1, the jQuery UI object.
     * @param view {Object} the current view object
     * @protected
     */
    _onEventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
      app.io.Rpc.getProxy().updateObjectProperty('Activity',
        event.id,
        {
          content: {
            end: event.end.format(),
            start: event.start.format()
          }
        }).catch(err => {
        this.error(err)
        revertFunc()
      })
    },

    __init: function () {
      this.__calendar = $('#calendar')
      this.__calendar.fullCalendar({
        // put your options and callbacks here
        defaultView: 'month',
        header: {
          left: app.Config.target === 'mobile' ? 'prev,next' : 'prev,next today',
          center: 'title',
          right: app.Config.target === 'mobile' ? 'month,agendaWeek,agendaDay' : 'month,agendaWeek,agendaDay,listMonth'
        },
        eventLimit: true, // allow "more" link when too many events
        locale: qx.locale.Manager.getInstance().getLocale(),
        height: 'parent',
        timezoneParam: 'UTC',
        events: this._getEvents.bind(this),
        eventClick: this._onEventClick.bind(this),
        eventResize: this._onEventResize.bind(this),
        eventDrop: this._onEventDrop.bind(this)
      })
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'calendar-container':
          control = new qx.ui.core.Widget()
          control.getContentElement().setAttribute('id', 'calendar')
          this._add(control, {flex: 1})
          control.addListenerOnce('appear', this.__init, this)
          break
      }
      return control || this.base(arguments, id, hash)
    }
  }
})
