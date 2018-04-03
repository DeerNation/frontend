/* DeerNation community project
 *
 * copyright (c) 2017-2018, Tobias Braeutigam.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 * Label
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

/**
 * Simple class to be used for label lists.
 */
qx.Class.define('app.data.Label', {
  extend: qx.core.Object,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function (label) {
    this.base(arguments)
    if (label) {
      this.setLabel(label)
    }
  },

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    __cache: {},

    get: function (name, label) {
      if (!this.__cache.hasOwnProperty(name)) {
        this.__cache[name] = new app.data.Label(label || name)
      }
      return this.__cache[name]
    }
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    label: {
      check: 'String',
      nullable: true,
      event: 'changedLabel'
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    delete app.data.Label.__cache[this.getLabel()]
  }
})
