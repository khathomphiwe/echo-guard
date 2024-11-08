const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/email');

const client = new SpeechClient();

exports.signup = async (req, res) => {
  const { firstName, lastName, email, contact, password } = req.body;
  try {
    console.log('Starting signup process for email:', email);
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const encryptionKey = Math.random().toString(36).substring(2, 15);

    console.log('Generated OTP:', otp);
    console.log('Generated encryptionKey:', encryptionKey);

    user = new User({
      firstName,
      lastName,
      email,
      contact,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
      isVerified: false,
      encryptionKey,
    });

    await user.save();
    console.log('User saved to database with OTP:', user.otp);
    
    await sendVerificationEmail(email, otp);
    console.log('Verification email sent successfully');

    res.status(201).json({ 
      message: 'User registered, please verify your email with the OTP sent', 
      encryptionKey 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { encryptionKey, otp } = req.body;

  try {
    const cleanOtp = String(otp).trim();
    const user = await User.findOne({ encryptionKey });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid verification attempt. Please try again.' 
      });
    }

    if (user.otpExpiry && Date.now() > user.otpExpiry) {
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified.' 
      });
    }

    const storedOtp = String(user.otp);
    
    if (cleanOtp !== storedOtp) {
      return res.status(400).json({ 
        message: 'Invalid OTP. Please check and try again.' 
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Email verified successfully',
      success: true,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during verification',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerBiometricData = async (req, res) => {
  console.log('Biometric registration request received');
  const { userId } = req.params;
  const { biometricData } = req.body;
  console.log('Biometric Data:', biometricData);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    user.biometricData = biometricData;
    await user.save();

    console.log('Biometric data registered successfully');
    res.status(200).json({ message: 'Biometric data registered successfully' });
  } catch (error) {
    console.error('Error registering biometric data:', error);
    res.status(500).json({ message: 'Failed to register biometric data' });
  }
};

exports.registerVoiceData = async (req, res) => {
  const { userId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Voice data is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tempFilePath = path.join(__dirname, 'temp', file.originalname);
    if (!fs.existsSync(path.dirname(tempFilePath))) {
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }
    fs.writeFileSync(tempFilePath, file.buffer);

    const audioBytes = fs.readFileSync(tempFilePath).toString('base64');

    const audio = {
      content: audioBytes,
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log(`Transcription: ${transcription}`);

    user.voicePrint = transcription;
    await user.save();

    fs.unlinkSync(tempFilePath);

    res.status(200).json({ message: 'Voice data registered successfully' });
  } catch (error) {
    console.error('Error registering voice data:', error);
    res.status(500).json({ message: 'Failed to register voice data' });
  }
};

exports.authenticateWithVoice = async (req, res) => {
  const { userId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Voice data is required for authentication' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tempFilePath = path.join(__dirname, 'temp', file.originalname);
    if (!fs.existsSync(path.dirname(tempFilePath))) {
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }
    fs.writeFileSync(tempFilePath, file.buffer);

    const audioBytes = fs.readFileSync(tempFilePath).toString('base64');

    const audio = {
      content: audioBytes,
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log(`Transcription: ${transcription}`);

    if (user.voicePrint === transcription) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Voice authentication successful', token });
    } else {
      res.status(401).json({ message: 'Voice authentication failed' });
    }

    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error('Error during voice authentication:', error);
    res.status(500).json({ message: 'Failed to authenticate voice' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
