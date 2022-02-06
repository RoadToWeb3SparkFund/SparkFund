// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import {Ownable} from "../lib/Ownable.sol";
import {Crowdfund} from "./Crowdfund.sol";

contract CrowdfundFactory is Ownable {
    constructor() Ownable(msg.sender) {
        owner = msg.sender;
    }

    function createCrowdfund(
        string memory name,
        string memory symbol,
        address payable operator_,
        address payable fundingRecipient_,
        address cfa_,
        address fDaiToken_,
        address fDaiXToken_,
        uint256 fundingCap_,
        uint256 operatorPercent_,
        uint256 tokenScale_,
        uint256 fixedPercent_
    ) external onlyOwner returns (address) {
        Crowdfund crowdfund = new Crowdfund(
            name,
            symbol,
            operator_,
            fundingRecipient_,
            cfa_,
            fDaiToken_,
            fDaiXToken_,
            fundingCap_,
            operatorPercent_,
            tokenScale_,
            fixedPercent_
        );

        return address(crowdfund);
    }
}
