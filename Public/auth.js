const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  let hash = await bcrypt.hash(password, salt);
  return hash;
};
const hashCompare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const createToken = async (payload) => {
  const token = await JWT.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

const decodeToken = async (token) => {
  try {
    const payload = await JWT.verify(token, process.env.JWT_SECRET_KEY);
    return payload;
  } catch (err) {
    console.error(err);
    throw new Error("Invalid token");
  }
};

module.exports = {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
};
