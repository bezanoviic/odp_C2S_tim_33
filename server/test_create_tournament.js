const http = require('http');
const jwt = require('jsonwebtoken');
const secret = 'project__is_a_great_one_i_guess';
const token = jwt.sign({ id: 1, gamer_tag: 'admin', role: 'admin' }, secret);
const body = JSON.stringify({
  name: 'Test Tournament',
  game_id: 1,
  format: 'single_elimination',
  max_teams: 8,
  prize_pool: 100.0,
  registration_deadline: '2026-06-01T12:00',
  start_date: '2026-06-10T12:00',
});
const options = {
  host: 'localhost',
  port: 4000,
  path: '/api/v1/tournaments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Authorization': `Bearer ${token}`,
  },
};
const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => console.log(data));
});
req.on('error', console.error);
req.write(body);
req.end();
