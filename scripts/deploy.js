// import { Framework } from '@superfluid-finance/sdk-core'

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // We get the contract to deploy
  // const CrowdfundFactory = await ethers.getContractFactory('CrowdfundFactory')
  // const crowdfundFactory = await CrowdfundFactory.deploy()

  // console.log("CrowdfundFactory deployed to:", crowdfundFactory.address);


  // const web3Provider = await Moralis.enableWeb3()
  // //   const web3Js = new Web3(Moralis.provider)

  // const sf = await Framework.create({
  //   networkName: 'matic',
  //   web3Js,
  // })

  // const web3ModalSigner = sf.createSigner({ web3Provider: web3Provider })


  // await sf.initialize()
  // daix = sf.tokens.fDAIx
  // dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

  // const factory = await ethers.getContractFactory('CrowdfundFactory')

  // const factoryInstance = await factory.deploy()

  // let name = 'dummyCoin'
  // let symbol = 'DUMB'
  // let fundingCap = toWad('10000').toString()
  // let fundingPercent = 20
  // let tokenScale = (10 ** 16).toString()
  // let fixedPercent = 20

  // crowdfundContract = await factoryInstance.createCrowdfund(
  //   name,
  //   symbol,
  //   owner,
  //   fundingRecipient,
  //   sf.host.address,
  //   dai.address,
  //   daix.address,
  //   fundingCap,
  //   fundingPercent,
  //   tokenScale,
  //   fixedPercent,
  // )
}


async function main() {
  // We get the contract to deploy
  // const Greeter = await ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // console.log("Greeter deployed to:", greeter.address);
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });