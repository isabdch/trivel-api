-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "details" (
    "itinerary_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tour" TEXT,
    "alert" TEXT,
    "duration" INTEGER,
    "meetingpoint" TEXT,
    "costperperson" DECIMAL(10,2),
    "included" TEXT,
    "notincluded" TEXT,
    "additional" JSONB,

    CONSTRAINT "details_pkey" PRIMARY KEY ("itinerary_id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover" TEXT,
    "popular" BOOLEAN DEFAULT false,
    "link" TEXT,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "itinerary_id" TEXT,
    "url" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optional" (
    "id" TEXT NOT NULL,
    "detail_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "price" DECIMAL(10,2),
    "observations" TEXT,

    CONSTRAINT "optional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_link_key" ON "itineraries"("link");

-- AddForeignKey
ALTER TABLE "details" ADD CONSTRAINT "details_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "optional" ADD CONSTRAINT "optional_detail_id_fkey" FOREIGN KEY ("detail_id") REFERENCES "details"("itinerary_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
