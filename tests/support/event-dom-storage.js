/**
 * EventDomStorage helper class. See also "cy.expectEvent" test command.
 */
export default class EventDomStorage {

  constructor(win, fn = 'spyEvent') {
    this.$el = null
    this.fn = fn
    this.win = win
    this.win[this.fn] = this.store.bind(this)
  }

  static make(win, fn) {
    return new EventDomStorage(win, fn)
  }

  _mount() {
    // Ensure document.body is available
    if (!this.win || !this.win.document || !this.win.document.body) {
      throw 'EventDomStorage: document.body unavailable'
    }

    // Create hidden container element
    this.$el = Cypress.$('<ul />')
      .attr('data-cy', this.fn)
      .hide()

    // Append to document body
    Cypress.$(this.win.document.body)
      .append(this.$el)
  }

  store(event) {
    if (this.$el === null) {
      this._mount()
    }

    // Calculate order from previous stored event
    let $prev = this.$el.find('li').last()
    let order = $prev.length > 0 ? parseInt($prev.attr('data-order')) + 1 : 1
    let prev = $prev.attr('data-event')

    // Prevents duplicated event
    if (event === prev) return

    // Append event to container
    this.$el.append(
      Cypress.$('<li />')
        .attr('data-event', event)
        .attr('data-order', order)
        .attr('data-prev', prev)
    )

    console.log(`[${order}] ${event}`)
  }
}
