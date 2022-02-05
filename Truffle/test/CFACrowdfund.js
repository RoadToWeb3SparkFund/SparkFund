const { web3tx, toWad, wad4human } = require('@decentral.ee/web3-helpers')

const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/js-sdk')
const CFACrowdfund = artifacts.require('CFACrowdfund')

contract('CFACrowdfund', (accounts) => {
  const errorHandler = (err) => {
    if (err) throw err
  }

  const names = ['Admin', 'Alice', 'Bob', 'Carol', 'Dan', 'Emma', 'Frank']
  accounts = accounts.slice(0, names.length)

  let sf
  let dai
  let daix
  let app
  const u = {} // object with all users
  const aliases = {}

  before(async function () {
    //process.env.RESET_SUPERFLUID_FRAMEWORK = 1;
    await deployFramework(errorHandler, {
      web3,
      from: accounts[0],
    })
  })

  beforeEach(async function () {
    await deployTestToken(errorHandler, [':', 'fDAI'], {
      web3,
      from: accounts[0],
    })
    await deploySuperToken(errorHandler, [':', 'fDAI'], {
      web3,
      from: accounts[0],
    })

    sf = new SuperfluidSDK.Framework({
      web3,
      version: 'test',
      tokens: ['fDAI'],
    })
    await sf.initialize()
    daix = sf.tokens.fDAIx
    dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address)

    for (var i = 0; i < names.length; i++) {
      u[names[i].toLowerCase()] = sf.user({
        address: accounts[i],
        token: daix.address,
      })
      u[names[i].toLowerCase()].alias = names[i]
      aliases[u[names[i].toLowerCase()].address] = names[i]
    }
    for (const [, user] of Object.entries(u)) {
      if (user.alias === 'App') return
      await web3tx(dai.mint, `${user.alias} mints many dai`)(
        user.address,
        toWad(100000000),
        {
          from: user.address,
        },
      )
      await web3tx(dai.approve, `${user.alias} approves daix`)(
        daix.address,
        toWad(100000000),
        {
          from: user.address,
        },
      )
    }
    //u.zero = { address: ZERO_ADDRESS, alias: "0x0" };
    console.log(u.admin.address)
    console.log(sf.host.address)
    console.log(sf.agreements.cfa.address)
    console.log(daix.address)
    app = await CFACrowdfund.new(sf.host.address)

    u.app = sf.user({ address: app.address, token: daix.address })
    u.app.alias = 'App'
    await checkBalance(u.app)
  })

  async function checkBalance(user) {
    console.log('Balance of ', user.alias)
    console.log('DAIx: ', (await daix.balanceOf(user.address)).toString())
  }

  async function checkBalances(accounts) {
    for (let i = 0; i < accounts.length; ++i) {
      await checkBalance(accounts[i])
    }
  }

  async function upgrade(accounts) {
    for (let i = 0; i < accounts.length; ++i) {
      await web3tx(
        daix.upgrade,
        `${accounts[i].alias} upgrades many DAIx`,
      )(toWad(100000000), { from: accounts[i].address })
      await checkBalance(accounts[i])
    }
  }

  async function logUsers() {
    let string = 'user\t\ttokens\t\tnetflow\n'
    let p = 0
    for (const [, user] of Object.entries(u)) {
      if (await hasFlows(user)) {
        p++
        string += `${user.alias}\t\t${wad4human(
          await daix.balanceOf(user.address),
        )}\t\t${wad4human((await user.details()).cfa.netFlow)}
            `
      }
    }
    if (p == 0) return console.warn('no users with flows')
    console.log('User logs:')
    console.log(string)
  }

  async function hasFlows(user) {
    const { inFlows, outFlows } = (await user.details()).cfa.flows
    return inFlows.length + outFlows.length > 0
  }

  async function appStatus() {
    const isApp = await sf.host.isApp(u.app.address)
    const isJailed = await sf.host.isAppJailed(app.address)
    !isApp && console.error('App is not an App')
    isJailed && console.error('app is Jailed')
    await checkBalance(u.app)
    await checkOwner()
  }
  async function checkOwner() {
    const owner = await app.ownerOf('1')
    console.log('Contract Owner: ', aliases[owner], ' = ', owner)
    return owner.toString()
  }

  describe('sending flows', async function () {
    xit('Case #1 - Alice sends a flow', async () => {
      const { alice } = u
      const appInitialBalance = await daix.balanceOf(app.address)
      await upgrade([alice])
      await checkBalances([alice, u.admin])
      await appStatus()
      await logUsers()
      await alice.flow({ flowRate: toWad(0.001).toString(), recipient: u.app })
      console.log('go forward in time')
      await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME)
      await appStatus()
      await logUsers()

      alice.flow({ recipient: u.app, flowRate: '0' })

      console.log('go forward in time')
      await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME)
      await appStatus()
      await logUsers()
      const appFinalBalance = await daix.balanceOf(app.address)
      assert.equal(
        (await u.app.details()).cfa.netFlow,
        0,
        'App flowRate not zero',
      )
      assert.equal(
        appInitialBalance.toString(),
        appFinalBalance.toString(),
        "balances aren't equal",
      )
    })
  })
})

// Check if the owner can be a payer at the same time
