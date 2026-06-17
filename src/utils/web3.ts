/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Ritual Testnet parameters from the uploaded specification
export const RITUAL_CHAIN_ID = 1979; // Decimal
export const RITUAL_CHAIN_HEX = "0x7BB"; // Hex for 1979
export const RITUAL_RPC_HTTP = "https://rpc.ritualfoundation.org";
export const RITUAL_RPC_WS = "wss://rpc.ritualfoundation.org/ws";
export const RITUAL_EXPLORER = "https://explorer.ritualfoundation.org";

// System Contract Addresses reported in the Ritual specification
export const RITUAL_CONTRACTS = {
  RITUALWALLET: "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948",
  ASYNCJOBTRACKER: "0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5",
  TEESERVICEREGISTRY: "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F",
  SCHEDULER: "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B",
  SECRETSACL: "0xf9BF1BC8A3e79B9EBeD0fa2Db70D0513fecE32FD",
  ASYNCDELIVERY: "0x5A16214fF555848411544b005f7Ac063742f39F6"
};

export type WalletType = 'metamask';

export interface Web3WalletState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  address: string | null;
  walletType: WalletType | null;
  chainId: number | null;
  balance: string; // Balance in RITUAL tokens
  errorMessage: string | null;
  txHash: string | null;
  txStatus: 'none' | 'sending' | 'confirmed' | 'failed';
}

/**
 * Encodes string data into EVM hex calldata for onchain registration
 */
export function encodeVictoryCalldata(winnerName: string, moves: number, durationSeconds: number): string {
  // Simple custom signature for RegisterLudoVictory(string,uint32,uint32)
  // Method selector: 0xcdd6df10
  const selector = "cdd6df10";
  
  // Custom hex conversion helper
  const stringToHex = (str: string) => {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
  };

  // ABI Encoding: RegisterLudoVictory(string,uint32,uint32)
  // Slot 0: Offset pointing to dynamic string content location of 256-bit slot index 3 (96 bytes = 0x60)
  const offsetHex = (96).toString(16).padStart(64, '0');
  
  // Slot 1: Static Parameter (moves) padded to 256-bit hash boundary
  const movesHex = moves.toString(16).padStart(64, '0');
  
  // Slot 2: Static Parameter (durationSeconds) padded to 256-bit hash boundary
  const durationHex = durationSeconds.toString(16).padStart(64, '0');
  
  // Slot 3: Dynamic Parameter (string length) padded to 256-bit hash boundary
  const stringBytesHex = stringToHex(winnerName);
  const nameLenHex = (winnerName.length).toString(16).padStart(64, '0');
  
  // Slot 4 onwards: Dynamic Parameter (string content) padded to next 32-byte boundary
  const padLength = Math.ceil(stringBytesHex.length / 64) * 64 || 64;
  const nameContentHex = stringBytesHex.padEnd(padLength, '0');

  return `0x${selector}${offsetHex}${movesHex}${durationHex}${nameLenHex}${nameContentHex}`;
}

/**
 * Checks for provider presence
 */
export function hasMetaMask(): boolean {
  if (typeof window === 'undefined') return false;
  const anyWindow = window as any;
  return !!(anyWindow.ethereum && anyWindow.ethereum.isMetaMask);
}

export function hasOKXWallet(): boolean {
  if (typeof window === 'undefined') return false;
  const anyWindow = window as any;
  return !!(anyWindow.okxwallet || (anyWindow.ethereum && anyWindow.ethereum.isOkxWallet));
}

export interface RitualTransaction {
  hash: string;
  timestamp: number;
  winner: string;
  gasSpent: string;
  walletAddress: string;
  moves: number;
  duration: number;
}

export function getRitualTransactions(address: string): RitualTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`ritual_tx_history_${address.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse transactions", e);
    return [];
  }
}

export function saveRitualTransaction(address: string, tx: Omit<RitualTransaction, 'walletAddress'>): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `ritual_tx_history_${address.toLowerCase()}`;
    const txs = getRitualTransactions(address);
    const newTx: RitualTransaction = { ...tx, walletAddress: address.toLowerCase() };
    const updated = [newTx, ...txs];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save transaction", e);
  }
}
