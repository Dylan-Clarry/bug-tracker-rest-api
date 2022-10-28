"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = require("../../db/setupdb").startDb();
const TABLE = "bug";
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    const sql = "SELECT * FROM " + TABLE;
    db.serialize(() => {
        db.all(sql, (err, rows) => {
            if (err) {
                console.error("Error selecting all values from table " + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: "Error selecting all values from table " + TABLE + ":" + err.message }, err)
                });
            }
            return res.status(200).json({
                data: rows,
                error: null,
            });
        });
    });
});
router.get("/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM " + TABLE + " WHERE id=(?)";
    db.serialize(() => {
        db.get(sql, [id], (err, row) => {
            if (err) {
                console.error("Error selecting entry with id " + id + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
                });
            }
            return res.status(200).json({
                data: row,
                error: null,
            });
        });
    });
});
router.post("/", (req, res) => {
    const user = {
        id: +req.params.id,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    };
    db.serialize(() => {
        const sql = `
            UPDATE ${TABLE}
            SET title=COALESCE(?, title), text=COALESCE(?, text), closed=COALESCE(?, closed)
            WHERE id=?
        `;
        const sqlVals = [user.title, user.text, user.closed ? 1 : 0, user.id];
    });
    const bugArr = [
        ["Test Bug", "This is a test bug", 0],
        ["Bug 3", "Buggy", 0],
        ["Bug 5: The search for 4", "A bug is not just a bug, he is a bug, he is a a bug", 0]
    ];
    db.serialize(() => {
        const sql = "INSERT INTO " + TABLE + " (title, text, closed) values " + "(?, ?, ?), ".repeat(bugArr.length - 1) + "(?, ?, ?)";
        const sqlVals = bugArr.reduce((newArr, bug) => newArr.concat(...bug));
        db.run(sql, sqlVals, (err) => {
            if (err) {
                console.error("Error inserting into table " + TABLE + ":", err);
                return res.status(400).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
                });
            }
        });
        const recentInsertedSql = "SELECT * FROM " + TABLE + " ORDER BY id DESC LIMIT " + bugArr.length;
        db.all(recentInsertedSql, (err, rows) => {
            if (err) {
                console.error("Error selecting all values from table" + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
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
router.post("/test", (_req, res) => {
    const bugArr = [
        ["Test Bug", "This is a test bug", 0],
        ["Bug 3", "Buggy", 0],
        ["Bug 5: The search for 4", "A bug is not just a bug, he is a bug, he is a a bug", 0]
    ];
    db.serialize(() => {
        const sql = "INSERT INTO " + TABLE + " (title, text, closed) values " + "(?, ?, ?), ".repeat(bugArr.length - 1) + "(?, ?, ?)";
        const sqlVals = bugArr.reduce((newArr, bug) => newArr.concat(...bug));
        db.run(sql, sqlVals, (err) => {
            if (err) {
                console.error("Error inserting into table " + TABLE + ":", err);
                return res.status(400).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
                });
            }
        });
        const recentInsertedSql = "SELECT * FROM " + TABLE + " ORDER BY id DESC LIMIT " + bugArr.length;
        db.all(recentInsertedSql, (err, rows) => {
            if (err) {
                console.error("Error selecting all values from table" + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
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
router.put("/:id", (req, res) => {
    const bug = {
        id: +req.params.id,
        title: req.body.title,
        text: req.body.text,
        closed: req.body.closed
    };
    db.serialize(() => {
        const sql = `
            UPDATE ${TABLE}
            SET title=COALESCE(?, title), text=COALESCE(?, text), closed=COALESCE(?, closed)
            WHERE id=?
        `;
        const sqlVals = [bug.title, bug.text, bug.closed ? 1 : 0, bug.id];
        db.run(sql, sqlVals, (err) => {
            if (err) {
                console.error("Error updating value from table " + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: "Error updating value from table " + TABLE + ":" + err.message }, err)
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
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    db.serialize(() => {
        const sql = "DELETE FROM " + TABLE + " WHERE id=(?)";
        db.run(sql, [id], (err) => {
            if (err) {
                console.error("Error deleting from table " + TABLE + " with id " + id + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
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
router.delete("/", (_req, res) => {
    db.serialize(() => {
        const sql = "DELETE FROM " + TABLE;
        db.run(sql, (err) => {
            if (err) {
                console.error("Error deleting all values from table " + TABLE + ":", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
                });
            }
            return res.status(200).json({
                data: null,
                error: null,
                msg: "All records successfully deleted."
            });
        });
    });
});
exports.default = router;
