// Core
import { Router } from "express";

// Middlewares
import { authenticateToken, validateRequest } from "../middlewares";

// Schemas
import {
  detailsSchema,
  itinerarySchema,
  mediaSchema,
  optionalSchema,
} from "../schemas";

// Controllers
import {
  createItinerary,
  deleteItinerary,
  getItineraries,
  getItineraryById,
  updateItinerary,
  createItineraryDetails,
  deleteItineraryDetails,
  getItineraryDetails,
  updateItineraryDetails,
  createItineraryMedia,
  deleteItineraryMedia,
  getItineraryMedia,
  updateItineraryMedia,
  createItineraryOptional,
  deleteItineraryOptional,
  getItineraryOptional,
  updateItineraryOptional,
} from "../controllers/itineraryController";

const router = Router();

// Primary routes for itineraries
router.get("/", getItineraries);

router.get("/:id", getItineraryById);

router.post(
  "/",
  authenticateToken,
  validateRequest(itinerarySchema),
  createItinerary
);

router.patch("/:id", updateItinerary);

router.delete("/:id", deleteItinerary);

// Details routes
router.get("/:id/details", getItineraryDetails);

router.post("/details", validateRequest(detailsSchema), createItineraryDetails);

router.patch("/details/:id", updateItineraryDetails);

router.delete("/details/:id", deleteItineraryDetails);

// Media routes
router.get("/:id/media", getItineraryMedia);

router.post("/media", validateRequest(mediaSchema), createItineraryMedia);

router.patch("/media/:id", updateItineraryMedia);

router.delete("/media/:id", deleteItineraryMedia);

// Optional routes
router.get("/details/:id/optional", getItineraryOptional);

router.post(
  "/details/optional",
  validateRequest(optionalSchema),
  createItineraryOptional
);

router.patch("/details/optional/:id", updateItineraryOptional);

router.delete("/details/optional/:id", deleteItineraryOptional);

export default router;
