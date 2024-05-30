const mysql = require("mysql");

const Connection = mysql.createConnection({
  host: "localhost",
  user: "test",
  password: "test",
  database: "bidding_platform",
  port: 3306,
});

Connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database successfully!");
});

module.exports = Connection;
