
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


router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);
router.post("/checkout", checkout);


module.exports = router;