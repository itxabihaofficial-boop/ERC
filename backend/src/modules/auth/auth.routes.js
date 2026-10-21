const express = require('express');
const { postSession, getMe, postLogin } = require('./auth.controller');
const { requireAuth } = require('../../middleware/requireAuth');

const router = express.Router();

router.post('/login', postLogin);
router.post('/session', postSession);
router.get('/me', requireAuth, getMe);

module.exports = router;
