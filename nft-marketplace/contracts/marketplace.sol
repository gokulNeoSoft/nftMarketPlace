pragma solidity 0.8.16;

interface IERC721 {
    function transfer(address, uint) external;

    function transferFrom(
        address,
        address,
        uint
    ) external;
}

contract Auction {
    address payable public seller;
    bool public started;
    bool public ended;
    uint public endAt;
    IERC721 public nft;
    uint public nftId;
    uint public highestBid;
    address public highestBidder;
    mapping(address => uint) public bids;

    constructor () {
        seller = payable(msg.sender);
    }

    function start(IERC721 _nft, uint _nftId, uint startingBid) external {
        require(!started, "Already started!");
        require(msg.sender == seller, "You did not start the auction!");
        highestBid = startingBid;
        nft = _nft;
        nftId = _nftId;
        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        endAt = block.timestamp + 1 days;
    }

    function bid() external payable {
        require(started, "Not started.");
        require(block.timestamp < endAt, "Ended!");
        require(msg.value > highestBid);
        highestBid = msg.value;
        highestBidder = msg.sender;
        bids[highestBidder] += highestBid;

    }

    function withdraw() external payable {
        uint bal = bids[msg.sender];
        bids[msg.sender] = 0;
        bool sent =  payable(address (msg.sender)).send(bal);
        require(sent, "Failed to send Ether");

    }

    function end() external {
        require(started, "You need to start first!");
        require(block.timestamp >= endAt, "Auction is still ongoing!");
        require(!ended, "Auction already ended!");

        if (highestBidder != address(0)) {
            nft.transfer(highestBidder, nftId);
            (bool sent, bytes memory data) = seller.call{value: highestBid}("");
            require(sent, "Could not pay seller!");
        } else {
            nft.transfer(seller, nftId);
        }

        ended = true;
    }
   function endNow() external {
        require(started, "You need to start first!");
        require(msg.sender == seller, "You did not start the auction!");
        require(!ended, "Auction already ended!");

        if (highestBidder != address(0)) {
            nft.transfer(highestBidder, nftId);
            (bool sent, bytes memory data) = seller.call{value: highestBid}("");
            require(sent, "Could not pay seller!");
        } else {
            nft.transfer(seller, nftId);
        }

        ended = true;
    }
  
}
