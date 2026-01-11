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

router.get("/", getProducts);
router.post("/", addProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/images", addProductImage);
router.get("/:id/images", getProductImages);


module.exports = router;
