// require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-truffle5')
require('hardhat-deploy')
require('@nomiclabs/hardhat-ethers')

require('dotenv').config()

let secret = require("./secret");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

const defaultNetwork = 'ganache'
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // defaultNetwork,

  solidity: {
    version: '0.7.4',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },

  networks: {
    hardhat: {
    },
    mumbai: {
      networkId: 80001,
      url: secret.value, // url given by moralis for mumbai network
      accounts: [secret.key] // private key for a test acc on mumbai network
    }
  },

  // networks: {
  //   ganache: {
  //     url: "http://127.0.0.1",
  //     network_id: "*",
  //     port: 8545,
  // },
  // rinkeby: {
  //   url: `${process.env.RINKEBY_ALCHEMY_URL}`,
  //   gasPrice:  1500000000,
  //   accounts: [`0x${process.env.RINKEBY_DEPLOYER_PRIVATE_KEY}`]
  //   },
  // },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
}
