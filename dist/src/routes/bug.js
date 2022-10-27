"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database(process.env.BUG_DB, sqlite.OPEN_READWRITE, err => {
    if (err) {
        console.error(err.message);
    }
    else {
        console.log("Connected to the bug db");
    }
});
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS bug (id INTEGER PRIMARY KEY, title TEXT, text TEXT, closed INTEGER)");
});
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    const sql = "SELECT * FROM bug";
    db.serialize(() => {
        db.all(sql, (err, row) => {
            if (err)
                console.log("Error selecting all values from table bug", err);
            res.json(row);
        });
    });
});
router.post("/", (_req, res) => {
    const bugArr = [
        ["Test Bug", "This is a test bug", 0],
        ["Bug 2", "bugbugbug", 0]
    ];
    db.serialize(() => {
        const sql = "INSERT INTO bug (title, text, closed) values (?, ?, ?), (?, ?, ?)";
        const sqlVals = bugArr.reduce((newArr, bug) => newArr.concat(...bug));
        db.run(sql, sqlVals, (err) => {
            if (err)
                console.log("Error inserting into table bug:", err);
        });
        const recentInsertedSql = "SELECT * FROM bug ORDER BY id DESC LIMIT " + bugArr.length;
        db.all(recentInsertedSql, (err, row) => {
            if (err)
                console.log("Error selecting all values from table bug", err);
            res.json(row);
        });
    });
});
router.put("/", (_req, res) => {
    res.send("put");
});
router.delete("/", (_req, res) => {
    res.send("Delete");
});
exports.default = router;
