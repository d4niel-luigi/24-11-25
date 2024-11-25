import express from "express";
import cors from 'cors';
import mysql from 'mysql2';

const app = express();

app.use(cors())

app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'autok'
}).promise();


app.get('/autok', async (req, res) => {
    try{
        const temp = await db.query('SELECT * FROM autok');
        const rows = temp[0];
        const fields = temp[1];
        res.status(200).json(rows) ;
    } catch (error) {
        console.error(`Error retrieving cars ${error}`);
        res.status(500).json({error: "Internal server error"});
    }
})

app.get('/autok/:autoId', async (req, res) => {
    try {
        let autoId = parseInt(req.params.autoId);
        const [rows, fields] = await db.query('SELECT id, marka, modell, evjarat, uzemanyag, teljesitmeny_le, ar_eur FROM autok WHERE id =?', [autoId]);
        if (rows.length == 1){
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({error: 'There is no cars with this id.'});
        }
    } catch (error) {
        console.error(`Error retrieving cars ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post('/autok', async (req, res) => {
    try {
        let carsData = [
            req.body.marka,
            req.body.modell,
            req.body.evjarat,
            req.body.uzemanyag,
            req.body.teljesitmeny_le,
            req.body.ar_eur,
        ];

        if (!carsData[0] || carsData[0].length < 1) {
            return res.status(400).json({ error: "A márka legalább 1 betű hosszú kell legyen" });
        }
        if (!carsData[1] || carsData[1].length < 1) {
            return res.status(400).json({ error: "A modell legalább 1 betű hosszú kell legyen" });
        }
        if (isNaN(carsData[2]) || parseInt(carsData[2]) <= 1929 || parseInt(carsData[2]) >= 2025) {
            return res.status(400).json({ error: "A jármű fiatalabb kell legyen mint 1929 és idősebb mint 2025" });
        }
        if (!carsData[3] || carsData[3] != "Benzin" || carsData[3] != "Dízel" || carsData[3] != "Elektromos" || carsData[3] != "Hibrid" || carsData[3] != "dízel" || carsData[3] != "elektromos" || carsData[3] != "hibrid" || carsData[3] != "benzin") {
            return res.status(400).json({ error: "A jármű üzemanyaga csak benzin, dízel, elektromos vagy hibrid lehet" });
        }
        if (isNaN(carsData[4]) || parseInt(carsData[4]) <= 0) {
            return res.status(400).json({ error: "A jármű teljesítménye nagyobb kell legyen mint 0" });
        }
        if (isNaN(carsData[5]) || parseInt(carsData[5]) <= 0) {
            return res.status(400).json({ error: "A jármű ára nagyobb kell legyen mint 0 euró" });
        }

        const [rows, fields] = await db.query(`
            INSERT INTO autok (marka, modell, evjarat, uzemanyag, teljesitmeny_le, ar_eur)
            VALUES (?,?,?,?,?,?)`, carsData
        );

        res.status(200).json({ message: 'Autó sikeresen felvéve!' });

    } catch (error) {
        console.error(`Error adding car: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/autok/:autoId', async (req, res) => {
    try {
        let autoId = parseInt(req.params.autoId);
        const [rows, fields] = await db.query('DELETE FROM autok WHERE id =?', [autoId]);
        if (rows.length === 0) {
            res.status(404).json({ error: "Autó nem található" });
        } else {
            res.status(200).json({ message: "Autó sikeresen eltávolítva a listából" });
        }
 
    } catch (error) {
        console.error(`Error retrieving cars ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


app.listen(3000);