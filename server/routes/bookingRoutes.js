const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const {
  createBooking,
  listBookings,
  getBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  [
    body("tripId").isMongoId().withMessage("A valid trip is required"),
    body("contactName").trim().notEmpty().withMessage("Contact name is required"),
    body("phone")
      .trim()
      .matches(/^[0-9+\-\s]{7,15}$/)
      .withMessage("A valid phone number is required"),
    body("travelDate").isISO8601().withMessage("A valid travel date is required"),
  ],
  validate,
  createBooking
);

router.get("/", listBookings);
router.get("/:id", [param("id").isMongoId()], validate, getBooking);

module.exports = router;
