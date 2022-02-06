const { expect, assert } = require('chai')
const setupContracts = require('./helpers/setupContracts')
const { web3tx, toWad, toBN, wad4human } = require('@decentral.ee/web3-helpers')

describe('Crowdfund', (accounts) => {
  let sf
  let dai
  let daix
  let crowdfund
  let funder
  let operator
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

  beforeEach(async function () {
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
  })

  it('Should allow user to fund project ', async () => {
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
    recipientBalancePrior = await dai.balanceOf(fundingRecipient)

    console.log('Balance prior is %s', recipientBalancePrior)

    balanceInContract = await dai.balanceOf(crowdfund.address)
    expectedPercentage = (parseInt(balanceInContract) / 100) * 20
    console.log('Balance in contract %s', balanceInContract)

    assert(balanceInContract > 0)

    await crowdfund.closeFunding()

    recipientBalanceAfter = await dai.balanceOf(fundingRecipient)

    assert.equal(
      parseInt(recipientBalancePrior) + expectedPercentage,
      recipientBalanceAfter,
    )

    //check stream is open

    console.log(await sf.cfa.listFlows(daix))
  })
})
