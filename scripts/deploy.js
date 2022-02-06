import { Framework } from '@superfluid-finance/sdk-core'
import { ethers } from 'ethers'
// import Web3 from 'web3'

async function main() {
  // We get the contract to deploy
  const CrowdfundFactory = await ethers.getContractFactory('CrowdfundFactory')
  const crowdfundFactory = await CrowdfundFactory.deploy()

  const web3Provider = await Moralis.enableWeb3()
  //   const web3Js = new Web3(Moralis.provider)

  const sf = await Framework.create({
    networkName: 'matic',
    web3Js,
  })

  const web3ModalSigner = sf.createSigner({ web3Provider: web3Provider })

  console.log('Crowdfund factory deployed to:', greeter.address)

  await sf.initialize()
  daix = sf.tokens.fDAIx
  dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
