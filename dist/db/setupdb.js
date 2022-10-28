"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function startDb() {
    const sqlite = require("sqlite3").verbose();
    const db = new sqlite.Database(process.env.BUG_DB, sqlite.OPEN_READWRITE, err => {
        if (err) {
            console.error("Error connecting to database:", err.message);
        }
        else {
            console.log("Connected to the bug db");
        }
    });
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS bug (id INTEGER PRIMARY KEY, title TEXT, text TEXT, closed INTEGER)");
        db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT)");
    });
    return db;
}
module.exports = { startDb };
