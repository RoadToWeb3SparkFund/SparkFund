const Crowdfund = artifacts.require('Crowdfund')

contract('Crowdfund', (accounts) => {
  let operator
  let fundingRecipient
  let crowdfund

  beforeEach(async () => {
    crowdfund = await Crowdfund.deployed()

    operator = accounts[0]
    fundingRecipient = accounts[1]

    await crowdfund.setFundingRecipient(fundingRecipient)
    await crowdfund.setOperator(operator)
  })
  it('should allow setting of recipient and operator on contract', async () => {
    assert.equal(operator, await crowdfund.operator.call())
    assert.equal(fundingRecipient, await crowdfund.fundingRecipient.call())
  })
  it('Should allow user to fund project ', async () => {
    const funder = accounts[3]

    await crowdfund.fund(1, {value: 1, from: funder} )
    assert.equal(await crowdfund.balanceOf(funder), 1000)

    await crowdfund.fund(1, {value: 1, from: funder} )
    assert.equal(await crowdfund.balanceOf(funder), 2000)

  })
  xit('Should allow owner to withdraw ', async () => {
    const funder_1 = accounts[3]
    const funder_2 = accounts[4]

    await crowdfund.fund(5, {value: 5, from: funder_1} )
    await crowdfund.fund(1, {value: 1, from: funder_2} )
    
    recipientBalancePrior = await web3.eth.getBalance(fundingRecipient)

    await crowdfund.withdraw()

    balanceInContract = await web3.eth.getBalance(crowdfund.address)
    
    assert(balanceInContract > 0)

    recipientBalanceAfter = await web3.eth.getBalance(fundingRecipient)

    assert.equal(recipientBalancePrior + balanceInContract, recipientBalanceAfter)
    
  })
})
