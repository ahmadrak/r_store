const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/product.controller");
const {
  addProductImage,
  getProductImages,
} = require("../controllers/productImage.controller");

const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

router.get("/",ensureAuthenticated, getProducts);
router.post("/",ensureAuthenticated,ensureAdmin, addProduct);
router.patch("/:id",ensureAuthenticated,ensureAdmin, updateProduct);
router.delete("/:id",ensureAuthenticated,ensureAdmin, deleteProduct);
router.post("/:id/images",ensureAuthenticated,ensureAdmin, addProductImage);
router.get("/:id/images",ensureAuthenticated,ensureAdmin, getProductImages);


module.exports = router;
