import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

export function walletLabel(api: { name: string; rdns: string }) {
  return `${api.name} (${api.rdns})`;
}

export function selectWalletId(wallets: Array<[string, { name: string; rdns: string }]>) {
  const lace = wallets.find(([, api]) => /lace/i.test(api.name) || /lace/i.test(api.rdns));
  return lace?.[0] ?? wallets[0]?.[0] ?? null;
}

export function isWalletLikelyLace(api: { name: string; rdns: string }) {
  return /lace/i.test(api.name) || /lace/i.test(api.rdns);
}

export type WalletApi = InitialAPI;
