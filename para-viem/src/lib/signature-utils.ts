/**
 * Signature utilities for Para + Rhinestone integration
 *
 * Para's MPC signatures use 0/1 v-byte recovery
 * Rhinestone/Smart wallets expect 27/28 v-byte recovery
 *
 * These utilities adjust Para signatures for smart wallet compatibility
 */

import { type Hex, type TypedData, type TypedDataDefinition } from "viem";

const V_OFFSET_FOR_ETHEREUM = 27;

/**
 * Create a wrapped viem account with custom signing for Rhinestone compatibility
 */
export function wrapParaAccountForRhinestone(
  viemAccount: any,
  walletId?: string
) {
  // Store the wallet ID for signing operations
  const effectiveWalletId =
    walletId || viemAccount.walletId || (viemAccount as any)._walletId;

  return {
    ...viemAccount,
    // Store wallet ID reference
    _paraWalletId: effectiveWalletId,
    // Override signMessage to adjust v-byte
    signMessage: async ({ message }: { message: string | Uint8Array }) => {
      // Use the original viemAccount's signMessage, then adjust v-byte
      const originalSignature = await viemAccount.signMessage({ message });
      return adjustVByte(originalSignature);
    },
    // Override signTypedData to adjust v-byte
    signTypedData: async <
      const TTypedData extends TypedData | Record<string, unknown>,
      TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
    >(
      typedData: TypedDataDefinition<TTypedData, TPrimaryType>
    ) => {
      // Use the original viemAccount's signTypedData, then adjust v-byte
      const originalSignature = await viemAccount.signTypedData(typedData);
      return adjustVByte(originalSignature);
    },
  };
}

/**
 * Helper function to adjust v-byte in a signature
 */
function adjustVByte(signature: string): Hex {
  const cleanSig = signature.startsWith("0x") ? signature.slice(2) : signature;
  const r = cleanSig.slice(0, 64);
  const s = cleanSig.slice(64, 128);
  let v = parseInt(cleanSig.slice(128, 130), 16);

  if (v < 27) {
    v += V_OFFSET_FOR_ETHEREUM;
  }

  const adjustedSignature = `0x${r}${s}${v
    .toString(16)
    .padStart(2, "0")}` as Hex;

  return adjustedSignature;
}
