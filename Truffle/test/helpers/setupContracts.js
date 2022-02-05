const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/js-sdk')
const CFACrowdfund = artifacts.require('CFACrowdfund')
const Crowdfund = artifacts.require('Crowdfund')

module.exports = async function setupContracts(accounts) {
  const errorHandler = (err) => {
    if (err) throw err
  }

  operator = accounts[0]
  fundingRecipient = accounts[1]

  await deployFramework(errorHandler, {
    web3,
    from: operator,
  })

  await deployTestToken(errorHandler, [':', 'fDAI'], {
    web3,
    from: operator,
  })
  await deploySuperToken(errorHandler, [':', 'fDAI'], {
    web3,
    from: operator,
  })

  sf = new SuperfluidSDK.Framework({
    web3,
    version: 'test',
    tokens: ['fDAI'],
  })
  await sf.initialize()
  daix = sf.tokens.fDAIx
  dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

  app = await CFACrowdfund.new(sf.host.address)

  crowdfundInstance = await Crowdfund.deployed()

  await crowdfundInstance.setCFA(app.address)
  await crowdfundInstance.setFundingRecipient(fundingRecipient)
  await crowdfundInstance.setOperator(operator)

  return {
    sf: sf,
    daix: daix,
    dai: dai,
    cfa: app,
    operator: operator,
    fundingRecipient: fundingRecipient,
  }
}
