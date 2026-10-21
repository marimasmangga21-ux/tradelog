const http = require('http');

async function sendRequest(payload, secret) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      'http://localhost:3000/api/mt5/ingest',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tradelog-Secret': secret,
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Unauthorized Request ---');
  const resBadAuth = await sendRequest({ account_number: 9999, trades: [] }, 'wrong-secret');
  console.log('Bad Auth Status:', resBadAuth.status, 'Response:', resBadAuth.body);
  if (resBadAuth.status !== 401) throw new Error('Expected 401 Unauthorized');

  console.log('\n--- 2. Testing Ingest New MT5 Trades ---');
  const mockPayload = {
    account_number: 888201,
    broker_server: 'ICMarketsSC-Live',
    account_name: 'Mita MT5 IC Markets',
    balance: 5000,
    equity: 5143,
    currency: 'USD',
    trades: [
      {
        position_id: 1049281,
        deal_in: 550101,
        deal_out: 550202,
        symbol: 'XAUUSD.raw',
        type: 'BUY',
        lots: 0.5,
        open_price: 2715.5,
        close_price: 2718.5,
        open_time: '2026-10-18T14:30:00.000Z',
        close_time: '2026-10-18T15:45:00.000Z',
        profit: 150.0,
        commission: -5.0,
        swap: -2.0,
        status: 'CLOSED',
      },
    ],
  };

  const res1 = await sendRequest(mockPayload, 'tradelog-mt5-secret-key');
  console.log('Ingest Status:', res1.status, 'Response:', res1.body);
  if (res1.body.imported !== 1) throw new Error('Expected 1 imported trade');

  console.log('\n--- 3. Testing Idempotent Re-sync (Deduplication) ---');
  const res2 = await sendRequest(mockPayload, 'tradelog-mt5-secret-key');
  console.log('Re-sync Status:', res2.status, 'Response:', res2.body);
  if (res2.body.imported !== 0 || res2.body.updated !== 1) {
    throw new Error('Deduplication failed! Expected 0 imported and 1 updated');
  }

  console.log('\n✅ ALL INTEGRATION TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
