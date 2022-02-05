// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import {ISuperfluid, ISuperfluidToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

contract CFACrowdfund {
    using CFAv1Library for CFAv1Library.InitData;

    CFAv1Library.InitData public cfaV1;

    constructor(ISuperfluid host) {
        cfaV1 = CFAv1Library.InitData(
            host,
            //here, we are deriving the address of the CFA using the host contract
            IConstantFlowAgreementV1(
                address(
                    host.getAgreementClass(
                        keccak256(
                            "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                        )
                    )
                )
            )
        );
    }

    function createFlow(
        ISuperfluidToken token,
        address receiver,
        int96 flowRate
    ) public {
        cfaV1.createFlow(receiver, token, flowRate);
    }

    function deleteFlow(ISuperfluidToken token, address receiver) public {
        cfaV1.deleteFlow(address(this), receiver, token);
    }
}
