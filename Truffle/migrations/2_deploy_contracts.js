// const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const Crowdfund = artifacts.require('Crowdfund')
// var contract = require("@truffle/contract");


module.exports = function (deployer) {
  let name = 'dummyCoin'
  let symbol = 'DUMB'
  let fundingCap = web3.utils.toWei("10000", "ether")
  let operatorPercent = 2
  let tokenScale = 1000

  // let sf = new SuperfluidSDK.Framework({
  //   web3,
  //   version: "test",
  //   tokens: ["DUMB"]
  // })

  // await sf.initialize();

  // console.log("host: " + sf.host.address)

  deployer.deploy(
    Crowdfund,
    name,
    symbol,
    fundingCap,
    operatorPercent,
    tokenScale
    // sf.host.address
  )
}
