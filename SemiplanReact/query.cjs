const { Pool } = require('pg'); 
const pool = new Pool({ user: 'postgres', password: 'postgres', host: 'localhost', database: 'semiplandb', port: 5432 }); 
pool.query('SELECT * FROM "Subjects"', (err, res) => { console.log(err ? err.stack : res.rows); pool.end(); });
