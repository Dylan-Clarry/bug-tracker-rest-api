import { sqlite3 } from "sqlite3";
import dotenv from "dotenv";
dotenv.config();

function startDb() {
    const sqlite: sqlite3 = require("sqlite3").verbose();
    const db = new sqlite.Database(process.env.BUG_DB!, sqlite.OPEN_READWRITE, err => {
        if(err) {
            console.error("Error connecting to database:", err.message);
        } else {
            console.log("Connected to the bug db");
        }
    });

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS bug (id INTEGER PRIMARY KEY, title TEXT, text TEXT, closed INTEGER)");
        db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT)");
    })

    return db
}

module.exports = { startDb };
