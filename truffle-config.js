const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');

//Put your mnemonic here, take care of this and don't deploy your mnemonic into production!
// const mnemonic = 'A_MNEMONIC';

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

if (!mnemonic || mnemonic.split(' ').length !== 12) {
  throw new Error('Unable to retreive mnemonic from .secret')
}


// Get gas prices
const gasPriceTestnetRaw = fs.readFileSync(".gas-price-testnet.json").toString().trim();
const gasPriceTestnet = parseInt(JSON.parse(gasPriceTestnetRaw).result, 16);

if (typeof gasPriceTestnet !== 'number' || isNaN(gasPriceTestnet)) {
  throw new Error('Unable to retrieve network gas price from .gas-price-testnet.json');
}

console.log("Gas price Testnet: " + gasPriceTestnet);


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, 'https://public-node.rsk.co', 0, 1, true, "m/44'/137'/0'/0/"),
      network_id: 30,
      gasPrice: 0x387EE40
    },    
    testnet: {
      provider: () => new HDWalletProvider(mnemonic, 'https://public-node.testnet.rsk.co', 0, 1, true, "m/44'/37310'/0'/0/"),
      network_id: 31,
      gasPrice: Math.floor(gasPriceTestnet * 1.1),
      networkCheckTimeout: 1e9
    }
  },
  compilers: {
    solc: {
      version: "0.5.16"
    }
  }
};