// Core
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { PrismaClient } from "@prisma/client";

// Libraries
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Schemas
import {
  userSchema,
  loginSchema,
  mediaSchema,
  detailsSchema,
  optionalSchema,
  itinerarySchema,
} from "./schemas";

// Middlewares
import { validateRequest } from "./middlewares/validate";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const app = express();

dotenv.config();

export const prisma = new PrismaClient();

app.use(express.json()); // middleware para parsear o body da request como json

const port = 3000;

type UserT = {
  id: string;
  fullname: string;
  email: string;
  role: string;
  phone: string;
  password: string;
  itineraries: ItineraryT[];
};

type MediaT = {
  id: string;
  url: string;
  itinerary_id?: string;
};

type AdditionalT = {
  security?: string;
  accessibility?: string;
  recommendations?: string;
};

type OptionalT = {
  id: string;
  title: string;
  detail_id?: string;
  price?: string;
  duration?: number;
  description?: string;
  observations?: string;
};

type DetailsT = {
  description: string;
  itinerary_id?: string;
  tour?: string;
  alert?: string;
  duration?: number;
  included?: string;
  timetable?: string;
  notIncluded?: string;
  meetingPoint?: string;
  costPerPerson?: string;
  optional?: OptionalT[];
  additional?: AdditionalT;
};

type ItineraryT = {
  id: string;
  name: string;
  cover: string | null;
  media: MediaT[];
  popular: boolean | null;
  details: DetailsT | null;
};

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

  if (!result) {
    return null;
  }

  return result;
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token not provided" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
      } else {
        req.user = user as {
          userId: string;
          email: string;
        };

        next();
      }
    });
  }
};

app.get("/", (req: Request, res: Response) => {
  res.send("Servidor no ar!");
});

app.get("/itineraries/:id/details", async (req: Request, res: Response) => {
  const id = req.params.id; // parametro da url

  const newItineraryDetails = await prisma.details.findMany({
    where: { itinerary_id: id },
  });

  if (!newItineraryDetails.length) {
    res.status(404).json({ message: "Itinerary details not found" });

    return;
  }

  res.status(200).json(newItineraryDetails);
});

app.post(
  "/itineraries/details",
  validateRequest(detailsSchema),
  async (req: Request, res: Response) => {
    const {
      description,
      tour,
      alert,
      duration,
      included,
      notIncluded,
      meetingPoint,
      costPerPerson,
      itinerary_id,
      additional,
    }: DetailsT = req.body; // body da request

    const newItineraryDetails = await prisma.details.create({
      data: {
        description,
        tour,
        alert,
        duration,
        included,
        notincluded: notIncluded,
        meetingpoint: meetingPoint,
        costperperson: costPerPerson,
        additional,
        itinerary_id: itinerary_id as string,
      },
    });

    if (!newItineraryDetails) {
      res.status(400).json({ message: "Error creating itinerary details" });

      return;
    }

    res.status(201).json(newItineraryDetails);
  }
);

app.patch("/itineraries/details/:id", async (req: Request, res: Response) => {
  const itinerary_id = req.params.id; // parametro da url
  const {
    description,
    tour,
    alert,
    duration,
    included,
    notIncluded,
    meetingPoint,
    costPerPerson,
    additional,
  }: DetailsT = req.body; // body da request

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
      description,
      tour,
      alert,
      duration,
      included,
      notincluded: notIncluded,
      meetingpoint: meetingPoint,
      costperperson: costPerPerson,
      additional,
    },
  });

  if (!newItineraryDetails) {
    res.status(400).json({ message: "Error updating itinerary details" });

    return;
  }

  res.status(200).json(newItineraryDetails);
});

app.delete("/itineraries/details/:id", async (req: Request, res: Response) => {
  const itinerary_id = req.params.id; // parametro da url

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
});

app.get(
  "/itineraries/details/:id/optional",
  async (req: Request, res: Response) => {
    const id = req.params.id; // parametro da url

    const newItineraryOptional = await prisma.optional.findMany({
      where: { detail_id: id },
    });

    if (!newItineraryOptional.length) {
      res.status(404).json({ message: "Optional not found" });

      return;
    }

    res.status(200).json(newItineraryOptional);
  }
);

app.post(
  "/itineraries/details/optional",
  validateRequest(optionalSchema),
  async (req: Request, res: Response) => {
    const {
      title,
      price,
      duration,
      description,
      observations,
      detail_id,
    }: OptionalT = req.body; // body da request

    const newItineraryOptional = await prisma.optional.create({
      data: {
        id: uuidv4(),
        detail_id,
        title,
        price,
        duration,
        description,
        observations,
      },
    });

    if (!newItineraryOptional) {
      res.status(400).json({ message: "Error creating itinerary optional" });

      return;
    }

    res.status(201).json(newItineraryOptional);
  }
);

app.patch(
  "/itineraries/details/optional/:id",
  async (req: Request, res: Response) => {
    const id = req.params.id; // parametro da url

    const { title, price, duration, description, observations }: OptionalT =
      req.body; // body da request

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
  }
);

app.delete(
  "/itineraries/details/optional/:id",
  async (req: Request, res: Response) => {
    const id = req.params.id; // parametro da url

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
  }
);

app.get("/itineraries/:id/media", async (req: Request, res: Response) => {
  const id = req.params.id; // parametro da url

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
});

app.post(
  "/itineraries/media",
  validateRequest(mediaSchema),
  async (req: Request, res: Response) => {
    const { url, itinerary_id }: MediaT = req.body; // body da request

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
  }
);

app.patch("/itineraries/media/:id", async (req: Request, res: Response) => {
  const id = req.params.id; // parametro da url

  const { url }: MediaT = req.body; // body da request

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
});

app.delete("/itineraries/media/:id", async (req: Request, res: Response) => {
  const id = req.params.id; // parametro da url

  await prisma.media.delete({
    where: { id },
  });

  res.status(200).json({ message: "Itinerary media deleted" });
});

app.get("/itineraries", async (req: Request, res: Response) => {
  const name = req.query.name as string; // queries da url
  const simplified = req.query.simplified as string; // queries da url
  const user_id = req.query.user_id as string; // queries da url

  let itineraries: Pick<ItineraryT, "id" | "name" | "cover" | "popular">[] = [];

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
});

app.get("/itineraries/:id", async (req: Request, res: Response) => {
  const id = req.params.id; // parametro da url

  const itinerary = await prisma.itineraries.findUnique({
    where: { id },
  });

  if (!itinerary) {
    res.status(404).json({ message: "Itinerary not found" });

    return;
  }

  const itineraryWithAllData = await getItineraryWithAllData(itinerary.id);

  res.status(200).json(itineraryWithAllData);
});

app.post(
  "/itineraries",
  authenticateToken,
  validateRequest(itinerarySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, cover, popular }: ItineraryT = req.body; // body da request
    const user = req.user;

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
  }
);

app.patch("/itineraries/:id", async (req: Request, res: Response) => {
  const { name, cover, popular }: ItineraryT = req.body; // body da request
  const id = req.params.id; // parametro da url

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
});

app.delete("/itineraries/:id", async (req: Request, res: Response) => {
  const id = req.params.id; // parametro da url

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

    console.error("Erro ao deletar itinerário:", error);

    res.status(500).json({ message: "Internal server error" });
  }
});

app.get(
  "/users",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userRequest = req.user;

    if (!userRequest) {
      res.status(401).json({ message: "Unauthorized" });

      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userRequest.userId },
      include: { itineraries: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });

      return;
    }

    const userWithoutPassword = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      phone: user.phone,
      itineraries: user.itineraries,
    };

    res.status(200).json(userWithoutPassword);
  }
);

app.post(
  "/users",
  validateRequest(userSchema),
  async (req: Request, res: Response) => {
    const { fullname, email, role, phone, password }: UserT = req.body;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        res.status(400).json({ error: "Email already in use" });

        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          fullname,
          email,
          role,
          phone,
          password: hashedPassword,
          itineraries: {
            create: [],
          },
        },
      });

      if (!newUser) {
        res.status(400).json({ message: "Error creating user" });

        return;
      }

      const userWithoutPassword = {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      };

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error creating user", detail: error });
    }
  }
);

app.post(
  "/users/login",
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json({ message: "Invalid password" });
      }

      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
      );

      await prisma.refresh_token.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          token: refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      res.json({ accessToken, refreshToken });
    }
  }
);

app.post("/users/logout", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token not provided" });
  } else {
    await prisma.refresh_token.deleteMany({
      where: { token: refreshToken },
    });

    res.status(200).json({ message: "Logout successful" });
  }
});

app.post("/users/refresh-token", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token not provided" });
  } else {
    const existing = await prisma.refresh_token.findUnique({
      where: { token: refreshToken },
    });

    if (!existing) {
      res.status(403).json({ message: "Refresh token not found" });
    } else {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET as string
        ) as { userId: string };

        const newAccessToken = jwt.sign(
          { userId: decoded.userId },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        );

        await prisma.refresh_token.delete({
          where: { token: refreshToken },
        });

        res.json({ accessToken: newAccessToken });
      } catch (err) {
        res.status(403).json({ message: "Token expired or invalid" });
      }
    }
  }
});

app.get(
  "/protected",
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: "You are authenticated!", user: req.user });
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
