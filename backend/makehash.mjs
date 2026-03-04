import bcrypt from "bcryptjs";

const password = "Avdhut@09";

const hash = await bcrypt.hash(password, 10);
console.log("Hashed password:", hash);
