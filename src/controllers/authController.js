import jwt from 'jsonwebtoken';
// import sendVerificationEmail  from '../middleware/email.js';
import User from '../models/User.js';



// Generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};


export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create new user
    const user = await User.create({ username, email, password });
    
    // Generate token for email verification
    const token = generateToken(user._id);

    // Construct verification link (adjust the base URL as needed)
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // Send verification email (this runs asynchronously)
    // sendVerificationEmail(email, username, verificationLink);

    // Respond to the client
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const logout = (req, res) => {
  // In a stateless JWT authentication system, logout is typically handled client-side
  // by removing the token from storage. Here we'll just send a success message.
  res.json({ message: 'Logout successful' });
};

// Optional: Email verification route
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }
    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired verification link' });
  }
};

export default { register, login, logout, verifyEmail };