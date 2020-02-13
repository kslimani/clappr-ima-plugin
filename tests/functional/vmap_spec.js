import EventDomStorage from '../support/event-dom-storage'

describe('VAST VMAP ads scenario', () => {
  it('display preroll, midroll and postroll', () => {

    cy.visit('/tests/vmap_spec.html', {
      onBeforeLoad(win) { EventDomStorage.make(win) }
    })

    cy.window().then((win) => {
      expect(win.Clappr).to.be.an('object')
      expect(win.ClapprImaPlugin).to.be.a('function')
      expect(win.google.ima).to.be.an('object')
    })

    cy.get('.player-poster[data-poster]').should('not.be.visible')

    // PREROLL
    cy.expectEvent(1, 'ad_begin')
    cy.get('.ima-plugin[data-ima]').should('be.visible')
    cy.expectEvent(2, 'impression', 'ad_begin')
    cy.expectEvent(3, 'started', 'impression')
    cy.expectEvent(4, 'first_quartile', 'started')
    cy.expectEvent(5, 'midpoint', 'first_quartile')
    cy.expectEvent(6, 'third_quartile', 'midpoint')
    cy.expectEvent(7, 'complete', 'third_quartile')
    cy.expectEvent(8, 'ad_end', 'complete')
    cy.get('.ima-plugin[data-ima]').should('not.be.visible')
    cy.expectEvent(9, 'player_play', 'ad_end')

    // Midroll is scheduled at 15 seconds
    cy.wait(15000)

    // MIDROLL
    cy.expectEvent(10, 'ad_begin', 'player_play')
    cy.get('.ima-plugin[data-ima]').should('be.visible')
    cy.expectEvent(11, 'impression', 'ad_begin')
    cy.expectEvent(12, 'started', 'impression')
    cy.expectEvent(13, 'first_quartile', 'started')
    cy.expectEvent(14, 'midpoint', 'first_quartile')
    cy.expectEvent(15, 'third_quartile', 'midpoint')
    cy.expectEvent(16, 'complete', 'third_quartile')
    cy.expectEvent(17, 'ad_end', 'complete')
    cy.get('.ima-plugin[data-ima]').should('not.be.visible')
    cy.expectEvent(18, 'player_play', 'ad_end')

    // Video length is 33 seconds
    cy.wait(16000)

    // POSTROLL
    cy.expectEvent(19, 'player_ended', 'player_play')
    cy.expectEvent(20, 'ad_begin', 'player_ended')
    cy.get('.ima-plugin[data-ima]').should('be.visible')
    cy.expectEvent(21, 'impression', 'ad_begin')
    cy.expectEvent(22, 'started', 'impression')
    cy.expectEvent(23, 'first_quartile', 'started')
    cy.expectEvent(24, 'midpoint', 'first_quartile')
    cy.expectEvent(25, 'third_quartile', 'midpoint')
    cy.expectEvent(26, 'complete', 'third_quartile')
    cy.expectEvent(27, 'ad_end', 'complete')
    cy.get('.ima-plugin[data-ima]').should('not.be.visible')

    cy.get('.player-poster[data-poster]').should('be.visible')

  })
})
