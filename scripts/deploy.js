// import { Framework } from '@superfluid-finance/sdk-core'
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { web3tx, toWad } = require("@decentral.ee/web3-helpers");

async function main() {
  const [deployer, owner, fundingRecipient] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // We get the contract to deploy
  const CrowdfundFactory = await ethers.getContractFactory('CrowdfundFactory')
  const crowdfundFactory = await CrowdfundFactory.deploy()

  console.log("CrowdfundFactory deployed to:", crowdfundFactory.address);


  // const web3Provider = await Moralis.enableWeb3()
  // //   const web3Js = new Web3(Moralis.provider)

  // const sf = await Framework.create({
  //   networkName: 'matic',
  //   web3Js,
  // })

  const sf = new SuperfluidSDK.Framework({
    web3,
    // version: "test",
    networkName: 'matic',
    tokens: ["fDAI"]
  });
  await sf.initialize();

  // const web3ModalSigner = sf.createSigner({ web3Provider: web3Provider })


  // await sf.initialize()
  daix = sf.tokens.fDAIx
  dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

  // const factory = await ethers.getContractFactory('CrowdfundFactory')

  // const factoryInstance = await factory.deploy()

  // console.log("facotryInstancedeployed to:", factoryInstance.address);

  let name = 'dummyCoin'
  let symbol = 'DUMB'
  let fundingCap = toWad('10000').toString()
  let fundingPercent = 20
  let tokenScale = (10 ** 16).toString()
  let fixedPercent = 20

  crowdfundContract = await crowdfundFactory.createCrowdfund(
    name,
    symbol,
    deployer.address, // owner,
    deployer.address, // fundingRecipient,
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
  .then(() => {
    console.log("done")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });