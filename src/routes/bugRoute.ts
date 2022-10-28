import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import { Bug } from "../@types/Bug";

const db = require("../../db/setupdb").startDb();

const router: express.Router = express.Router();
router.get("/", (_req: Request, res: Response) => {
    const sql = "SELECT * FROM bug";
    db.serialize(() => {
        db.all(sql, (err: any, rows: any) => {
            if(err){
                console.error("Error selecting all values from table bug:", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: "Error selecting all values from table bug:" + err.message,
                        ...err
                    }
                });
            }
            return res.status(200).json({
                data: rows,
                error: null,
            });
        });
    });
});

router.get("/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    const sql = "SELECT * FROM bug WHERE id=(?)";
    db.serialize(() => {
        db.get(sql, [id], (err: any, row: any) => {
            if(err) {
                console.error("Error selecting entry with id " + id + ":", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err,
                    }
                });
            }
            return res.status(200).json({
                data: row,
                error: null,
            })
        });
    });
});

router.post("/", (_req: Request, res: Response) => {
    const bugArr = [
        ["Test Bug", "This is a test bug", 0],
        ["Bug 3", "Buggy", 0],
        ["Bug 5: The search for 4", "A bug is not just a bug, he is a bug, he is a a bug", 0]
    ];

    db.serialize(() => {
        const sql = "INSERT INTO bug (title, text, closed) values " + "(?, ?, ?), ".repeat(bugArr.length - 1) + "(?, ?, ?)";
        const sqlVals = bugArr.reduce((newArr, bug) => newArr.concat(...bug));
        db.run(sql, sqlVals, (err: any) => {
            if(err) {
                console.error("Error inserting into table bug:", err);
                return res.status(400).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
        });

        const recentInsertedSql = "SELECT * FROM bug ORDER BY id DESC LIMIT " + bugArr.length;
        db.all(recentInsertedSql, (err: any, rows: any) => {
            if(err) {
                console.error("Error selecting all values from table bug", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
            return res.status(201).json({
                data: rows,
                error: null,
                msg: "Successfully created " + bugArr.length + " entries.",
            });
        });
    });
});

router.put("/:id", (req: Request, res: Response) => {
    const bug: Bug = {
        id: +req.params.id,
        title: req.body.title,
        text: req.body.text,
        closed: req.body.closed
    };
    console.log("body", req.body);
    console.log("bug", bug);
    db.serialize(() => {
        const sql = `
            UPDATE bug
            SET title=COALESCE(?, title), text=COALESCE(?, text), closed=COALESCE(?, closed)
            WHERE id=?
        `;
        const sqlVals = [bug.title, bug.text, bug.closed ? 1 : 0, bug.id];
        db.run(sql, sqlVals, (err: any) => {
            if(err) {
                console.error("Error updating value from table bug: ", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: "Error updating value from table bug: " + err.message,
                        ...err
                    }
                });
            }
            return res.status(200).json({
                data: null,
                error: null,
                msg: "Successfully updated entry with id " + bug.id,
            });
        });
    });
});

router.delete("/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    db.serialize(() => {
        const sql = "DELETE FROM bug WHERE id=(?)";
        db.run(sql, [id], (err: any) => {
            if(err) {
                console.error("Error deleting from table bug with id " + id + ":", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
            return res.status(200).json({
                data: null,
                error: null,
                msg: "Entry with id " + id + " successfully deleted",
            });
        });
    });
});

router.delete("/", (_req: Request, res: Response) => {
    db.serialize(() => {
        const sql = "DELETE FROM bug";
        db.run(sql, (err: any) => {
            if(err) {
                console.error("Error deleting all values from table bug:", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
            return res.status(200).json({
                data: null,
                error: null,
                msg: "All records successfully deleted."
            })
        });
    });
});

export default router;
