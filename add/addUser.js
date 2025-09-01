const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config({ path: "../.env" });

async function addUser(email, password) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = new User({ email, password });
    await user.save();

    console.log("User added successfully");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error adding user:", error);
    mongoose.disconnect();
  }
}

// Example usage: node addUser.js user@example.com password123
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log("Usage: node addUser.js <email> <password>");
  process.exit(1);
}

const [email, password] = args;
addUser(email, password);
