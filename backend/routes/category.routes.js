const express = require("express");
const router = express.Router();
const {
getAllCategories,
createCategory,
updateCategory,
deleteCategory
} = require("../controllers/category.controller");

router.get("/", getAllCategories);
router.post("/", createCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
