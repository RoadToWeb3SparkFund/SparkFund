const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/js-sdk')
const { ethers } = require('hardhat')
const { web3tx, toWad, toBN } = require("@decentral.ee/web3-helpers");


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
  let fixedPercent = 20;

  crowdfundContract = await factoryInstance.createCrowdfund(
    name,
    symbol,
    owner,
    fundingRecipient,
    CFAInstance.address,
    fundingCap,
    operatorPercent,
    tokenScale,
    fixedPercent
  )

  let ContractReceipt = await crowdfundContract.wait()

  console.log(ContractReceipt)

  crowdfundContract = await ethers.getContractFactory('Crowdfund')
  crowdfund = await crowdfundContract.attach(ContractReceipt.events[1].address)


  // if (!dai) {
    // const daiAddress = await sf.tokens.fDAI.address;
    // dai = await sf.contracts.TestToken.at(daiAddress);
    // for (let i = 0; i < accounts.length; ++i) {
        await web3tx(dai.mint, `owner mints many dai`)(
            owner,
            toWad(10000000),
            { from: owner }
        );

        await web3tx(
          dai.approve,
          `Account owner approves daix`
      )(daix.address, toWad(100), { from: owner });
    // }
// }

  
  // const totalSupply = (10 ** 9).toString()
		
  // await dai.mint(100000)
  // await dai.transfer(owner, 50);
  // console.log({
  //   "YESSdS": await dai.balanceOf(owner)
  // });

  // console.log({
  //   "YESSS": await daix.balanceOf(owner)
  // });

  return {
    sf: sf,
    daix: daix,
    dai: dai,
    crowdfund: crowdfund,
    funder: funder,
    operator: owner,
    fundingRecipient: fundingRecipient,
    fixedPercent: fixedPercent
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
