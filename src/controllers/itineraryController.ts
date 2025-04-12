// Core
import { Request, Response } from "express";

// Libraries
import { v4 as uuidv4 } from "uuid";

// Config
import { prisma } from "../config/prisma";

// Types
import type {
  AuthenticatedRequest,
  Itinerary,
  Details,
  Optional,
  Media,
} from "../types";

const getItineraryWithAllData = async (id: string) => {
  const result = await prisma.itineraries.findUnique({
    where: { id },
    include: {
      media: true,
      details: {
        include: {
          optional: true,
        },
      },
    },
  });

  if (!result) return null;

  return result;
};

export const getItineraries = async (req: Request, res: Response) => {
  // Query params
  const name = req.query.name as string;
  const user_id = req.query.user_id as string;
  const simplified = req.query.simplified as string;

  let itineraries: Pick<Itinerary, "id" | "name" | "cover" | "popular">[] = [];

  itineraries = await prisma.itineraries.findMany({
    where: {
      ...(name && { name: { contains: name, mode: "insensitive" } }),
      ...(user_id && { user_id }),
    },
  });

  const itinerariesWithAllData = await Promise.all(
    itineraries.map(async (itinerary) => {
      return await getItineraryWithAllData(itinerary.id);
    })
  );

  res.status(200).json(simplified ? itineraries : itinerariesWithAllData);
};

export const getItineraryById = async (req: Request, res: Response) => {
  const id = req.params.id;

  const itinerary = await prisma.itineraries.findUnique({
    where: { id },
  });

  if (!itinerary) {
    res.status(404).json({ message: "Itinerary not found" });

    return;
  }

  const itineraryWithAllData = await getItineraryWithAllData(itinerary.id);

  res.status(200).json(itineraryWithAllData);
};

export const createItinerary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  const { name, cover, popular }: Itinerary = req.body;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });

    return;
  }

  if (!name) {
    res.status(400).json({ message: "Name is required" });

    return;
  }

  const newItinerary = await prisma.itineraries.create({
    data: {
      id: uuidv4(),
      name,
      cover,
      popular,
      user_id: user.userId,
    },
  });

  if (!newItinerary) {
    res.status(400).json({ message: "Error creating itinerary" });

    return;
  }

  const itineraryWithAllData = await getItineraryWithAllData(newItinerary.id);

  res.status(201).json(itineraryWithAllData);
};

export const updateItinerary = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, cover, popular }: Itinerary = req.body;

  const itinerary = await prisma.itineraries.findUnique({
    where: { id },
  });

  if (!itinerary) {
    res.status(404).json({ message: "Itinerary not found" });

    return;
  }

  const updatedItinerary = await prisma.itineraries.update({
    where: { id },
    data: {
      name,
      cover,
      popular,
    },
  });

  const itineraryWithAllData = await getItineraryWithAllData(
    updatedItinerary.id
  );

  res.status(200).json(itineraryWithAllData);
};

export const deleteItinerary = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const result = await prisma.itineraries.findUnique({
      where: { id },
    });

    if (!result) {
      res.status(404).json({ message: "Itinerary not found" });

      return;
    }

    await prisma.optional.deleteMany({
      where: { details: { itinerary_id: id } },
    });

    await prisma.details.deleteMany({
      where: { itinerary_id: id },
    });

    await prisma.media.deleteMany({
      where: { itinerary_id: id },
    });

    await prisma.itineraries.delete({
      where: { id },
    });

    res.status(200).json({ message: "Itinerary deleted" });
  } catch (error: any) {
    if (error.code === "P2003") {
      res.status(409).json({ message: "Conflict: related data still exists." });
    }

    console.error("Error deleting itinerary:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const getItineraryDetails = async (req: Request, res: Response) => {
  const id = req.params.id;

  const newItineraryDetails = await prisma.details.findMany({
    where: { itinerary_id: id },
  });

  if (!newItineraryDetails.length) {
    res.status(404).json({ message: "Itinerary details not found" });

    return;
  }

  res.status(200).json(newItineraryDetails);
};

export const createItineraryDetails = async (req: Request, res: Response) => {
  const {
    tour,
    alert,
    duration,
    included,
    additional,
    notIncluded,
    description,
    meetingPoint,
    itinerary_id,
    costPerPerson,
  }: Details = req.body;

  const newItineraryDetails = await prisma.details.create({
    data: {
      tour,
      alert,
      duration,
      included,
      additional,
      description,
      notincluded: notIncluded,
      meetingpoint: meetingPoint,
      costperperson: costPerPerson,
      itinerary_id: itinerary_id as string,
    },
  });

  if (!newItineraryDetails) {
    res.status(400).json({ message: "Error creating itinerary details" });

    return;
  }

  res.status(201).json(newItineraryDetails);
};

export const updateItineraryDetails = async (req: Request, res: Response) => {
  const itinerary_id = req.params.id;
  const {
    tour,
    alert,
    duration,
    included,
    additional,
    description,
    notIncluded,
    meetingPoint,
    costPerPerson,
  }: Details = req.body;

  const itineraryDetails = await prisma.details.findUnique({
    where: { itinerary_id },
  });

  if (!itineraryDetails) {
    res.status(404).json({ message: "Itinerary details not found" });

    return;
  }

  const newItineraryDetails = await prisma.details.update({
    where: { itinerary_id },
    data: {
      tour,
      alert,
      duration,
      included,
      additional,
      description,
      notincluded: notIncluded,
      meetingpoint: meetingPoint,
      costperperson: costPerPerson,
    },
  });

  if (!newItineraryDetails) {
    res.status(400).json({ message: "Error updating itinerary details" });

    return;
  }

  res.status(200).json(newItineraryDetails);
};

export const deleteItineraryDetails = async (req: Request, res: Response) => {
  const itinerary_id = req.params.id;

  const itineraryDetails = await prisma.details.findUnique({
    where: { itinerary_id },
  });

  if (!itineraryDetails) {
    res.status(404).json({ message: "Itinerary details not found" });

    return;
  }

  await prisma.details.delete({
    where: { itinerary_id },
  });

  res.status(200).json({ message: "Itinerary details deleted" });
};

export const getItineraryOptional = async (req: Request, res: Response) => {
  const id = req.params.id;

  const newItineraryOptional = await prisma.optional.findMany({
    where: { detail_id: id },
  });

  if (!newItineraryOptional.length) {
    res.status(404).json({ message: "Optional not found" });

    return;
  }

  res.status(200).json(newItineraryOptional);
};

export const createItineraryOptional = async (req: Request, res: Response) => {
  const {
    title,
    price,
    duration,
    detail_id,
    description,
    observations,
  }: Optional = req.body;

  const newItineraryOptional = await prisma.optional.create({
    data: {
      id: uuidv4(),
      title,
      price,
      duration,
      detail_id,
      description,
      observations,
    },
  });

  if (!newItineraryOptional) {
    res.status(400).json({ message: "Error creating itinerary optional" });

    return;
  }

  res.status(201).json(newItineraryOptional);
};

export const updateItineraryOptional = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, price, duration, description, observations }: Optional =
    req.body;

  const itineraryOptional = await prisma.optional.findUnique({
    where: { id },
  });

  if (!itineraryOptional) {
    res.status(404).json({ message: "Itinerary optional not found" });

    return;
  }

  const newItineraryOptional = await prisma.optional.update({
    where: { id },
    data: { title, price, duration, description, observations },
  });

  if (!newItineraryOptional) {
    res.status(400).json({ message: "Error updating itinerary optional" });

    return;
  }

  res.status(200).json(newItineraryOptional);
};

export const deleteItineraryOptional = async (req: Request, res: Response) => {
  const id = req.params.id;

  const itineraryOptional = await prisma.optional.findUnique({
    where: { id },
  });

  if (!itineraryOptional) {
    res.status(404).json({ message: "Itinerary optional not found" });

    return;
  }

  await prisma.optional.delete({
    where: { id },
  });

  res.status(200).json({ message: "Itinerary optional deleted" });
};

export const getItineraryMedia = async (req: Request, res: Response) => {
  const id = req.params.id;

  const newItineraryMedia = await prisma.media.findMany({
    where: {
      itinerary_id: id,
    },
  });

  if (!newItineraryMedia.length) {
    res.status(404).json({ message: "Media not found" });

    return;
  }

  res.status(200).json(newItineraryMedia);
};

export const createItineraryMedia = async (req: Request, res: Response) => {
  const { url, itinerary_id }: Media = req.body;

  const newItineraryMedia = await prisma.media.create({
    data: {
      id: uuidv4(),
      url,
      itinerary_id,
    },
  });

  if (!newItineraryMedia) {
    res.status(400).json({ message: "Error creating itinerary media" });

    return;
  }

  res.status(201).json(newItineraryMedia);
};

export const updateItineraryMedia = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { url }: Media = req.body;

  const itineraryMedia = await prisma.media.findUnique({
    where: { id },
  });

  if (!itineraryMedia) {
    res.status(404).json({ message: "Media not found" });

    return;
  }

  const newItineraryMedia = await prisma.media.update({
    where: { id },
    data: { url },
  });

  if (!newItineraryMedia) {
    res.status(400).json({ message: "Error updating itinerary media" });

    return;
  }

  res.status(200).json(newItineraryMedia);
};

export const deleteItineraryMedia = async (req: Request, res: Response) => {
  const id = req.params.id;

  const itineraryMedia = await prisma.media.findUnique({
    where: { id },
  });

  if (!itineraryMedia) {
    res.status(404).json({ message: "Media not found" });

    return;
  }

  await prisma.media.delete({
    where: { id },
  });

  res.status(200).json({ message: "Itinerary media deleted" });
};
