export type AppNetworkId = 'preview' | 'preprod';

export const TARGET_NETWORK: AppNetworkId =
  ((import.meta.env.VITE_NIGHTSAFE_NETWORK as AppNetworkId | undefined) ?? 'preprod');

export const CONTRACT_ADDRESS = import.meta.env.VITE_NIGHTSAFE_CONTRACT_ADDRESS ?? '';

export const CONTRACT_PRIVATE_STATE_ID = 'nightsafePrivateState';
export const CONTRACT_INITIAL_PRIVATE_LIMIT = 2n;
export const CONTRACT_ZK_BASE_URL = '/contracts/managed/nightsafe';
export const LOCAL_PROOF_SERVER_URL = 'http://127.0.0.1:6300';
export const PRIVATE_STATE_PASSWORD = 'NightSafe-Local-Private-State-Password-2026';
