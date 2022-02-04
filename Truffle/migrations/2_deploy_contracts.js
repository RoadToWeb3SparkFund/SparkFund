const Crowdfund = artifacts.require('Crowdfund')

module.exports = function (deployer) {
  let name = 'dummyCoin'
  let symbol = 'DUMB'
  let fundingCap = 10000
  let operatorPercent = 2
  let tokenScale = 1000

  deployer.deploy(
    Crowdfund,
    name,
    symbol,
    fundingCap,
    operatorPercent,
    tokenScale,
  )
}
