const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const Crowdfund = artifacts.require('Crowdfund')
// const Web3 = require("web3");
const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");

contract('Crowdfund', (accounts) => {
  let operator
  let fundingRecipient
  let crowdfund
  // let sf;
  const errorHandler = (err) => {
    if (err) throw err;
};

  // before(async function () {
  //   //process.env.RESET_SUPERFLUID_FRAMEWORK = 1;
  //   await deployFramework(errorHandler, {
  //       web3,
  //       from: accounts[0],
  //   });
  // });

  beforeEach(async () => {
   // from migration
    let name = 'dummyCoin'
    let symbol = 'DUMB'
    let fundingCap = web3.utils.toWei("10000", "ether")
    let operatorPercent = 2
    let tokenScale = 1000


    // await deployTestToken(errorHandler, [":", "fDAI"], {
    //   web3,
    //   from: accounts[0],
    // });
    // await deploySuperToken(errorHandler, [":", "fDAI"], {
    //   web3,
    //   from: accounts[0],
    // });


    sf = new SuperfluidSDK.Framework({
      isTruffle: true,
      tokens: ["fDAI"]
    });
    await sf.initialize();
    // crowdfund = await Crowdfund.new(
    //   name,
    //   symbol,
    //   fundingCap,
    //   operatorPercent,
    //   tokenScale
    //   // sf
    // );
    console.log("host:" + sf.host.address);


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

    await crowdfund.fund({
      value: web3.utils.toWei('1', 'ether'),
      from: funder,
    })
    assert.equal(await crowdfund.balanceOf(funder), 1000)

    await crowdfund.fund({
      value: web3.utils.toWei('1', 'ether'),
      from: funder,
    })
    assert.equal(await crowdfund.balanceOf(funder), 2000)
  })

  it('Should allow owner to withdraw ', async () => {
    const funder_1 = accounts[3]
    const funder_2 = accounts[4]

    await crowdfund.fund({
      value: web3.utils.toWei('5', 'ether'),
      from: funder_1,
    })
    await crowdfund.fund({
      value: web3.utils.toWei('1', 'ether'),
      from: funder_2,
    })

    recipientBalancePrior = await web3.eth.getBalance(fundingRecipient)
    balanceInContract = await web3.eth.getBalance(crowdfund.address)

    assert(balanceInContract > 0)

    await crowdfund.withdraw()

    recipientBalanceAfter = await web3.eth.getBalance(fundingRecipient)

    assert.equal(
      parseInt(recipientBalancePrior) + parseInt(balanceInContract),
      parseInt(recipientBalanceAfter),
    )
  })

})
