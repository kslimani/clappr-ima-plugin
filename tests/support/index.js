// Cypress.io support file

/**
 * Disable screenshot on failure
 */
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
})

/**
 * Add "cy.expectEvent" test command. See also EventDomStorage class.
 *
 * @example cy.expectEvent(2, 'expectedEvent', 'expectedOptionalPreviousEvent')
 */
Cypress.Commands.add('expectEvent', (order, event, previousEvent) => {
  if (previousEvent) {
    cy.log(`[${order}] expect event "${event}" fired after event "${previousEvent}"`)

    cy.get('ul[data-cy="spyEvent"]')
      .find(`li[data-event="${event}"][data-order="${order}"]`)
      .should('have.attr', 'data-prev', previousEvent)
  } else {
    cy.log(`[${order}] expect event "${event}" fired first`)

    cy.get('ul[data-cy="spyEvent"]')
      .find(`li[data-event="${event}"][data-order="${order}"]`)
      .should('not.have.attr', 'data-prev')
  }
})
