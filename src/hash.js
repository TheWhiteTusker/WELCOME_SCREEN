const bcrypt = require("bcryptjs");
const hashed = bcrypt.hashSync("Digital@1331", 10);
console.log("Hashed password:", hashed);
