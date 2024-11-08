const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/verify', userController.verifyOTP);
router.post('/:userId/biometric', userController.registerBiometricData);
router.post('/:userId/voice', upload.single('voicePrint'), userController.registerVoiceData); 
router.post('/:userId/voice-login', upload.single('voiceLogin'), userController.authenticateWithVoice);
router.get('/me', authMiddleware, userController.getUserProfile);

module.exports = router;
