// SPDX-License-Identifier: GPL-3.0-or-later
// pragma solidity 0.8.11;
pragma solidity ^0.7.6;

import {Governable} from "../lib/Governable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    ISuperfluid,
    ISuperToken,
    SuperAppBase,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    CFAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

contract Crowdfund is Governable, ERC20, SuperAppBase {

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

    // ======== Stuff from Superfluid
    using CFAv1Library for CFAv1Library.InitData;
    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;
    ISuperfluid internal host;
    // IConstantFlowAgreementV1 internal cfa;
    ISuperToken internal acceptedToken;


    //======== Constructor =========
    constructor(
        string memory name,
        string memory symbol,
        uint256 fundingCap_,
        uint256 operatorPercent_,
        uint16 tokenScale_
        ISuperfluid host
    ) ERC20(name, symbol) Governable(msg.sender){
        fundingCap = fundingCap_;
        operatorPercent = operatorPercent_;
        tokenScale = tokenScale_;

        //initialize InitData struct, and set equal to cfaV1
        cfaV1 = CFAv1Library.InitData(
            host,
            //here, we are deriving the address of the CFA using the host contract
            IConstantFlowAgreementV1(
                address(host.getAgreementClass(
                    keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                ))
            )
        );
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
    function fund()
        external
        payable
    {
        uint256 amount = msg.value / 10 ** 18;
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


    // ============= Some Superfluid Code: https://github.com/superfluid-finance/protocol-monorepo/blob/dev/packages/ethereum-contracts/contracts/mocks/CFALibraryMock.sol  ===============
    // I think we have to wrap the token and send it here, not sure how to
    // create the wrapped token in the contract itself
    function createFlow(
        ISuperfluidToken token,
        address receiver,
        int96 flowRate
    ) public {
        cfaV1.createFlow(receiver, token, flowRate);
    }

    function updateFlow(
        ISuperfluidToken token,
        address receiver,
        int96 flowRate
    ) public {
        cfaV1.updateFlow(receiver, token, flowRate);
    }

    function deleteFlow(ISuperfluidToken token, address receiver) public {
        cfaV1.deleteFlow(address(this), receiver, token);
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