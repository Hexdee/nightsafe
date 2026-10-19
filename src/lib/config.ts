export type AppNetworkId = 'preview' | 'preprod' | 'undeployed';

export const TARGET_NETWORK: AppNetworkId =
  ((import.meta.env.VITE_NIGHTSAFE_NETWORK as AppNetworkId | undefined) ?? 'preprod');

// V2 must be redeployed. Never fall back to the incompatible V1 address.
const configuredAddress = import.meta.env.VITE_NIGHTSAFE_CONTRACT_ADDRESS?.trim() ?? '';
const legacyAddress = '378f3c3f54a3fe0646b72eae1a5577cf20e1c46a4799253633698e2200095290';
export const CONTRACT_ADDRESS = configuredAddress === legacyAddress ? '' : configuredAddress;

export const CONTRACT_PRIVATE_STATE_ID = 'nightsafeV2PrivateState';
export const CONTRACT_ZK_BASE_URL = '/contracts/managed/nightsafe';
export const LOCAL_PROOF_SERVER_URL = 'http://127.0.0.1:6300';
