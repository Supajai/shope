const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);

// ⚠️ เปลี่ยนเป็น upload.array('images', 10)
router.post('/', upload.array('images', 10), productController.createProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;