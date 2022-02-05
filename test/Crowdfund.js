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
    
    operator = setupConfigs.owner
    fundingRecipient = setupConfigs.fundingRecipient
    funder = setupConfigs.funder
  })

  it('should allow setting of recipient and operator on contract', async () => {
    // assert.equal(operator, await crowdfund.operator.call())
    assert.equal(fundingRecipient, await crowdfund.fundingRecipient.call())
  })

  it('Should allow user to fund project ', async () => {

    const [funder] = await ethers.getSigners()
    funderAddress = await funder.getAddress()
    funderBalance = await funder.getBalance()

    console.log({ 
      "funderAddress": funderAddress,
      "balance": funderBalance
    })

    await crowdfund.connect(funder).fund({
      value: web3.utils.toWei('1', 'ether'),
      from: funderAddress,
    })
    assert.equal(await crowdfund.connect(funder).balanceOf(funderAddress), 1000)

    console.log({ 
      "funderAddress": funderAddress,
      "balance": funderBalance
    })

    await crowdfund.connect(funder).fund({
      value: web3.utils.toWei('1', 'ether'),
      from: funderAddress,
    })
    assert.equal(await crowdfund.connect(funder).balanceOf(funderAddress), 2000)
 
  })

  it('Should allow owner to withdraw ', async () => {
    const [funder_1, funder_2] = await ethers.getSigners()
    // const funder_1 = accounts[3]
    // const funder_2 = accounts[4]

    await crowdfund.connect(funder_1).fund({
      value: web3.utils.toWei('5', 'ether'),
      from: await funder_1.getAddress(),
    })

    await crowdfund.connect(funder_2).fund({
      value: web3.utils.toWei('1', 'ether'),
      from: await funder_2.getAddress(),
    })

    recipientBalancePrior = await web3.eth.getBalance(fundingRecipient)

    balanceInContract = await web3.eth.getBalance(crowdfund.address)

    assert(balanceInContract > 0)

    await crowdfund.withdraw()

    recipientBalanceAfter = await web3.eth.getBalance(fundingRecipient)

    assert.equal(
      parseInt(recipientBalancePrior) + parseInt(balanceInContract),
      parseInt(recipientBalanceAfter),
    )
  })
})
