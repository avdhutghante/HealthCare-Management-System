export const login = async (req, res) => {
  // 1. ✅ Checks if user exists
  const user = await User.findOne({ email }).select('+password');
  
  // 2. ✅ Checks if user is active
  if (!user.isActive) {
    return res.status(401).json({
      message: 'Your account has been deactivated'
    });
  }
  
  // 3. ✅ Checks password
  const isPasswordCorrect = await user.comparePassword(password);
  
  // 4. ❌ NO CHECK FOR isApproved!
  // Missing this check! ↓
  // if (!user.isApproved && (user.role === 'doctor' || user.role === 'lab')) {
  //   return res.status(403).json({
  //     message: 'Your account is pending admin approval'
  //   });
  
  // 5. ❌ Sends token to EVERYONE (even unapproved doctors)
  // After password check, BEFORE generating token:
  if ((user.role === 'doctor' || user.role === 'lab') && !user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval. Please wait for approval before logging in.'
    });
  }
  
  const token = generateToken(user._id);
  
  res.json({
    success: true,
    token,  // ← Unapproved doctors get token!
    user: {
      isApproved: user.isApproved  // Sends false, but still allows login!
    }
  });
}