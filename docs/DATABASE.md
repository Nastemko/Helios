# Helios Database Documentation

## Overview

The Helios database (`helios_db`) is a comprehensive PostgreSQL database containing one of the most extensive collections of classical Greek and Latin literature ever assembled in a modern digital format. This database serves as the foundation for the Helios project, providing access to over 800,000 text segments from classical antiquity.

## Database Statistics

- **Total Authors**: 97 classical authors
- **Total Works**: 1,596 literary works
- **Total Text Entries**: 815,862 individual text segments
- **Languages Supported**: Greek (grc), English (eng), Latin (lat), French (fre), German (ger), Italian (ita)
- **Time Period**: From Homer (8th century BCE) to Byzantine scholars (15th century CE)

## Database Schema

### Core Tables

#### 1. Authors (`authors`)
Represents classical authors with comprehensive biographical information.

```sql
CREATE TABLE authors (
  id          VARCHAR PRIMARY KEY,
  tlgId       VARCHAR UNIQUE,           -- Thesaurus Linguae Graecae ID (e.g., "tlg0001")
  name        VARCHAR NOT NULL,         -- Author's name
  fullName    VARCHAR,                  -- Full name with titles
  birthDate   VARCHAR,                  -- Approximate birth date (e.g., "c. 480 BCE")
  deathDate   VARCHAR,                  -- Approximate death date (e.g., "c. 406 BCE")
  period      VARCHAR,                  -- Historical period (e.g., "Classical", "Hellenistic")
  genre       VARCHAR,                  -- Primary genre (e.g., "Tragedy", "Philosophy", "History")
  nationality VARCHAR,                  -- Nationality/region (e.g., "Athenian", "Sicilian")
  biography   TEXT,                     -- Brief biographical information
  notes       TEXT,                     -- Additional notes
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

#### 2. Works (`works`)
Represents individual literary works by authors.

```sql
CREATE TABLE works (
  id             VARCHAR PRIMARY KEY,
  tlgId          VARCHAR NOT NULL,      -- Work ID within author's corpus (e.g., "tlg001")
  title          VARCHAR NOT NULL,      -- Work title
  originalTitle  VARCHAR,               -- Title in original language
  authorId       VARCHAR NOT NULL,      -- Reference to authors.id
  genre          VARCHAR,               -- Genre of this specific work
  period         VARCHAR,               -- When this work was written
  language       VARCHAR NOT NULL,      -- Primary language (e.g., "grc", "lat")
  isComplete     BOOLEAN DEFAULT FALSE, -- Whether the work is complete or fragmentary
  lineCount      INTEGER NOT NULL,      -- Total number of lines/text units
  notes          TEXT,                  -- Additional notes
  createdAt      TIMESTAMP DEFAULT NOW(),
  updatedAt      TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(authorId, tlgId),
  FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE
);
```

#### 3. Texts (`texts`)
Contains the actual text content with line numbers and metadata.

```sql
CREATE TABLE texts (
  id          VARCHAR PRIMARY KEY,
  workId      VARCHAR NOT NULL,         -- Reference to works.id
  language    VARCHAR NOT NULL,         -- Language of this text (e.g., "grc", "lat")
  contentType VARCHAR NOT NULL,         -- Type of content (e.g., "line", "paragraph", "chapter")
  lineNumber  VARCHAR,                  -- Line number or reference (e.g., "1", "1.1", "Book 1")
  content     TEXT NOT NULL,            -- The actual text content
  metadata    JSONB,                    -- Additional metadata (manuscript info, editorial notes)
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(workId, language, lineNumber),
  FOREIGN KEY (workId) REFERENCES works(id) ON DELETE CASCADE
);
```

#### 4. Translations (`translations`)
Represents translations of works in multiple languages.

```sql
CREATE TABLE translations (
  id              VARCHAR PRIMARY KEY,
  workId          VARCHAR NOT NULL,     -- Reference to works.id
  language        VARCHAR NOT NULL,     -- Target language (e.g., "eng", "fre", "ger")
  translator      VARCHAR,              -- Name of translator
  translationDate VARCHAR,              -- When this translation was made
  edition         VARCHAR,              -- Edition information
  publisher       VARCHAR,              -- Publisher information
  notes           TEXT,                 -- Additional notes
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(workId, language),
  FOREIGN KEY (workId) REFERENCES works(id) ON DELETE CASCADE
);
```

#### 5. Collections (`collections`)
For organizing works into thematic collections.

```sql
CREATE TABLE collections (
  id          VARCHAR PRIMARY KEY,
  name        VARCHAR NOT NULL,         -- Collection name
  description TEXT,                     -- Collection description
  type        VARCHAR NOT NULL,         -- Type of collection (e.g., "genre", "period", "theme")
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

#### 6. CollectionWorks (`collection_works`)
Junction table linking collections and works.

```sql
CREATE TABLE collection_works (
  id           VARCHAR PRIMARY KEY,
  collectionId VARCHAR NOT NULL,        -- Reference to collections.id
  workId       VARCHAR NOT NULL,        -- Reference to works.id
  order        INTEGER,                 -- Order within the collection
  createdAt    TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(collectionId, workId),
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (workId) REFERENCES works(id) ON DELETE CASCADE
);
```

#### 7. SearchIndex (`search_index`)
Full-text search index for content discovery.

```sql
CREATE TABLE search_index (
  id           VARCHAR PRIMARY KEY,
  workId       VARCHAR NOT NULL,        -- Reference to works.id
  textId       VARCHAR,                 -- Reference to texts.id (optional)
  content      TEXT NOT NULL,           -- Searchable content
  language     VARCHAR NOT NULL,        -- Language of the content
  searchVector TSVECTOR,                -- PostgreSQL full-text search vector
  createdAt    TIMESTAMP DEFAULT NOW(),
  updatedAt    TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (workId) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (textId) REFERENCES texts(id) ON DELETE CASCADE
);
```

## Content Overview

### Major Authors and Works

#### Epic Poetry
- **Homer** (tlg0012): Iliad, Odyssey
- **Apollonius Rhodius** (tlg0001): Argonautica
- **Nonnus** (tlg2045): Dionysiaca
- **Quintus Smyrnaeus** (tlg2046): Fall of Troy

#### Tragedy
- **Aeschylus** (tlg0003): Oresteia, Prometheus Bound, Seven Against Thebes
- **Sophocles** (tlg0011): Oedipus Rex, Antigone, Electra
- **Euripides** (tlg0006): Medea, Bacchae, Trojan Women

#### Philosophy
- **Plato** (tlg0059): Republic, Symposium, Phaedo, Apology, Crito
- **Aristotle** (tlg0086): Nicomachean Ethics, Politics, Poetics, Metaphysics
- **Xenophon** (tlg0032): Memorabilia, Anabasis, Cyropaedia

#### History
- **Herodotus** (tlg0543): Histories
- **Thucydides** (tlg0003): History of the Peloponnesian War
- **Diodorus Siculus** (tlg0060): Historical Library
- **Josephus** (tlg0526): Jewish Antiquities, Jewish War

#### Oratory
- **Demosthenes** (tlg0284): Philippics, Olynthiacs
- **Lysias** (tlg0540): Funeral Oration, Against Eratosthenes
- **Aeschines** (tlg0004): Against Ctesiphon

#### Comedy
- **Aristophanes** (tlg0007): Lysistrata, Birds, Clouds, Frogs

#### Lyric Poetry
- **Pindar** (tlg0033): Olympian, Pythian, Nemean, Isthmian Odes
- **Bacchylides** (tlg0199): Epinicians, Dithyrambs

#### Medical and Scientific
- **Hippocrates** (tlg0627): Aphorisms, Prognosticon, Airs Waters Places
- **Euclid** (tlg1799): Elements
- **Ptolemy** (tlg0363): Tetrabiblos

#### Biblical and Early Christian
- **Septuagint** (tlg0527): Complete Old Testament in Greek
- **Clement of Rome** (tlg1271): First and Second Epistles to Corinthians
- **Ignatius of Antioch** (tlg1443): Epistles

### Language Distribution

- **Greek (grc)**: Primary source texts, ~60% of content
- **English (eng)**: Modern translations, ~30% of content
- **Latin (lat)**: Classical Latin works, ~5% of content
- **Other languages**: French, German, Italian translations, ~5% of content

## Query Examples

### Basic Queries

#### Find Author Information
```sql
-- Get Plato's complete information
SELECT * FROM authors WHERE name = 'Plato';

-- Find authors by period
SELECT name, genre, nationality 
FROM authors 
WHERE period = 'Classical' 
ORDER BY name;
```

#### Find Works by Author
```sql
-- Get all works by Plato
SELECT w.title, w.genre, w.language, w.lineCount
FROM works w
JOIN authors a ON w.author_id = a.id
WHERE a.name = 'Plato'
ORDER BY w.title;

-- Count works by genre for a specific author
SELECT w.genre, COUNT(*) as work_count
FROM works w
JOIN authors a ON w.author_id = a.id
WHERE a.name = 'Aristotle'
GROUP BY w.genre;
```

#### Text Content Queries
```sql
-- Get specific text content from Plato's Republic
SELECT t.lineNumber, t.content, t.contentType
FROM texts t
JOIN works w ON t.work_id = w.id
JOIN authors a ON w.author_id = a.id
WHERE a.name = 'Plato' 
  AND w.title = 'Republic'
  AND t.language = 'grc'
ORDER BY t.lineNumber
LIMIT 20;

-- Search for specific Greek text
SELECT w.title, a.name, t.content, t.lineNumber
FROM texts t
JOIN works w ON t.work_id = w.id
JOIN authors a ON w.author_id = a.id
WHERE t.content ILIKE '%Ἀθῆναι%'
  AND t.language = 'grc'
LIMIT 10;
```

#### Translation Queries
```sql
-- Find works with English translations
SELECT w.title, a.name, t.language, t.translator
FROM translations t
JOIN works w ON t.work_id = w.id
JOIN authors a ON w.author_id = a.id
WHERE t.language = 'eng'
ORDER BY a.name, w.title;
```

### Advanced Queries

#### Full-Text Search
```sql
-- Search for works containing specific concepts
SELECT w.title, a.name, t.content
FROM texts t
JOIN works w ON t.work_id = w.id
JOIN authors a ON w.author_id = a.id
WHERE to_tsvector('greek', t.content) @@ plainto_tsquery('greek', 'δικαιοσύνη')
  AND t.language = 'grc'
LIMIT 10;
```

#### Statistical Analysis
```sql
-- Author productivity by line count
SELECT a.name, 
       COUNT(w.id) as work_count,
       SUM(w.lineCount) as total_lines,
       AVG(w.lineCount) as avg_lines_per_work
FROM authors a
JOIN works w ON a.id = w.author_id
GROUP BY a.id, a.name
ORDER BY total_lines DESC
LIMIT 20;

-- Genre distribution across periods
SELECT a.period, w.genre, COUNT(*) as work_count
FROM works w
JOIN authors a ON w.author_id = a.id
WHERE a.period IS NOT NULL AND w.genre IS NOT NULL
GROUP BY a.period, w.genre
ORDER BY a.period, work_count DESC;
```

#### Complex Relationships
```sql
-- Find works that appear in multiple collections
SELECT w.title, a.name, COUNT(cw.collection_id) as collection_count
FROM works w
JOIN authors a ON w.author_id = a.id
JOIN collection_works cw ON w.id = cw.work_id
GROUP BY w.id, w.title, a.name
HAVING COUNT(cw.collection_id) > 1
ORDER BY collection_count DESC;
```

## Database Maintenance

### Backup and Restore
```bash
# Create backup
pg_dump helios_db > helios_backup_$(date +%Y%m%d).sql

# Restore from backup
psql -d helios_db < helios_backup_20241210.sql
```

### Performance Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_texts_work_language ON texts(work_id, language);
CREATE INDEX idx_works_author_genre ON works(author_id, genre);
CREATE INDEX idx_authors_period_genre ON authors(period, genre);

-- Analyze table statistics
ANALYZE authors;
ANALYZE works;
ANALYZE texts;
```

### Data Integrity
```sql
-- Check for orphaned records
SELECT 'orphaned texts' as issue, COUNT(*) as count
FROM texts t
LEFT JOIN works w ON t.work_id = w.id
WHERE w.id IS NULL

UNION ALL

SELECT 'orphaned works' as issue, COUNT(*) as count
FROM works w
LEFT JOIN authors a ON w.author_id = a.id
WHERE a.id IS NULL;
```

## API Integration

### Prisma Client Usage
```typescript
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Find author with works
const author = await prisma.author.findUnique({
  where: { name: 'Plato' },
  include: {
    works: {
      include: {
        texts: {
          where: { language: 'grc' },
          orderBy: { lineNumber: 'asc' }
        }
      }
    }
  }
});

// Search texts
const searchResults = await prisma.text.findMany({
  where: {
    content: { contains: 'justice', mode: 'insensitive' },
    language: 'grc'
  },
  include: {
    work: {
      include: { author: true }
    }
  },
  take: 20
});
```

## Content Quality Notes

### Text Processing
- All texts have been extracted from TEI XML files
- Line numbers are preserved where available
- Paragraphs without line numbers are assigned sequential identifiers
- Metadata includes source file information and editorial notes

### Language Variants
- Greek texts use Unicode encoding for proper character display
- Multiple translation versions are available for major works
- Language codes follow ISO 639-2 standard (grc, eng, lat, etc.)

### Completeness
- Some works are fragmentary due to manuscript preservation
- Line counts represent available text, not original composition
- Missing sections are noted in metadata where applicable

## Future Enhancements

### Planned Features
- **Search Index Optimization**: Full-text search vectors for all languages
- **Citation System**: Standardized reference formats (LSJ, TLG, etc.)
- **Manuscript Information**: Additional metadata about source manuscripts
- **Cross-References**: Links between related passages and works
- **User Annotations**: Personal notes and highlights system

### Data Expansion
- **Latin Literature**: Expansion of Latin corpus
- **Byzantine Texts**: Additional medieval Greek works
- **Modern Translations**: Contemporary language versions
- **Commentary**: Scholarly commentary and annotations

## Support and Maintenance

### Database Connection
```bash
# Connection string format
DATABASE_URL="postgresql://username@localhost:5432/helios_db"

# Environment variables
NODE_ENV=development
DATABASE_URL=postgresql://nastemko@localhost:5432/helios_db
```

### Monitoring
- Regular backup schedules
- Performance monitoring and optimization
- Data integrity checks
- Usage analytics and reporting

---

*This database represents a significant achievement in digital humanities, bringing classical literature into the modern digital age with comprehensive metadata, searchability, and accessibility for scholars, students, and enthusiasts worldwide.*
