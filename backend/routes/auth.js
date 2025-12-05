const express = require("express");
const router = express.Router();
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Route pour s'inscrire
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const checkSql = "SELECT username, email, role FROM users WHERE email = ? OR username = ?";
  const insertSql =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  try {
    const [existingUsers] = await req.db.execute(checkSql, [email, username]);
    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "Email ou nom d'utilisateur déjà utilisé" });
    }
    const [results] = await req.db.execute(insertSql, [
      username,
      email,
      hashedPassword,
    ]);
    res
      .status(201)
      .json({ message: "Utilisateur créé avec succès", id: results.insertId });
  } catch (err) {
    console.error("Erreur lors de l'inscription :", err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// Route pour se connecter
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  try {
    const [results] = await req.db.execute(sql, [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: "Email incorrect" });
    }
    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }
    const token = generateToken(user);

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: "Connexion réussie", token, user: userWithoutPassword });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

module.exports = router;