const express = require("express");
const {
  listDestinations,
  getDestination,
} = require("../controllers/destinationController");

const router = express.Router();

router.get("/", listDestinations);
router.get("/:id", getDestination);

module.exports = router;
