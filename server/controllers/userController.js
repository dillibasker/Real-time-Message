import User from '../models/User.js';

// Get all users (for contacts)
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('username email avatar status isOnline lastSeen')
      .sort({ username: 1 });
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('username email avatar status isOnline lastSeen');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatar, status } = req.body;
    
    // Check if username is taken (if changing username)
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(username && { username }),
        ...(avatar && { avatar }),
        ...(status && { status })
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status (online/offline)
export const updateUserStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isOnline,
        ...(isOnline === false && { lastSeen: Date.now() })
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};