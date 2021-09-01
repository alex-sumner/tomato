require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
const { ALCHEMY_RINKEBY_URL, RINKEBY_PRIVATE_KEY_1, RINKEBY_PRIVATE_KEY_2, RINKEBY_PRIVATE_KEY_3} = process.env;
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: "0.8.0",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        rinkeby: {
            url: ALCHEMY_RINKEBY_URL,
            accounts: [`0x${RINKEBY_PRIVATE_KEY_1}`, `0x${RINKEBY_PRIVATE_KEY_2}`, `0x${RINKEBY_PRIVATE_KEY_3}`],
        },
  },
};
