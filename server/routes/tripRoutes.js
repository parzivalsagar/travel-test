const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const {
  listTrips,
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  addDestination,
  removeDestination,
} = require("../controllers/tripController");

const router = express.Router();

router.use(protect);

router.get("/", listTrips);

router.post(
  "/",
  [
    body("name").optional().trim().isLength({ max: 100 }),
    body("travellers")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Travellers must be between 1 and 50"),
    body("budget").optional().isFloat({ min: 0 }).withMessage("Budget cannot be negative"),
  ],
  validate,
  createTrip
);

router.get("/:id", [param("id").isMongoId().withMessage("Invalid trip id")], validate, getTrip);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid trip id"),
    body("travellers")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Travellers must be between 1 and 50"),
    body("budget").optional().isFloat({ min: 0 }).withMessage("Budget cannot be negative"),
    body("status").optional().isIn(["planning", "booked"]),
  ],
  validate,
  updateTrip
);

router.delete("/:id", [param("id").isMongoId()], validate, deleteTrip);

router.post(
  "/:id/destinations",
  [
    param("id").isMongoId(),
    body("destinationId").isMongoId().withMessage("Invalid destination id"),
  ],
  validate,
  addDestination
);

router.delete(
  "/:id/destinations/:destinationId",
  [param("id").isMongoId(), param("destinationId").isMongoId()],
  validate,
  removeDestination
);

module.exports = router;
