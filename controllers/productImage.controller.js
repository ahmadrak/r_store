const ProductImage = require("../models/productImage.model");

const addProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, is_main } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    const image = await ProductImage.addImage(id, image_url, is_main);
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await ProductImage.getImagesByProduct(id);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addProductImage,
  getProductImages,
};
