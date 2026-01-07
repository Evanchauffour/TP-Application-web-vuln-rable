const mysql = require("mysql2/promise");

const waitForDatabaseConnection = async () => {
  const retryInterval = 2000;
  const maxRetries = 10;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      console.log(
        `Tentative de connexion à la base de données (${attempts}/${maxRetries})...`
      );
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      console.log("Connecté à la base de données MySQL");
      connection.end();
      return; // Si la connexion réussit, on sort de la fonction
    } catch (err) {
      if (attempts >= maxRetries) {
        console.error(`Échec de connexion après ${maxRetries} tentatives`);
        throw new Error(
          "Impossible de se connecter à la base de données après plusieurs tentatives"
        );
      }
      console.error(
        `Base de données non prête, nouvelle tentative dans 2 secondes... (${attempts}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
};

// Crée une instance réutilisable de connexion MySQL
const createDbConnection = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
};

// Fonction principale pour attendre puis exporter la connexion
const initializeDbConnection = async () => {
  await waitForDatabaseConnection();
  return createDbConnection();
};

// Exportation de l'initialisation pour utilisation dans d'autres fichiers
module.exports = initializeDbConnection;
