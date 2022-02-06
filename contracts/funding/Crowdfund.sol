// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import {Governable} from "../lib/Governable.sol";
import {DaiToken} from "../interfaces/DaiToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ICFACrowdfund} from "../interfaces/ICFACrowdfund.sol";

import {
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

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
    uint256 public fixedPercent;
    Status public status;
    DaiToken fdaitoken;
    DaiToken fdaitokenx;


    //======== Interfaces ====
    ICFACrowdfund public cfa;

    //======== Events ========
    event Contribution(address contributor, uint256 amount);
    event FundingClosed(uint256 amountRaised, uint256 creatorAllocation);
    event newCrowdfund(address crowdfund);
    event DaiBalance(uint);

    // ============ Modifiers ============
    modifier onlyOperator() {
        require(msg.sender == operator);
        _;
    }

    //======== Constructor =========
    constructor(
        string memory name,
        string memory symbol,
        address payable operator_,
        address payable fundingRecipient_,
        address cfa_,
        uint256 fundingCap_,
        uint256 operatorPercent_,
        uint16 tokenScale_,
        uint256 fixedPercent_
    ) ERC20(name, symbol) Governable(operator_) {
        operator = operator_;
        fundingRecipient = fundingRecipient_;
        cfa = ICFACrowdfund(cfa_);
        fundingCap = fundingCap_;
        operatorPercent = operatorPercent_;
        tokenScale = tokenScale_;
        fixedPercent = fixedPercent_;

        fdaitoken = DaiToken(0x59b670e9fA9D0A427751Af201D676719a970857b); 
        fdaitokenx = DaiToken(0x1f65B7b9b3ADB4354fF76fD0582bB6b0d046a41c); 

        emit newCrowdfund(address(this));
    }

    // ============ Funding Methods ============
    function fund() external payable {
        uint256 amount = msg.value / 10**18;

        // send dai from user wallet to us
        // emit DaiBalance(fdaitoken.balanceOf(msg.sender));
        // fdaitoken.transferFrom(msg.sender, address(this), amount);

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

        withdraw();
    }

    function changeFundingRecipient(address payable newFundingRecipient)
        public
        onlyOperator
    {
        fundingRecipient = newFundingRecipient;
    }

    function withdraw() public {
        uint256 fixedAmount = address(this).balance / (100 - fixedPercent); 
        uint256 streamingAmount = address(this).balance - fixedAmount; 

        // payable(fundingRecipient).transfer(address(this).balance);
        payable(fundingRecipient).transfer(fixedAmount);

        // ideal flow
        ERC20(address(fdaitoken)).approve(address(fdaitokenx), streamingAmount); 
        // cfa.createFlow(ISuperToken(address(fdaitokenx)).upgrade(streamingAmount), fundingRecipient, 1);


        // ERC20(0x59b670e9fA9D0A427751Af201D676719a970857b)
            // .approve(0x1f65B7b9b3ADB4354fF76fD0582bB6b0d046a41c, 1); 
        // ISuperToken(0x1f65B7b9b3ADB4354fF76fD0582bB6b0d046a41c).upgrade(1);

    }

    // ============ Internal Methods  ============
    function _fund(uint256 amount) private {
        require(status == Status.FUNDING, "Crowdfund: Funding must be open");

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
