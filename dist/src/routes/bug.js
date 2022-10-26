"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./db/bug.db", sqlite.OPEN_READWRITE, err => {
    if (err) {
        console.error(err.message);
    }
    else {
        console.log("Connected to the bug db");
    }
});
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS bug (id INTEGER PRIMARY KEY, title TEXT, text TEXT, closed INTEGER)");
    db.run("INSERT INTO bug (title, text, closed) values (?, ?, ?)", ["Test Bug", "This is a test bug", 0], err => {
        if (err)
            console.log("Error inserting into table bug:", err);
    });
});
const router = express_1.default.Router();
router.get("/", (req, res) => {
    db.serialize(() => {
        db.get("SELECT * FROM bug", (err, row) => {
            res.json(row);
        });
    });
});
router.post("/", (req, res) => {
    res.send("Post");
});
router.put("/", (req, res) => {
    res.send("put");
});
router.delete("/", (req, res) => {
    res.send("Delete");
});
exports.default = router;
