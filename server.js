const express = require('express');
const db = require('./jumbo-db');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const ALLOWED_IP = "192.168.88.125"; // înlocuiește cu IP-ul dorit

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
    if (ip === ALLOWED_IP || ip === "::1" || ip === "127.0.0.1") { // "::1" și "127.0.0.1" pentru localhost
        next();
    } else {
        res.status(403).send("Access denied");
    }
});

app.get('/api/attendance', (req, res) => {
    db.all(`
        SELECT a.nume, p.data, p.ora_sosire, p.ora_plecare
        FROM prezenta p
        JOIN angajati a ON a.id = p.id_angajat
    `, [], (err, rows) => {
        if (err) return res.json([]);
        res.json(rows);
    });
});

app.post('/api/save', (req, res) => {
    const { employee, day, sosire, plecare, luna } = req.body;
    if (!employee || !day || !luna) return res.json({ status: 'error', message: 'Date lipsă' });

    db.get('SELECT id FROM angajati WHERE nume = ?', [employee], (err, row) => {
        if (err || !row) return res.json({ status: 'error', message: 'Angajat inexistent' });
        const id_angajat = row.id;
        const data = `2025-${luna}-${String(day).padStart(2, '0')}`;
        db.run(
            `INSERT INTO prezenta (id_angajat, data, ora_sosire, ora_plecare)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id_angajat, data) DO UPDATE SET ora_sosire=excluded.ora_sosire, ora_plecare=excluded.ora_plecare`,
            [id_angajat, data, sosire, plecare],
            function (err) {
                if (err) return res.json({ status: 'error', message: err.message });
                res.json({ status: 'success' });
            }
        );
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));