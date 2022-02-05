// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import {ISuperfluidToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

interface ICFACrowdfund {
    function createFlow(
        ISuperfluidToken token,
        address receiver,
        int96 flowRate
    ) external;

    function deleteFlow(ISuperfluidToken token, address receiver) external;
}
