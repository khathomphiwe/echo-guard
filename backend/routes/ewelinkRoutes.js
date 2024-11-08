
const express = require('express');
const ewelink = require('ewelink-api');
const router = express.Router();

const connection = new ewelink({
  email: process.env.EWELINK_EMAIL,
  password: process.env.EWELINK_PASSWORD,
  region: process.env.EWELINK_REGION,
});

router.get('/turnOn', async (req, res) => {
  try {
    const response = await connection.setDevicePowerState(process.env.DEVICE_ID, 'on');
    res.json({ status: response ? 'on' : 'error' });
  } catch (error) {
    console.error('Error turning on the bulb:', error);
    res.status(500).json({ error: 'Failed to turn on the bulb' });
  }
});

router.get('/turnOff', async (req, res) => {
  try {
    const response = await connection.setDevicePowerState(process.env.DEVICE_ID, 'off');
    res.json({ status: response ? 'off' : 'error' });
  } catch (error) {
    console.error('Error turning off the bulb:', error);
    res.status(500).json({ error: 'Failed to turn off the bulb' });
  }
});

module.exports = router;
