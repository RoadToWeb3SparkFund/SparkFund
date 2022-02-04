// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.11;

import {Governable} from "../lib/Governable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Crowdfund is Governable, ERC20 {

    //======== Vars ========
    enum Status {
        FUNDING,
        CLOSED
    }

    uint16 public tokenScale;
    address payable public operator;
    address payable public fundingRecipient;
    uint256 public fundingCap;
    uint256 public operatorPercent;
    Status public status;

    //======== Events ========
    event Contribution(address contributor, uint256 amount);
    event FundingClosed(uint256 amountRaised, uint256 creatorAllocation);

    // ============ Modifiers ============
    modifier onlyOperator() {
        require(msg.sender == operator);
        _;
    }

    //======== Constructor =========
    constructor(
        string memory name,
        string memory symbol,
        uint256 fundingCap_,
        uint256 operatorPercent_,
        uint16 tokenScale_
    ) ERC20(name, symbol) Governable(msg.sender){
        fundingCap = fundingCap_;
        operatorPercent = operatorPercent_;
        tokenScale = tokenScale_;
    }
    
    // ============ Setup Methods ==============
    function setFundingRecipient(address payable _fundingRecipient) external onlyOwner {
        fundingRecipient = _fundingRecipient;
    }

    function setOperator(address payable _operator) external onlyOwner {
        operator = _operator;
        changeGovernor(operator);
    }

    // ============ Funding Methods ============
    function fund(uint256 amount)
        external
        payable
    {
        _fund(amount);
    }

    function valueToTokens(uint256 value) public view returns (uint256 tokens) {
        tokens = value * tokenScale;
    }

    // ============ Operator Methods ============
    function closeFunding() external onlyOperator {
        require(status == Status.FUNDING, "Crowdfund: Funding must be open");
        status = Status.CLOSED;

        // Mint the operator a percent of the total supply.
        uint256 operatorTokens = (operatorPercent * totalSupply()) /
            (100 - operatorPercent);
        _mint(operator, operatorTokens);

        emit FundingClosed(address(this).balance, operatorTokens);

        payable(fundingRecipient).transfer(address(this).balance);
    }

    function changeFundingRecipient(address payable newFundingRecipient)
        public
        onlyOperator
    {
        fundingRecipient = newFundingRecipient;
    }

    function withdraw() public {
       payable(fundingRecipient).transfer(address(this).balance);
    }


    // ============ Internal Methods  ============
    function _fund(uint256 amount) private {
        require(status == Status.FUNDING, "Crowdfund: Funding must be open");
        require(amount == msg.value, "Crowdfund: Amount is not value sent");

        address funder = msg.sender;

        if (address(this).balance <= fundingCap) {
            _mint(funder, valueToTokens(amount));

            emit Contribution(funder, amount);
        } else {
            uint256 startAmount = address(this).balance - amount;
            require(
                startAmount < fundingCap,
                "Crowdfund: Funding cap already reached"
            );
           uint256 eligibleAmount = fundingCap - startAmount;
             _mint(funder, valueToTokens(eligibleAmount));

            emit Contribution(funder, eligibleAmount);
            payable(funder).transfer(address(this).balance);
        }
    }

}