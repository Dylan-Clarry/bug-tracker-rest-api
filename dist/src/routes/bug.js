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
    try {
        db.serialize(() => {
            db.all(sql, (err, rows) => {
                if (err) {
                    console.log("Error selecting all values from table bug:", err);
                    return res.status(500).json({
                        data: null,
                        error: Object.assign({ msg: "Error selecting all values from table bug:" + err.message }, err)
                    });
                }
                else {
                    return res.status(200).json({
                        data: rows,
                        error: null,
                    });
                }
            });
        });
    }
    catch (err) {
        return res.status(500).json({
            data: null,
            error: err,
        });
    }
});
router.post("/", (_req, res) => {
    const bugArr = [
        ["Test Bug", "This is a test bug", 0],
        ["Bug 3", "Buggy", 0],
        ["Bug 5: The search for 4", "A bug is not just a bug, he is a bug, he is a a bug", 0]
    ];
    try {
        db.serialize(() => {
            const sql = "INSERT INTO bug (title, text, closed) values " + "(?, ?, ?), ".repeat(bugArr.length - 1) + "(?, ?, ?)";
            const sqlVals = bugArr.reduce((newArr, bug) => newArr.concat(...bug));
            db.run(sql, sqlVals, (err) => {
                if (err) {
                    console.log("Error inserting into table bug:", err);
                    return res.status(400).json({
                        data: null,
                        error: Object.assign({ msg: err.message }, err)
                    });
                }
            });
            const recentInsertedSql = "SELECT * FROM bug ORDER BY id DESC LIMIT " + bugArr.length;
            db.all(recentInsertedSql, (err, rows) => {
                if (err)
                    console.log("Error selecting all values from table bug", err);
                return res.status(201).json({
                    data: rows,
                    error: null,
                    msg: "Successfully created " + bugArr.length + " entries.",
                });
            });
        });
    }
    catch (err) {
        return res.status(500).json({
            data: null,
            error: err,
        });
    }
});
router.put("/", (_req, res) => {
    res.send("put");
});
router.delete("/all", (_req, res) => {
    try {
        db.serialize(() => {
            const sql = "DELETE FROM bug";
            db.run(sql, err => {
                if (err) {
                    console.error("Error deleting all values from table bug:", err);
                    return res.status(500).json({
                        data: null,
                        error: Object.assign({ msg: err.message }, err)
                    });
                }
                else {
                    return res.status(200).json({
                        data: null,
                        error: null,
                        msg: "All records successfully deleted."
                    });
                }
            });
        });
    }
    catch (err) {
        return res.status(500).json({
            data: null,
            error: err,
        });
    }
});
exports.default = router;
