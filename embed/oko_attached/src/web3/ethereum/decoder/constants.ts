import { parseAbi } from "viem";

export const ZERO_INTERFACE_ID = "0x00000000";
export const ERC165_INTERFACE_ID = "0x01ffc9a7";
export const ERC20_INTERFACE_ID = "0x36372b07";
export const ERC721_INTERFACE_ID = "0x80ac58cd";
export const ERC1155_INTERFACE_ID = "0xd9b67a26";

export const ERC165_ABI = parseAbi([
  "function supportsInterface(bytes4 interfaceId) external view returns (bool)",
]);

export const ERC20_WRITE_FUNCTIONS_ABI = parseAbi([
  "function transfer(address,uint256) returns (bool)",
  "function transferFrom(address,address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",

  // Permit (ERC-2612)
  "function permit(address,address,uint256,uint256,bytes)",
  "function permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",

  // Permit (DAI)
  "function permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)",
]);

export const ERC721_WRITE_FUNCTIONS_ABI = parseAbi([
  "function safeTransferFrom(address,address,uint256)",
  "function safeTransferFrom(address,address,uint256,bytes)",
  "function transferFrom(address,address,uint256)",
  "function setApprovalForAll(address,bool)",
  "function approve(address,uint256)",
]);

export const ERC1155_WRITE_FUNCTIONS_ABI = parseAbi([
  "function safeTransferFrom(address,address,uint256,uint256,bytes)",
  "function safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
  "function setApprovalForAll(address,bool)",
]);

export const COMMON_READ_FUNCTIONS_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]);
