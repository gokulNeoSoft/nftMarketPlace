var MyContract = artifacts.require("NFT");
var MyContract2 = artifacts.require("MarketPlace")

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract);
  deployer.deploy(MyContract2);
};