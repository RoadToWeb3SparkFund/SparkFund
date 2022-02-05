const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/js-sdk')
const { ethers } = require('hardhat')

module.exports = async function setupContracts() {
  const [ownerSign, fundSign] = await ethers.getSigners()

  let owner = await ownerSign.getAddress()
  let fundingRecipient = await fundSign.getAddress()

  // Superfluid //
  sf = await getSF(owner)
  await sf.initialize()
  daix = sf.tokens.fDAIx
  dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

  const CFACrowdfund = await ethers.getContractFactory('CFACrowdfund')
  const CFAInstance = await CFACrowdfund.deploy(sf.host.address)

  // Superfluid end//

  const factory = await ethers.getContractFactory('CrowdfundFactory')

  const factoryInstance = await factory.deploy()

  let name = 'dummyCoin'
  let symbol = 'DUMB'
  let fundingCap = ethers.utils.parseEther('10000')
  let operatorPercent = 2
  let tokenScale = 1000

  crowdfundContract = await factoryInstance.createCrowdfund(
    name,
    symbol,
    owner,
    fundingRecipient,
    CFAInstance.address,
    fundingCap,
    operatorPercent,
    tokenScale,
  )

  let ContractReceipt = await crowdfundContract.wait()

  console.log(ContractReceipt)

  crowdfundContract = await ethers.getContractFactory('Crowdfund')
  crowdfund = await crowdfundContract.attach(ContractReceipt.events[1].address)

  return {
    sf: sf,
    daix: daix,
    dai: dai,
    crowdfund: crowdfund,
  }
}

async function getSF(owner) {
  const errorHandler = (err) => {
    if (err) throw err
  }

  await deployFramework(errorHandler, {
    web3,
    from: owner,
  })

  await deployTestToken(errorHandler, [':', 'fDAI'], {
    web3,
    from: owner,
  })
  await deploySuperToken(errorHandler, [':', 'fDAI'], {
    web3,
    from: owner,
  })

  return new SuperfluidSDK.Framework({
    web3,
    version: 'test',
    tokens: ['fDAI'],
  })
}
