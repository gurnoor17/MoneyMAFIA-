const bcrypt = require('bcryptjs');
const db = require('../config/db');

// @route   GET api/profile/summary
// @desc    Get profile details and summarized statistics
// @access  Private
exports.getSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch user detail
    const userResult = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

    // 2. Fetch total transactions count
    const countResult = await db.query('SELECT COUNT(*) FROM transactions WHERE user_id = $1', [userId]);
    const totalTransactions = parseInt(countResult.rows[0].count, 10);

    // 3. Fetch total income, total expense
    const sumsResult = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
       FROM transactions 
       WHERE user_id = $1`,
      [userId]
    );

    const totalIncome = parseFloat(sumsResult.rows[0].total_income);
    const totalExpense = parseFloat(sumsResult.rows[0].total_expense);
    const currentBalance = totalIncome - totalExpense;

    res.json({
      profile: user,
      stats: {
        totalTransactions,
        totalIncome,
        totalExpense,
        currentBalance
      }
    });
  } catch (err) {
    console.error('Get profile summary error:', err.message);
    res.status(500).json({ message: 'Server error retrieving profile stats' });
  }
};

// @route   PUT api/profile
// @desc    Update user name and email
// @access  Private
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    // Check if email is in use by another user
    const checkEmail = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase().trim(), userId]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase().trim(), userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Server error updating profile details' });
  }
};

// @route   PUT api/profile/change-password
// @desc    Change password
// @access  Private
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new passwords are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  try {
    // Fetch user hash
    const result = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPassword, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// @route   DELETE api/profile
// @desc    Delete user account and cascade delete related data
// @access  Private
exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    // Cascades take care of deleting transactions, budgets, notifications automatically due to references ON DELETE CASCADE
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'Account and all associated records deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};
