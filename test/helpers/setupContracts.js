const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/js-sdk')
const { ethers } = require('hardhat')
const { web3tx, toWad, toBN, wad4human } = require('@decentral.ee/web3-helpers')

module.exports = async function setupContracts() {
  const [ownerSign, fundSign, funderSign] = await ethers.getSigners()

  let owner = await ownerSign.getAddress()
  let fundingRecipient = await fundSign.getAddress()
  let funder = funderSign

  // Superfluid //
  sf = await getSF(owner)
  await sf.initialize()
  daix = sf.tokens.fDAIx
  dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

  // Superfluid end//

  const factory = await ethers.getContractFactory('CrowdfundFactory')

  const factoryInstance = await factory.deploy()

  let name = 'dummyCoin'
  let symbol = 'DUMB'
  let fundingCap = toWad('10000').toString()
  let fundingPercent = 20
  let tokenScale = (10 ** 16).toString()
  let fixedPercent = 20

  crowdfundContract = await factoryInstance.createCrowdfund(
    name,
    symbol,
    owner,
    fundingRecipient,
    sf.host.address,
    dai.address,
    daix.address,
    fundingCap,
    fundingPercent,
    tokenScale,
    fixedPercent,
  )

  console.log('tessssttt')

  let ContractReceipt = await crowdfundContract.wait()

  console.log(ContractReceipt)

  crowdfundContract = await ethers.getContractFactory('Crowdfund')
  crowdfund = await crowdfundContract.attach(ContractReceipt.events[1].address)

  await web3tx(dai.mint, `owner mints many dai`)(owner, toWad(10000000), {
    from: owner,
  })

  await web3tx(dai.approve, `Account owner approves daix`)(
    daix.address,
    toWad(100),
    { from: owner },
  )
  funderAddr = await funder.getAddress()

  await web3tx(dai.transfer, `owner transfers to funder`)(
    funderAddr,
    toWad(1000),
    {
      from: owner,
    },
  )

  return {
    sf: sf,
    daix: daix,
    dai: dai,
    crowdfund: crowdfund,
    funder: funder,
    operator: owner,
    fundingRecipient: fundingRecipient,
    fixedPercent: fixedPercent,
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
