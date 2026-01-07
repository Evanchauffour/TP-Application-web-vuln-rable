const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "../jwt-private.key"),
  "utf8"
);
const publicKey = fs.readFileSync(
  path.join(__dirname, "../jwt-public.key"),
  "utf8"
);

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, privateKey, {
    algorithm: "RS256",
    expiresIn: "12h",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
};
module.exports = {
  generateToken,
  verifyToken,
};
