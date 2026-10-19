import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveNetwork } from '../src/network';

test('retired preprod endpoints are replaced and access fails clearly without a project token', () => {
  assert.throws(() => resolveNetwork({ argv: ['node', 'script', '--network', 'preprod'], env: {} }), /Blockfrost/);
});
test('all preprod transports use the network-specific token', () => {
  const { config } = resolveNetwork({ argv: ['node', 'script', '--network', 'preprod'], env: { BLOCKFROST_PROJECT_ID: 'nightpreprod_UNIT_TEST_ONLY' } });
  for (const url of [config.indexer, config.indexerWS, config.node]) {
    assert.equal(new URL(url).searchParams.get('project_id'), 'nightpreprod_UNIT_TEST_ONLY');
    assert.ok(new URL(url).hostname.endsWith('blockfrost.io'));
  }
});
test('self-hosted preprod configuration needs no Blockfrost token', () => {
  const env = { MIDNIGHT_INDEXER_URL: 'http://localhost:8088/api/v4/graphql', MIDNIGHT_INDEXER_WS_URL: 'ws://localhost:8088/api/v4/graphql/ws', MIDNIGHT_NODE_URL: 'ws://localhost:9944' };
  assert.equal(resolveNetwork({ argv: ['node', 'script', '--network', 'preprod'], env }).config.node, env.MIDNIGHT_NODE_URL);
});
