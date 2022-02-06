// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.0;

interface DaiToken {
  function transfer(address dst, uint wad) external returns (bool);
  function transferFrom(address src, address dst, uint wad) external returns (bool);
  function balanceOf(address guy) external view returns (uint);
}