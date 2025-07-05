// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DepositContract {
    IERC20 public constant USDC = IERC20(0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238);
    address public constant RECIPIENT_ADDRESS = 0x5e3aCEe942a432e114F01DCcCD06c904a859eDB1;
    
    event Deposited(address indexed sender, uint256 amount, uint256 groupId);
    
    function deposit(uint256 amount, uint256 groupId) external {
        require(amount > 0, "Amount must be greater than 0");
        require(USDC.transferFrom(msg.sender, RECIPIENT_ADDRESS, amount), "USDC transfer failed");
        emit Deposited(msg.sender, amount, groupId);
    }
}