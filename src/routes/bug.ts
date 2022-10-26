import express, { Request, Response } from "express";

import { sqlite3 } from "sqlite3";

const sqlite: sqlite3 = require("sqlite3").verbose();
const db = new sqlite.Database("./db/bug.db", sqlite.OPEN_READWRITE, err => {
    if(err) {
        console.error(err.message);
    } else {
        console.log("Connected to the bug db");
    }
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS bug (id INTEGER PRIMARY KEY, title TEXT, text TEXT, closed INTEGER)");
    db.run("INSERT INTO bug (title, text, closed) values (?, ?, ?)", ["Test Bug", "This is a test bug", 0], err => {
        if(err) console.log("Error inserting into table bug:", err);
    });
})

const router: express.Router = express.Router();
router.get("/", (req: Request, res: Response) => {
    db.serialize(() => {
        db.get("SELECT * FROM bug", (err, row) => {
            res.json(row);
        })
    })
});

router.post("/", (req: Request, res: Response) => {
    res.send("Post");
});

router.put("/", (req: Request, res: Response) => {
    res.send("put");
});

router.delete("/", (req: Request, res: Response) => {
    res.send("Delete");
});

export default router;
