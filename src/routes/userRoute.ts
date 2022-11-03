import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import { User } from "../@types/User";

const db = require("../../db/setupdb").startDb();
const TABLE = "user";

const router: express.Router = express.Router();
router.get("/", (_req: Request, res: Response) => {
    const sql = "SELECT * FROM " + TABLE;
    db.serialize(() => {
        db.all(sql, (err: any, rows: any) => {
            if(err){
                console.error("Error selecting all values from table " + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: "Error selecting all values from table " + TABLE + ":" + err.message,
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
    const sql = "SELECT * FROM " + TABLE + " WHERE id=(?)";
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

router.post("/login", (req: Request, res: Response) => {
    const login = {
        username: req.body.username,
        password: req.body.password,
    }

    db.serialize(() => {
        const sql = `
            SELECT id
            FROM user u 
            WHERE u.username = (?)
            AND u.password = (?)
        `;
        const sqlVals = [login.username, login.password];
        db.get(sql, sqlVals, (err: any, row: any) => {
            if(err) {
                console.error("Error retrieving user with credentials \nusername: " + login.username + "\npassword: " + login.password + "\n", err);
                return res.status(400).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
            return res.status(201).json({
                data: row,
                error: null,
            });
        })
    });
});

router.post("/create", (req: Request, res: Response) => {
    const user: User = {
        id: -1,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    };

    db.serialize(() => {
        const sql = "INSERT INTO user (username, password, email) values (?, ?, ?)";
        const sqlVals = [user.username, user.password, user.email];
        db.run(sql, sqlVals, (err: any) => {
            if(err) {
                console.error("Error inserting into table user:", err);
                return res.status(400).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
        });

        const recentInsertedSql = "SELECT * FROM user ORDER BY id DESC LIMIT 1";
        db.all(recentInsertedSql, (err: any, rows: any) => {
            if(err) {
                console.error("Error selecting all values from table user:",  err);
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
                msg: "Successfully created a new user"
            });
        });
    });
});

router.post("/test", (_req: Request, res: Response) => {
    const userArr = [
        ["Jon Rahm", "shhhhhh", "jon@jonrahmgaming.com"],
        ["Crocs McGee", "sooooosecret", "crocs@crocs.com"],
        ["Duck", "quack", "duck@bird.com"],
    ];

    db.serialize(() => {
        const sql = "INSERT INTO " + TABLE + " (username, password, email) values " + "(?, ?, ?), ".repeat(userArr.length - 1) + "(?, ?, ?)";
        const sqlVals = userArr.reduce((newArr, user) => newArr.concat(...user));
        db.run(sql, sqlVals, (err: any) => {
            if(err) {
                console.error("Error inserting into table " + TABLE + ":", err);
                return res.status(400).json({
                    data: null,
                    error: {
                        msg: err.message,
                        ...err
                    }
                });
            }
        });

        const recentInsertedSql = "SELECT * FROM " + TABLE + " ORDER BY id DESC LIMIT " + userArr.length;
        db.all(recentInsertedSql, (err: any, rows: any) => {
            if(err) {
                console.error("Error selecting all values from table" + TABLE + ":",  err);
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
                msg: "Successfully created " + userArr.length + " entries.",
            });
        });
    });
});

router.put("/:id", (req: Request, res: Response) => {
    const user: User = {
        id: +req.params.id,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    };
    db.serialize(() => {
        const sql = `
            UPDATE ${TABLE}
            SET username=COALESCE(?, username), password=COALESCE(?, password), email=COALESCE(?, email)
            WHERE id=?
        `;
        const sqlVals = [user.username, user.password, user.email, user.id];
        db.run(sql, sqlVals, (err: any) => {
            if(err) {
                console.error("Error updating value from table " + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: {
                        msg: "Error updating value from table " + TABLE + ":" + err.message,
                        ...err
                    }
                });
            }
            return res.status(200).json({
                data: null,
                error: null,
                msg: "Successfully updated entry with id " + user.id,
            });
        });
    });
});

router.delete("/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    db.serialize(() => {
        const sql = "DELETE FROM " + TABLE + " WHERE id=(?)";
        db.run(sql, [id], (err: any) => {
            if(err) {
                console.error("Error deleting from table " + TABLE + " with id " + id + ":", err);
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
        const sql = "DELETE FROM " + TABLE;
        db.run(sql, (err: any) => {
            if(err) {
                console.error("Error deleting all values from table " + TABLE + ":", err);
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
