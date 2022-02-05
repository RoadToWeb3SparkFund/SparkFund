// SPDX-License-Identifier: GPL-3.0-or-later
// pragma solidity 0.8.11;
pragma solidity ^0.7.6;

import {Ownable} from "./Ownable.sol";


contract Governable is Ownable {
    address public governor;


    modifier onlyGovernance() {
        require(isOwner() || isGovernor(), "caller is not governance");
        _;
    }

    modifier onlyGovernor() {
        require(isGovernor(), "caller is not governor");
        _;
    }

    constructor(address owner_) Ownable(owner_) {}

    function changeGovernor(address governor_) public onlyGovernance {
        governor = governor_;
    }

    function isGovernor() public view returns (bool) {
        return msg.sender == governor;
    }
}