// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import {Governable} from "../lib/Governable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

contract Crowdfund is Governable, ERC20 {
    //======== CFA =========
    using CFAv1Library for CFAv1Library.InitData;

    CFAv1Library.InitData public cfaV1;

    //======== Vars ========
    enum Status {
        FUNDING,
        CLOSED
    }

    address payable public operator;
    address payable public fundingRecipient;
    uint256 public fundingCap;
    uint256 public operatorPercent;
    uint256 public tokenScale;
    uint256 public fixedPercent;
    Status public status;
    IERC20 fDaiToken;
    IERC20 fDaiXToken;

    //======== Events ========
    event Contribution(address contributor, uint256 amount);
    event FundingClosed(uint256 amountRaised, uint256 creatorAllocation);
    event newCrowdfund(address crowdfund);
    event DaiBalance(uint256);

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
        ISuperfluid sfHost_,
        address fDaiToken_,
        address fDaiXToken_,
        uint256 fundingCap_,
        uint256 operatorPercent_,
        uint256 tokenScale_,
        uint256 fixedPercent_
    ) ERC20(name, symbol) Governable(operator_) {
        operator = operator_;
        fundingRecipient = fundingRecipient_;
        fundingCap = fundingCap_;
        operatorPercent = operatorPercent_;
        tokenScale = tokenScale_;
        fixedPercent = fixedPercent_;

        fDaiToken = IERC20(fDaiToken_);
        fDaiXToken = IERC20(fDaiXToken_);

        emit newCrowdfund(address(this));

        cfaV1 = CFAv1Library.InitData(
            sfHost_,
            //here, we are deriving the address of the CFA using the host contract
            IConstantFlowAgreementV1(
                address(
                    sfHost_.getAgreementClass(
                        keccak256(
                            "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                        )
                    )
                )
            )
        );
    }

    // ============ Funding Methods ============
    function fund(uint256 amount) external {
        _fund(amount);
    }

    function valueToTokens(uint256 value) public view returns (uint256 tokens) {
        tokens = value / tokenScale;
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
        uint256 currentBalance = fDaiToken.balanceOf(address(this));

        console.log("currentBalance", currentBalance);

        console.log("fixedPercent", fixedPercent);

        uint256 fixedAmount = (currentBalance / 100) * 20;

        console.log("FixedAmount", fixedAmount);

        uint256 streamingAmount = currentBalance - fixedAmount;

        console.log("Withdrawing", fixedAmount);

        // payable(fundingRecipient).transfer(address(this).balance);
        fDaiToken.approve(fundingRecipient, fixedAmount);
        fDaiToken.transfer(fundingRecipient, fixedAmount);

        fDaiToken.approve(address(fDaiXToken), streamingAmount);
        ISuperToken token = ISuperToken(address(fDaiXToken));
        token.upgrade(streamingAmount);

        int96 flowRate = _calculateFlowRate(streamingAmount);

        cfaV1.createFlow(fundingRecipient, token, flowRate);
    }

    // ============ Internal Methods  ============
    function _fund(uint256 amount) private {
        require(status == Status.FUNDING, "Crowdfund: Funding must be open");
        require(
            amount <= fundingCap,
            "This transaction will go over the funding cap of the project"
        );
        address funder = msg.sender;

        console.log(
            "Sender balance is %s tokens",
            fDaiToken.balanceOf(msg.sender)
        );

        require(fDaiToken.balanceOf(funder) >= amount, "test");
        fDaiToken.transferFrom(funder, address(this), amount);
        _mint(funder, valueToTokens(amount));

        emit Contribution(funder, amount);
    }

    function _calculateFlowRate(uint256 amount) private returns (int96) {
        return int96((amount / 12) / (60 * 60 * 24 * 30));
    }
}
