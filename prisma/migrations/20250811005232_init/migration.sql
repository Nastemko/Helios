-- CreateTable
CREATE TABLE "public"."authors" (
    "id" TEXT NOT NULL,
    "tlgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "birthDate" TEXT,
    "deathDate" TEXT,
    "period" TEXT,
    "genre" TEXT,
    "nationality" TEXT,
    "biography" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."works" (
    "id" TEXT NOT NULL,
    "tlgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "authorId" TEXT NOT NULL,
    "genre" TEXT,
    "period" TEXT,
    "language" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "lineCount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."texts" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "lineNumber" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."translations" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "translator" TEXT,
    "translationDate" TEXT,
    "edition" TEXT,
    "publisher" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collection_works" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_index" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "textId" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_index_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_tlgId_key" ON "public"."authors"("tlgId");

-- CreateIndex
CREATE UNIQUE INDEX "works_authorId_tlgId_key" ON "public"."works"("authorId", "tlgId");

-- CreateIndex
CREATE UNIQUE INDEX "texts_workId_language_lineNumber_key" ON "public"."texts"("workId", "language", "lineNumber");

-- CreateIndex
CREATE UNIQUE INDEX "translations_workId_language_key" ON "public"."translations"("workId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "collection_works_collectionId_workId_key" ON "public"."collection_works"("collectionId", "workId");

-- AddForeignKey
ALTER TABLE "public"."works" ADD CONSTRAINT "works_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."texts" ADD CONSTRAINT "texts_workId_fkey" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."translations" ADD CONSTRAINT "translations_workId_fkey" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_works" ADD CONSTRAINT "collection_works_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_works" ADD CONSTRAINT "collection_works_workId_fkey" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_index" ADD CONSTRAINT "search_index_workId_fkey" FOREIGN KEY ("workId") REFERENCES "public"."works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_index" ADD CONSTRAINT "search_index_textId_fkey" FOREIGN KEY ("textId") REFERENCES "public"."texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
