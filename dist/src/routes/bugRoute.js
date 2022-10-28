"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = require("../../db/setupdb").startDb();
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    const sql = "SELECT * FROM bug";
    db.serialize(() => {
        db.all(sql, (err, rows) => {
            if (err) {
                console.error("Error selecting all values from table bug:", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: "Error selecting all values from table bug:" + err.message }, err)
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
    const sql = "SELECT * FROM bug WHERE id=(?)";
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
    const bug = {
        id: +req.params.id,
        title: req.body.title,
        text: req.body.text,
        closed: req.body.closed
    };
    db.serialize(() => {
        const sql = "INSERT INTO bug (title, text, closed) values (?, ?, ?)";
        const sqlVals = [bug.title, bug.text, bug.closed ? 1 : 0];
        db.run(sql, sqlVals, (err) => {
            if (err) {
                console.error("Error inserting into table bug:", err);
                return res.status(400).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
                });
            }
        });
        const recentInsertedSql = "SELECT * FROM bug ORDER BY id DESC LIMIT 1";
        db.all(recentInsertedSql, (err, rows) => {
            if (err) {
                console.error("Error selecting all values from table bug", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: err.message }, err)
                });
            }
            return res.status(201).json({
                data: rows,
                error: null,
                msg: "Successfully created new bug entry.",
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
    console.log("body", req.body);
    console.log("bug", bug);
    db.serialize(() => {
        const sql = `
            UPDATE bug
            SET title=COALESCE(?, title), text=COALESCE(?, text), closed=COALESCE(?, closed)
            WHERE id=?
        `;
        const sqlVals = [bug.title, bug.text, bug.closed ? 1 : 0, bug.id];
        db.run(sql, sqlVals, (err) => {
            if (err) {
                console.error("Error updating value from table bug: ", err);
                return res.status(500).json({
                    data: null,
                    error: Object.assign({ msg: "Error updating value from table bug: " + err.message }, err)
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
        const sql = "DELETE FROM bug WHERE id=(?)";
        db.run(sql, [id], (err) => {
            if (err) {
                console.error("Error deleting from table bug with id " + id + ":", err);
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
        const sql = "DELETE FROM bug";
        db.run(sql, (err) => {
            if (err) {
                console.error("Error deleting all values from table bug:", err);
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
