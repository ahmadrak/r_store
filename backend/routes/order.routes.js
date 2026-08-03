
const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { checkout } = require("../controllers/order.controller");

const ensureAdmin = require('../middleware/auth') 
const ensureAuthenticated = require('../middleware/auth') 

router.post("/",ensureAuthenticated, createOrder);
router.get("/",ensureAuthenticated,ensureAdmin, getAllOrders);
router.get("/:id",ensureAuthenticated, getOrderById);
router.patch("/:id",ensureAuthenticated, updateOrderStatus);
router.delete("/:id",ensureAuthenticated, deleteOrder);
router.post("/checkout",ensureAuthenticated, checkout);


module.exports = router;