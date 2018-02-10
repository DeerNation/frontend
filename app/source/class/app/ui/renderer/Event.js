/**
 * Renders view of a single event activity item
 *
 * @author Tobias Bräutigam <tbraeutigam@gmail.com>
 * @since 2018
 */

qx.Class.define('app.ui.renderer.Event', {
  extend: qx.ui.core.Widget,
  implement: app.ui.renderer.IRenderer,
  include: app.ui.form.MBindPropertyToChildControl,

  /*
  ******************************************************
    CONSTRUCTOR
  ******************************************************
  */
  construct: function () {
    this.base(arguments)
    const layout = new qx.ui.layout.Grid()
    layout.setColumnAlign(0, 'center', 'middle')
    layout.setColumnFlex(1, 1)
    this._setLayout(layout)

    const cc = ['date-sheet', 'date', 'location', 'categories']
    cc.forEach(this._createChildControl, this)
    this.__monthFormat = new qx.util.format.DateFormat('MMM')
    this.__dayFormat = new qx.util.format.DateFormat('d')
  },

  /*
  ******************************************************
    PROPERTIES
  ******************************************************
  */
  properties: {
    model: {
      nullable: true,
      event: 'changeModel',
      apply: '_applyModel',
      dereference: true
    },

    appearance: {
      refine: true,
      init: 'event-activity'
    }
  },

  /*
  ******************************************************
    MEMBERS
  ******************************************************
  */
  members: {
    __monthFormat: null,
    __dayFormat: null,
    __catController: null,

    _applyModel: function (value, old) {
      if (old && !value) {
        old.removeRelatedBindings(this.getChildControl('title'))
        const content = old.getContentObject()
        if (content) {
          content.removeRelatedBindings(this.getChildControl('message'))
        }
      }
      if (value) {
        let control = this.getChildControl('title')
        this._bindPropertyToChildControl(value, 'title', 'title', 'value', {
          converter: function (value) {
            if (value) {
              control.show()
              return app.data.converter.Markdown.convert(value)
            } else {
              control.exclude()
              return value
            }
          }
        }, old)

        const content = value.getContentObject()
        if (content) {
          this._bindPropertyToChildControl(content, 'start', 'day', 'value', {
            converter: function (value) {
              return this.__dayFormat.format(value)
            }.bind(this)
          }, old && old.getContentObject())
          this._bindPropertyToChildControl(content, 'start', 'month', 'value', {
            converter: function (value) {
              return this.__monthFormat.format(value)
            }.bind(this)
          }, old && old.getContentObject())
          this._bindPropertyToChildControl(content, 'location', 'location', 'value', null, old && old.getContentObject())
          this._bindPropertyToChildControl(content, 'description', 'description', 'value', null, old && old.getContentObject())

          if (!this.__catController) {
            this.__catController = new qx.data.controller.List(content.getCategories(), this.getChildControl('categories'), '')
            this.__catController.setDelegate({
              configureItem: function (item) {
                item.setAppearance('category')
              }
            })
          } else {
            this.__catController.setModel(content.getCategories())
          }
        }
      }
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      let control
      switch (id) {
        case 'date-sheet':
          let layout = new qx.ui.layout.VBox()
          layout.setAlignX('center')
          control = new qx.ui.container.Composite(layout)
          this._add(control, {row: 0, column: 0, rowSpan: 3})
          break

        case 'day':
          control = new app.ui.basic.Label()
          this.getChildControl('date-sheet').add(control)
          break

        case 'month':
          control = new app.ui.basic.Label()
          this.getChildControl('date-sheet').add(control)
          break

        case 'title':
          control = new app.ui.basic.Label()
          this._add(control, {row: 0, column: 1})
          break

        case 'details':
          control = new qx.ui.container.Composite(new qx.ui.layout.VBox())
          this._add(control, {row: 1, column: 1})
          break

        case 'location':
          control = new app.ui.basic.Label()
          this.getChildControl('details').add(control)
          break

        case 'categories':
          control = new qx.ui.container.Composite(new qx.ui.layout.Flow(8, 8))
          this._add(control, {row: 3, column: 0, colSpan: 2})
          break

        case 'date':
          control = new app.ui.basic.Label()
          this.getChildControl('details').add(control)
          break

        case 'description':
          control = new app.ui.basic.Label()
          this._add(control, {row: 2, column: 1})
          break
      }
      return control || this.base(arguments, id, hash)
    }
  },

  /*
  ******************************************************
    DESTRUCTOR
  ******************************************************
  */
  destruct: function () {
    this._disposeObjects('__monthFormat', '__dayFormat')
  }
})
