const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const multerConfig = require('../middleware/multer-config');
const sauceController = require('../controllers/sauce');

router.get('/', auth, sauceController.getAllSauce);
router.post('/', auth, multerConfig, sauceController.createSauce);
router.get('/:id', auth, sauceController.getOneSauce);
router.put('/:id', multer().single('image'), auth, multerConfig, sauceController.modifySauce);
router.delete('/:id', auth, sauceController.deleteSauce);

module.exports = router;