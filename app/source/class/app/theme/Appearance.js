/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define('app.theme.Appearance',
  {
    extend: qx.theme.indigo.Appearance,

    appearances:
    {
      'listitem': {
        style: function (states) {
          let padding = [3, 5, 3, 5]
          if (states.lead) {
            padding = [2, 4, 2, 4]
          }
          if (states.dragover) {
            padding[2] -= 2
          }

          let backgroundColor
          if (states.selected) {
            backgroundColor = 'background-selected'
            if (states.disabled) {
              backgroundColor += '-disabled'
            }
          }
          return {
            padding: padding,
            backgroundColor: backgroundColor,
            textColor: states.selected ? 'text-selected' : undefined,
            decorator: states.lead ? 'lead-item' : states.dragover ? 'dragover' : undefined,
            opacity: states.drag ? 0.5 : undefined
          }
        }
      },
      'activity-listitem': 'listitem',

      'activity-listitem/authorName': {
        include: 'label',
        style: function () {
          return {
            font: 'bold',
            alignY: 'middle',
            padding: [4, 4]
          }
        }
      },
      'activity-listitem/authorUsername': {
        include: 'activity-listitem/authorName',

        style: function () {
          return {
            font: 'default',
            textColor: 'info-font'
          }
        }
      },
      'activity-listitem/published': 'activity-listitem/authorUsername',
      'activity-listitem/authorRoles': 'activity-listitem/authorName',

      'authorRole-listitem': {
        include: 'listitem',
        alias: 'listitem',
        style: function () {
          return {
            padding: [0, 4],
            backgroundColor: 'info-font',
            textColor: 'white',
            decorator: 'rounded',
            allowGrowY: false,
            alignY: 'middle',
            font: 'small'
          }
        }
      },

      'activity-listitem/title': {
        include: 'label',
        style: function () {
          return {
            alignY: 'middle',
            padding: [0, 18],
            margin: 0
          }
        }
      },
      'activity-listitem/message': 'activity-listitem/title',

      'activity-group-item':
      {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            padding: 4,
            textAlign: 'center',
            font: 'activity-group',
            decorator: 'activity-group'
          }
        }
      },

      /*
     ---------------------------------------------------------------------------
       SIDEBAR
     ---------------------------------------------------------------------------
     */
      'splitpane/menu/actor-container': {
        style: function () {
          return {
            padding: 8
          }
        }
      },
      'splitpane/menu/actor-name': {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            font: 'sidebar-headline',
            textColor: 'white'
          }
        }
      },

      'splitpane/menu/actor-icon': {

        style: function () {
          return {
            font: 'sidebar-actor-icon',
            textColor: 'white',
            width: 40,
            height: 40,
            maxWidth: 40,
            maxHeight: 40,
            allowGrowX: false,
            allowGrowY: false,
            marginRight: 10,
            center: true,
            decorator: 'rounded'
          }
        }
      },

      'splitpane/menu/menu-button': {

        style: function () {
          return {
            icon: app.Config.icons.menu + '/20',
            show: 'icon',
            textColor: 'white',
            center: true
          }
        }
      },
      'splitpane/menu/searchbar-container': {
        style: function () {
          return {
            padding: 8
          }
        }
      },
      'splitpane/menu/searchbox/textfield': {

        style: function () {
          return {
            padding: [4, 8],
            decorator: 'channel-bar-form-items',
            allowGrowY: true
          }
        }
      },
      'splitpane/menu/addchannel-button': {

        style: function () {
          return {
            marginLeft: 8,
            center: true,
            width: 37,
            height: 37,
            maxWidth: 37,
            maxHeight: 37,
            font: 'sidebar-actor-icon',
            decorator: 'channel-bar-form-items'
          }
        }
      },

      'splitpane/menu/actor-status': {
        include: 'atom',
        alias: 'atom',
        style: function () {
          return {
            show: 'both',
            icon: app.Config.icons.online + '/12'
          }
        }
      },
      'splitpane/menu/actor-status/icon': {

        style: function () {
          return {
            source: app.Config.icons.online + '/12'
          }
        }
      },

      'channel-group-item': {
        include: 'label',
        alias: 'label',

        style: function () {
          return {
            padding: [18, 8, 4, 8],
            font: 'bold',
            textColor: 'menu-text'
          }
        }
      },

      'channel-listitem': {
        include: 'listitem',
        alias: 'listitem',

        style: function () {
          return {
            padding: [0, 8, 0, 8],
            font: 'channel',
            textColor: 'inherit'
          }
        }
      },

      'channel-listitem/icon': {
        include: 'splitpane/menu/actor-icon',
        alias: 'splitpane/menu/actor-icon',

        style: function () {
          return {
            font: 'small',
            width: 20,
            height: 20,
            maxWidth: 20,
            maxHeight: 20,
            marginRight: 4,
            show: 'label'
          }
        }
      },

      'channel-listitem/type': {
        style: function () {
          return {
            width: 12,
            height: 12,
            scale: true,
            margin: [0, 4, 0, 8]
          }
        }
      },
      'channel-listitem/name': {
        style: function () {
          return {
            allowGrowX: true
          }
        }
      },

      'channel-listitem/menu-button': {
        style: function () {
          return {

          }
        }
      },

      'splitpane/menu': {
        style: function () {
          return {
            backgroundColor: 'menu-background',
            width: 280,
            minWidth: 280,
            maxWidth: 280,
            padding: 8,
            textColor: 'menu-text'
          }
        }
      },
      'splitpane/menu/list': {
        include: 'list',
        alias: 'list',

        style: function () {
          return {
            backgroundColor: 'transparent',
            textColor: 'inherit',
            decorator: null
          }
        }
      },

      'splitpane/channel/header': {
        style: function () {
          return {
            minHeight: 50,
            padding: [0, 20],
            backgroundColor: '#EEEEEE'
          }
        }
      },

      'splitpane/channel/header/title': {
        style: function () {
          return {
            margin: 8,
            gap: 4
          }
        }
      },

      'splitpane/channel/header/title/label': {
        style: function () {
          return {
            font: 'channel'
          }
        }
      },

      'splitpane/channel/header/title/icon': {
        style: function () {
          return {
            textColor: 'lightgrey'
          }
        }
      },

      'splitpane/channel/header/favorite': {
        style: function (states) {
          return {
            textColor: states.enabled ? 'favorite' : 'lightgrey'
          }
        }
      },

      'splitpane/channel/header/description': {
        style: function () {
          return {
            textColor: 'lightgrey',
            margin: 8
          }
        }
      },

      /*
      ---------------------------------------------------------------------------
       SCROLLBAR
      ---------------------------------------------------------------------------
      */
      'scrollbar/slider': {
        style: function () {
          return {
            backgroundColor: 'rgba(100,100,100,0.1)'
          }
        }
      },
      'scrollbar/slider/knob': {
        style: function (states) {
          let decorator = 'scroll-knob'

          if (!states.disabled) {
            if (states.hovered && !states.pressed && !states.checked) {
              decorator = 'scroll-knob-hovered'
            } else if (states.hovered && (states.pressed || states.checked)) {
              decorator = 'scroll-knob-pressed-hovered'
            } else if (states.pressed || states.checked) {
              decorator = 'scroll-knob-pressed'
            }
          }

          return {
            height: 14,
            width: 10,
            cursor: states.disabled ? undefined : 'pointer',
            decorator: decorator,
            minHeight: states.horizontal ? undefined : 20,
            minWidth: states.horizontal ? 10 : undefined
          }
        }
      },

      'scrollbar/button': {}
    }
  })
