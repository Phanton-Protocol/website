// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IDiamondCut} from "../interfaces/IDiamondCut.sol";

/**
 * @dev Core diamond storage + cut logic (minimal).
 * Based on Nick Mudge reference implementation, simplified.
 */
library LibDiamond {
    bytes32 internal constant DIAMOND_STORAGE_POSITION =
        keccak256("phantomprotocol.diamond.storage");

    struct FacetAddressAndPosition {
        address facetAddress;
        uint96 functionSelectorPosition; // position in selectors array
    }

    struct FacetFunctionSelectors {
        bytes4[] functionSelectors;
        uint256 facetAddressPosition; // position in facetAddresses array
    }

    struct DiamondStorage {
        // selector => facet + position
        mapping(bytes4 => FacetAddressAndPosition) selectorToFacetAndPosition;
        // facet => selectors + position
        mapping(address => FacetFunctionSelectors) facetFunctionSelectors;
        // facet addresses
        address[] facetAddresses;
        // ERC-173 owner
        address contractOwner;
        // supported interfaces (ERC-165)
        mapping(bytes4 => bool) supportedInterfaces;
    }

    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    // ========= Ownership =========
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        address previousOwner = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    function contractOwner() internal view returns (address) {
        return diamondStorage().contractOwner;
    }

    function enforceIsContractOwner() internal view {
        require(msg.sender == diamondStorage().contractOwner, "Diamond: must be contract owner");
    }

    // ========= Diamond Cut =========
    function diamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) internal {
        for (uint256 facetIndex = 0; facetIndex < _diamondCut.length; facetIndex++) {
            IDiamondCut.FacetCutAction action = _diamondCut[facetIndex].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                addFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                replaceFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                removeFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else {
                revert("Diamond: incorrect FacetCutAction");
            }
        }
        emit IDiamondCut.DiamondCut(_diamondCut, _init, _calldata);
        initializeDiamondCut(_init, _calldata);
    }

    function addFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        require(_functionSelectors.length > 0, "Diamond: no selectors");
        DiamondStorage storage ds = diamondStorage();
        require(_facetAddress != address(0), "Diamond: add facet can't be address(0)");

        uint256 selectorPosition = ds.facetFunctionSelectors[_facetAddress].functionSelectors.length;
        if (selectorPosition == 0) {
            addFacet(ds, _facetAddress);
        }

        for (uint256 selectorIndex = 0; selectorIndex < _functionSelectors.length; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            require(ds.selectorToFacetAndPosition[selector].facetAddress == address(0), "Diamond: selector exists");
            addFunction(ds, selector, selectorPosition, _facetAddress);
            selectorPosition++;
        }
    }

    function replaceFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        require(_functionSelectors.length > 0, "Diamond: no selectors");
        DiamondStorage storage ds = diamondStorage();
        require(_facetAddress != address(0), "Diamond: replace facet can't be address(0)");

        uint256 selectorPosition = ds.facetFunctionSelectors[_facetAddress].functionSelectors.length;
        if (selectorPosition == 0) {
            addFacet(ds, _facetAddress);
        }

        for (uint256 selectorIndex = 0; selectorIndex < _functionSelectors.length; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            require(oldFacetAddress != _facetAddress, "Diamond: replace same facet");
            removeFunction(ds, oldFacetAddress, selector);
            addFunction(ds, selector, selectorPosition, _facetAddress);
            selectorPosition++;
        }
    }

    function removeFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        require(_functionSelectors.length > 0, "Diamond: no selectors");
        DiamondStorage storage ds = diamondStorage();
        require(_facetAddress == address(0), "Diamond: remove facet address must be address(0)");
        for (uint256 selectorIndex = 0; selectorIndex < _functionSelectors.length; selectorIndex++) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            removeFunction(ds, oldFacetAddress, selector);
        }
    }

    function addFacet(DiamondStorage storage ds, address _facetAddress) private {
        enforceHasContractCode(_facetAddress, "Diamond: facet has no code");
        ds.facetFunctionSelectors[_facetAddress].facetAddressPosition = ds.facetAddresses.length;
        ds.facetAddresses.push(_facetAddress);
    }

    function addFunction(
        DiamondStorage storage ds,
        bytes4 _selector,
        uint256 _selectorPosition,
        address _facetAddress
    ) private {
        ds.selectorToFacetAndPosition[_selector] = FacetAddressAndPosition(_facetAddress, uint96(_selectorPosition));
        ds.facetFunctionSelectors[_facetAddress].functionSelectors.push(_selector);
    }

    function removeFunction(DiamondStorage storage ds, address _facetAddress, bytes4 _selector) private {
        require(_facetAddress != address(0), "Diamond: selector doesn't exist");
        require(_facetAddress != address(this), "Diamond: can't remove immutable fn");

        // swap and pop selector
        uint256 selectorPosition = ds.selectorToFacetAndPosition[_selector].functionSelectorPosition;
        uint256 lastSelectorPosition = ds.facetFunctionSelectors[_facetAddress].functionSelectors.length - 1;
        if (selectorPosition != lastSelectorPosition) {
            bytes4 lastSelector = ds.facetFunctionSelectors[_facetAddress].functionSelectors[lastSelectorPosition];
            ds.facetFunctionSelectors[_facetAddress].functionSelectors[selectorPosition] = lastSelector;
            ds.selectorToFacetAndPosition[lastSelector].functionSelectorPosition = uint96(selectorPosition);
        }
        ds.facetFunctionSelectors[_facetAddress].functionSelectors.pop();
        delete ds.selectorToFacetAndPosition[_selector];

        // remove facet address if no selectors left
        if (ds.facetFunctionSelectors[_facetAddress].functionSelectors.length == 0) {
            uint256 lastFacetAddressPosition = ds.facetAddresses.length - 1;
            uint256 facetAddressPosition = ds.facetFunctionSelectors[_facetAddress].facetAddressPosition;
            if (facetAddressPosition != lastFacetAddressPosition) {
                address lastFacetAddress = ds.facetAddresses[lastFacetAddressPosition];
                ds.facetAddresses[facetAddressPosition] = lastFacetAddress;
                ds.facetFunctionSelectors[lastFacetAddress].facetAddressPosition = facetAddressPosition;
            }
            ds.facetAddresses.pop();
            delete ds.facetFunctionSelectors[_facetAddress].facetAddressPosition;
        }
    }

    function initializeDiamondCut(address _init, bytes memory _calldata) private {
        if (_init == address(0)) {
            require(_calldata.length == 0, "Diamond: init is address(0) but calldata not empty");
            return;
        }
        enforceHasContractCode(_init, "Diamond: init has no code");
        (bool success, bytes memory error) = _init.delegatecall(_calldata);
        if (!success) {
            if (error.length > 0) {
                assembly {
                    revert(add(error, 32), mload(error))
                }
            } else {
                revert("Diamond: init function reverted");
            }
        }
    }

    function enforceHasContractCode(address _contract, string memory _errorMessage) private view {
        uint256 contractSize;
        assembly {
            contractSize := extcodesize(_contract)
        }
        require(contractSize > 0, _errorMessage);
    }
}

