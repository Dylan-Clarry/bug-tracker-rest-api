const express = require("express");

require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("sending it");
});

app.listen(port, () => {
  console.log(`[server]: is running at https://localhost:${port}`);
});
