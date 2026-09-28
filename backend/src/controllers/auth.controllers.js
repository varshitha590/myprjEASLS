import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const SALT_ROUNDS = 10;

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await query(
      "SELECT id, name, email, password_hash, is_blocked FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if(user.is_blocked){
return res.status(403).json({
message:"Your account has been blocked by admin"
});
}

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function ensureUser(req, res, next) {
  const { user_id, email } = req.body;

  if (!user_id) return next();

  await query(
    `
    INSERT INTO users (id, email)
    VALUES ($1, $2)
    ON CONFLICT (id) DO NOTHING
    `,
    [user_id, email]
  );

  next();
}

export async function blockUser(req,res){

try{

const { id } = req.params;

await query(
"UPDATE users SET is_blocked = TRUE WHERE id=$1",
[id]
);

res.json({message:"User blocked"});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

}


export async function unblockUser(req,res){

try{

const { id } = req.params;

await query(
"UPDATE users SET is_blocked = FALSE WHERE id=$1",
[id]
);

res.json({message:"User unblocked"});

}catch(err){

console.error(err);
res.status(500).json({error:"Server error"});

}

}