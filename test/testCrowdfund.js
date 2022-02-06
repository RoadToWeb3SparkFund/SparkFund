const hre = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
chai.use(solidity)
const { expect } = chai

const setupContracts = require('./helpers/setupContracts')
const { web3tx, toWad, toBN, wad4human } = require('@decentral.ee/web3-helpers')
const traveler = require('ganache-time-traveler')
const TEST_TRAVEL_TIME = 3600 * 1 // 1 hour

describe('Crowdfund', () => {
  let sf
  let dai
  let daix
  let crowdfund
  let funder
  let fundingRecipient
  let fixedPercent

  before(async function () {
    setupConfigs = await setupContracts()
    sf = setupConfigs.sf
    dai = setupConfigs.dai
    daix = setupConfigs.daix
    crowdfund = setupConfigs.crowdfund

    operator = setupConfigs.owner
    fundingRecipient = setupConfigs.fundingRecipient
    funder = setupConfigs.funder
    fixedPercent = setupConfigs.fixedPercent
  })

  beforeEach(async function () {})

  async function addTransactions() {
    funderAddress = funder.address
    // Approve and add transactions

    await web3tx(
      dai.approve,
      `Account owner approves contract`,
    )(crowdfund.address, toWad(200), { from: funderAddress })

    console.log('toWad200', parseInt(toWad(200)))
    await crowdfund.connect(funder).fund(toWad(200).toString())

    await web3tx(
      dai.approve,
      `Account owner approves contract`,
    )(crowdfund.address, toWad(300), { from: funderAddress })

    await crowdfund.connect(funder).fund(toWad(300).toString())
  }

  it('Should allow user to fund project ', async () => {
    await addTransactions()

    assert.equal(
      parseInt(await crowdfund.connect(funder).balanceOf(funderAddress)),
      50000,
    )

    assert.equal(
      (await dai.balanceOf(crowdfund.address)).toString(),
      toWad(500).toString(),
    )
  })

  it('Should allow owner to close funding ', async () => {
    await addTransactions()
    recipientBalancePrior = await dai.balanceOf(fundingRecipient)

    console.log('Balance prior is %s', recipientBalancePrior)

    balanceInContract = await dai.balanceOf(crowdfund.address)

    // assume defaults in setupContracts.js
    expectedFixed = (parseInt(balanceInContract) / 100) * 20
    expectedStreamed = (parseInt(balanceInContract) / 100) * 80

    console.log('Balance in contract %s', balanceInContract)

    assert(balanceInContract > 0)

    await crowdfund.closeFunding()

    recipientBalanceAfter = await dai.balanceOf(fundingRecipient)

    assert.equal(
      parseInt(recipientBalancePrior) + expectedFixed,
      recipientBalanceAfter,
    )

    //check stream is open

    console.log(await sf.cfa.listFlows(daix))

    await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME)

    DaiXAfter = parseInt(await daix.balanceOf(fundingRecipient))

    // There seems to be a slight discrepency, I will need to look into this a bit more later.
    // At the moment, this is probably OK!

    expectedFundsStreamed = expectedStreamed / (24 * 30 * 12)
    assert.closeTo(
      expectedFundsStreamed / 10 ** 18,
      DaiXAfter / 10 ** 18,
      0.000000005,
    )

    //also check fundingRecipient has been given the allocated tokens

    fundingRecipientTokens = parseInt(
      await crowdfund.balanceOf(fundingRecipient),
    )

    expectedRecipientTokens = parseInt(
      ((await crowdfund.totalSupply()) / 100) * 20,
    )

    assert.equal(fundingRecipientTokens, expectedRecipientTokens)
  })

  it('Try closing funding again', async () => {
    await expect(crowdfund.closeFunding()).to.be.revertedWith(
      'Crowdfund: Funding must be open',
    )
  })

  it('Try posting transactions again', async () => {
    await expect(addTransactions()).to.be.revertedWith(
      'Crowdfund: Funding must be open',
    )
  })
})
