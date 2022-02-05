const { expect } = require('chai')
const setupContracts = require('./helpers/setupContracts')

describe('Crowdfund', (accounts) => {
  let sf
  let dai
  let daix
  let crowdfund
  let funder
  let operator
  let fundingRecipient

  before(async function () {
    setupConfigs = await setupContracts()
    sf = setupConfigs.sf
    dai = setupConfigs.dai
    daix = setupConfigs.daix
    crowdfund = setupConfigs.crowdfund
    
    operator = setupConfigs.fundingRecipient
    fundingRecipient = setupConfigs.fundingRecipient
    funder = setupConfigs.funder
  })
  it('Should transfer tokens between accounts', async function () {})
})
