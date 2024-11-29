import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      username: user.username,
      email: user.email,
      role: user.role, // Include additional fields here
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Only return necessary user information, excluding sensitive data
    const users = await User.find({}).select('username _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};