const auctionContract = artifacts.require('Auction');
const nftContract = artifacts.require('NFT');
const { expect } = require('chai');
const chai = require('chai');
const truffleAssert = require('truffle-assertions');
contract("Auction",async (accounts)=>{
    var [a, b,c] = accounts;
  //  console.log("account ",accounts);
    var _auctionContract;
    var _nftContract;
   
    beforeEach(async () => {
        _auctionContract = await auctionContract.new();
        _nftContract = await nftContract.new();
        await _nftContract.mintNft("testString2");
    });

    it("Should mint a nft ",async function(){
        await _nftContract.mintNft("testString");
        const counter = await _nftContract.tokenCount();
        expect(counter.toNumber()).to.equal(2);
    })

    
    it("Should start bid",async function(){
        var nft = await _nftContract.mintNft("dummy")
        await _nftContract.approve(_auctionContract.address,2)
        await _auctionContract.start(nft.receipt.to,2,25);
        var highestBid = await  _auctionContract.highestBid();
        expect(highestBid.toNumber()).to.equal(25)
        var ownerOfnft = await _nftContract.ownerOf(2);
        expect(ownerOfnft).to.equal(_auctionContract.address);
        await truffleAssert.reverts(_auctionContract.start(nft.receipt.to,2,25),"Already started!");
    })
    it("should bid", async function(){
        await truffleAssert.reverts(_auctionContract.bid(),"Not started.");
        var nft = await _nftContract.mintNft("dummy")
        await _nftContract.approve(_auctionContract.address,2)
        await _auctionContract.start(nft.receipt.to,2,25);
        await _auctionContract.bid({ from: b, value: web3.utils.toWei('10', 'ether') });
        expect(await _auctionContract.highestBidder()).to.equal(b)
    })
    it("shoud withdraw", async function(){
        var nft = await _nftContract.mintNft("dummy")
        await _nftContract.approve(_auctionContract.address,2)
        await _auctionContract.start(nft.receipt.to,2,25);
        await _auctionContract.bid({ from: c, value: web3.utils.toWei('10', 'ether') });
        await _auctionContract.withdraw({from:c});
        let balanceAfter = await web3.eth.getBalance(_auctionContract.address);
        expect(balanceAfter).to.equal(0);
        expect(await _auctionContract.highestBidder()).to.equal(c)
    })

    it("should end",async function(){
        await truffleAssert.reverts(_auctionContract.end(),"You need to start first!");
    })

})