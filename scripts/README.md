# Helios Text Extraction and Database Import

This directory contains scripts for extracting Greek and Latin literature from the Perseus Digital Library and importing it into a PostgreSQL database for the Helios project.

## Overview

The Helios project aims to create a comprehensive digital library of classical Greek and Latin literature. This process involves:

1. **Text Extraction**: Parsing XML files from the Perseus Digital Library
2. **Database Schema**: Creating a structured database to store authors, works, and texts
3. **Data Import**: Populating the database with extracted classical literature

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Access to the `canonical-greekLit` repository

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database connection in the `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/helios_db"
```

## Usage

### Step 1: Extract Texts from XML

Extract Greek literature texts from the Perseus XML files:

```bash
npm run extract
```

This script will:
- Parse all XML files in the `canonical-greekLit/data` directory
- Extract text content, metadata, and translations
- Save extracted texts to `../data/extracted-texts/`
- Generate a summary file with extraction statistics

**Output**: Approximately 1.3GB of extracted texts from 97 authors and 1,596 works.

### Step 2: Set Up Database

Create the database schema and tables:

```bash
npm run setup-db
```

This script will:
- Create a Prisma migration for the initial schema
- Set up all necessary database tables
- Generate the Prisma client

### Step 3: Import Data to Database

Import the extracted texts into the database:

```bash
npm run import
```

This script will:
- Read the extraction summary
- Create/update author records with biographical information
- Create/update work records with metadata
- Import all text content with proper line numbering
- Handle translations and multiple language versions

## Database Schema

The database includes the following models:

### Author
- **tlgId**: Thesaurus Linguae Graecae identifier
- **name**: Author's name
- **fullName**: Complete name/title
- **period**: Historical period (Archaic, Classical, Hellenistic, Imperial, Byzantine)
- **genre**: Primary literary genre
- **nationality**: Geographic origin
- **biography**: Brief biographical information

### Work
- **tlgId**: Work identifier within author's corpus
- **title**: Work title
- **originalTitle**: Title in original language
- **genre**: Specific genre of this work
- **period**: When the work was written
- **language**: Primary language (grc, lat, eng, etc.)
- **lineCount**: Total number of lines/text units
- **isComplete**: Whether the work is complete or fragmentary

### Text
- **content**: Actual text content
- **language**: Language of this text
- **contentType**: Type of content (line, paragraph, chapter)
- **lineNumber**: Line number or reference
- **metadata**: Additional information (manuscript info, editorial notes)

### Translation
- **language**: Target language
- **translator**: Name of translator
- **translationDate**: When translation was made
- **edition**: Edition information
- **publisher**: Publisher information

### Collection
- **name**: Collection name
- **description**: Collection description
- **type**: Type of collection (genre, period, theme)

### SearchIndex
- **content**: Searchable text content
- **searchVector**: PostgreSQL full-text search vector
- **language**: Language of the content

## Extracted Content

The extraction process covers:

### Major Authors
- **Homer** (Iliad, Odyssey)
- **Plato** (Republic, Symposium, Phaedo, etc.)
- **Aristotle** (Nicomachean Ethics, Politics, Poetics, etc.)
- **Aeschylus** (Oresteia, Prometheus Bound, etc.)
- **Sophocles** (Oedipus Rex, Antigone, etc.)
- **Euripides** (Medea, Bacchae, etc.)
- **Herodotus** (Histories)
- **Thucydides** (Peloponnesian War)
- **Xenophon** (Anabasis, Memorabilia, etc.)
- **Demosthenes** (Philippics, Olynthiacs, etc.)

### Literary Genres
- **Epic Poetry**: Homer, Hesiod, Apollonius Rhodius
- **Tragedy**: Aeschylus, Sophocles, Euripides
- **Comedy**: Aristophanes
- **Philosophy**: Plato, Aristotle, Epictetus, Marcus Aurelius
- **History**: Herodotus, Thucydides, Xenophon, Diodorus Siculus
- **Oratory**: Demosthenes, Aeschines, Lysias, Isocrates
- **Lyric Poetry**: Pindar, Bacchylides, Sappho
- **Novels**: Longus, Achilles Tatius, Xenophon of Ephesus

### Religious Texts
- **New Testament** (Greek)
- **Septuagint** (Greek translation of Hebrew Bible)
- **Early Christian Writings**: Clement, Ignatius, Polycarp

### Scientific Works
- **Medicine**: Hippocrates, Galen
- **Mathematics**: Euclid, Ptolemy
- **Geography**: Strabo, Pausanias
- **Astronomy**: Ptolemy, Aratus

## File Structure

```
scripts/
├── extract-greek-texts.js    # Main extraction script
├── import-to-database.js     # Database import script
├── setup-database.js         # Database setup script
├── package.json              # Dependencies and scripts
└── README.md                 # This file

../data/extracted-texts/
├── extraction-summary.json   # Summary of all extracted content
├── tlg0001/                 # Author directory (Apollonius Rhodius)
│   ├── tlg001.json         # Individual work files
│   └── ...
├── tlg0003/                 # Author directory (Aeschylus)
│   ├── tlg001.json         # Individual work files
│   └── ...
└── ...
```

## Performance Notes

- **Extraction**: Takes approximately 5-10 minutes for 1,596 works
- **Database Import**: Takes approximately 10-15 minutes for full dataset
- **Memory Usage**: Extraction uses streaming to handle large XML files
- **Storage**: Extracted texts require ~1.3GB, database will be larger

## Troubleshooting

### Common Issues

1. **Memory Errors**: The extraction script uses streaming to handle large files
2. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
3. **XML Parsing**: Some XML files may have encoding issues; the script handles these gracefully

### Error Recovery

- If extraction fails, delete the `extracted-texts` directory and restart
- If import fails, the database can be reset and import restarted
- Check logs for specific error messages

## Next Steps

After successful import:

1. **Verify Data**: Check that all authors, works, and texts are imported
2. **Create Indexes**: Add database indexes for better query performance
3. **Build API**: Create REST endpoints for accessing the literature
4. **Search Interface**: Implement full-text search functionality
5. **User Interface**: Build web interface for browsing and reading

## Contributing

To add new authors or works:

1. Update the `extractAuthorInfo` function in `import-to-database.js`
2. Add new TLG IDs and author information
3. Re-run the extraction and import process

## License

MIT License - see project root for details.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error logs
3. Ensure all prerequisites are met
4. Verify database connectivity and permissions
