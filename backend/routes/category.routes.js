const express = require("express");
const router = express.Router();
const {
getAllCategories,
createCategory,
updateCategory,
deleteCategory
} = require("../controllers/category.controller");
const ensureAdmin = require('../middleware/auth') 
const ensureAuthenticated = require('../middleware/auth') 



router.get("/", getAllCategories);
router.post("/",ensureAuthenticated,ensureAdmin, createCategory);
router.patch("/:id",ensureAuthenticated,ensureAdmin, updateCategory);
router.delete("/:id",ensureAuthenticated,ensureAdmin, deleteCategory);

module.exports = router;
