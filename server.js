const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./banco.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE,
      nome TEXT,
      preco REAL,
      estoque INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL,
      data TEXT
    )
  `);
});

app.post("/produto", (req, res) => {
  const { codigo, nome, preco, estoque } = req.body;
  db.run(
    "INSERT INTO produtos (codigo, nome, preco, estoque) VALUES (?, ?, ?, ?)",
    [codigo, nome, preco, estoque],
    function (err) {
      if (err) return res.status(400).json(err);
      res.json({ ok: true });
    }
  );
});

app.get("/produto/:codigo", (req, res) => {
  db.get(
    "SELECT * FROM produtos WHERE codigo = ?",
    [req.params.codigo],
    (err, row) => {
      if (err) return res.status(500).json(err);
      res.json(row);
    }
  );
});

app.post("/venda", (req, res) => {
  const { total } = req.body;
  const data = new Date().toISOString();
  db.run(
    "INSERT INTO vendas (total, data) VALUES (?, ?)",
    [total, data],
    () => res.json({ ok: true })
  );
});

app.listen(PORT, () => {
  console.log("Servidor rodando");
});
