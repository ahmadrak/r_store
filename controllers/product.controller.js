const Product = require("../models/product.model");

const getProducts = async (req, res) => {
  try {
    const rows = await Product.getAllProducts();
    const productsMap = {};

    rows.forEach(row => {
      if (!productsMap[row.id]) {
        productsMap[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          stock: row.stock,
          category: row.category,
          images: []
        };
      }

      if (row.image_id) {
        productsMap[row.id].images.push({
          id: row.image_id,
          image_url: row.image_url,
          is_main: row.is_main
        });
      }
    });

    res.json(Object.values(productsMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const addProduct = async (req, res) => {
  const { name, price, stock } = req.body;

  // ✅ validation
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Product name is required" });
  }

  if (price == null || price < 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: "Invalid stock value" });
  }

  try {
    const product = await Product.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;

  // ✅ validate only provided fields
  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ message: "Invalid product name" });
  }

  if (price !== undefined && price < 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ message: "Invalid stock value" });
  }

  try {
    const updatedProduct = await Product.updateProduct(id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found or no fields provided" });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteProduct = async (req, res)=>{
 try {
    const { id } = req.params;

    const deletedProduct = await Product.deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
};
