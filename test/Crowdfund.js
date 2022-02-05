const { expect } = require('chai')
const setupContracts = require('./helpers/setupContracts')

describe('Crowdfund', (accounts) => {
  let sf
  let dai
  let daix
  let crowdfund

  before(async function () {
    setupConfigs = await setupContracts()
    sf = setupConfigs.sf
    dai = setupConfigs.dai
    daix = setupConfigs.daix
    crowdfund = setupConfigs.crowdfund
  })
  it('Should transfer tokens between accounts', async function () {})
})
