// /controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Register a new user (Client or Freelancer)
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Basic request validation
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate specific enum roles
  if (role !== 'client' && role !== 'freelancer') {
    return res.status(400).json({ message: 'Role must be either client or freelancer.' });
  }

  try {
    // Check if user already exists
    const userCheckQuery = 'SELECT id FROM users WHERE email = $1;';
    const userCheckResult = await db.query(userCheckQuery, [email.toLowerCase().trim()]);
    
    if (userCheckResult.rows.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Hash the password securely (12 salt rounds is industry standard)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into database
    const insertUserQuery = `
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, role, created_at;
    `;
    
    const newUserResult = await db.query(insertUserQuery, [
      firstName.trim(),
      lastName.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      role
    ]);

    const newUser = newUserResult.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal server error processing registration.' });
  }
};

/**
 * Authenticate user and return token
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Lookup user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1;';
    const userResult = await db.query(userQuery, [email.toLowerCase().trim()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    // Verify incoming password against stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error processing login.' });
  }
};