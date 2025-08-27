const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../src/generated/prisma');

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const EXTRACTED_TEXTS_DIR = path.join(__dirname, '../data/extracted-texts');
const SUMMARY_FILE = path.join(EXTRACTED_TEXTS_DIR, 'extraction-summary.json');

// Helper function to extract author information from TLG ID
function extractAuthorInfo(tlgId) {
    // Map of known authors with their information
    const authorMap = {
        'tlg0001': {
            name: 'Apollonius Rhodius',
            fullName: 'Apollonius Rhodius',
            period: 'Hellenistic',
            genre: 'Epic Poetry',
            nationality: 'Alexandrian',
            biography: 'Hellenistic epic poet, author of the Argonautica'
        },
        'tlg0003': {
            name: 'Aeschylus',
            fullName: 'Aeschylus',
            period: 'Classical',
            genre: 'Tragedy',
            nationality: 'Athenian',
            biography: 'Father of Greek tragedy, author of Oresteia and other plays'
        },
        'tlg0004': {
            name: 'Aeschines',
            fullName: 'Aeschines',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator and rival of Demosthenes'
        },
        'tlg0005': {
            name: 'Andocides',
            fullName: 'Andocides',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator and politician'
        },
        'tlg0006': {
            name: 'Antiphon',
            fullName: 'Antiphon',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator and sophist'
        },
        'tlg0007': {
            name: 'Aristophanes',
            fullName: 'Aristophanes',
            period: 'Classical',
            genre: 'Comedy',
            nationality: 'Athenian',
            biography: 'Greatest writer of Old Comedy, author of Lysistrata, Birds, etc.'
        },
        'tlg0008': {
            name: 'Aristotle',
            fullName: 'Aristotle',
            period: 'Classical',
            genre: 'Philosophy',
            nationality: 'Macedonian/Athenian',
            biography: 'Student of Plato, founder of the Lyceum, author of Nicomachean Ethics, Politics, etc.'
        },
        'tlg0010': {
            name: 'Demosthenes',
            fullName: 'Demosthenes',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Greatest Athenian orator, known for his Philippics against Philip of Macedon'
        },
        'tlg0011': {
            name: 'Dinarchus',
            fullName: 'Dinarchus',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Corinthian/Athenian',
            biography: 'Athenian orator, one of the ten Attic orators'
        },
        'tlg0012': {
            name: 'Euripides',
            fullName: 'Euripides',
            period: 'Classical',
            genre: 'Tragedy',
            nationality: 'Athenian',
            biography: 'Tragic playwright, author of Medea, Bacchae, etc.'
        },
        'tlg0013': {
            name: 'Herodotus',
            fullName: 'Herodotus',
            period: 'Classical',
            genre: 'History',
            nationality: 'Halicarnassian',
            biography: 'Father of History, author of the Histories'
        },
        'tlg0014': {
            name: 'Hesiod',
            fullName: 'Hesiod',
            period: 'Archaic',
            genre: 'Epic Poetry',
            nationality: 'Boeotian',
            biography: 'Early Greek poet, author of Theogony and Works and Days'
        },
        'tlg0016': {
            name: 'Homer',
            fullName: 'Homer',
            period: 'Archaic',
            genre: 'Epic Poetry',
            nationality: 'Ionian',
            biography: 'Author of the Iliad and Odyssey, foundational works of Western literature'
        },
        'tlg0017': {
            name: 'Isaeus',
            fullName: 'Isaeus',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator, specialist in inheritance cases'
        },
        'tlg0019': {
            name: 'Lysias',
            fullName: 'Lysias',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Syracusan/Athenian',
            biography: 'Athenian orator, known for his clear and simple style'
        },
        'tlg0020': {
            name: 'Lysias',
            fullName: 'Lysias',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Syracusan/Athenian',
            biography: 'Athenian orator, known for his clear and simple style'
        },
        'tlg0023': {
            name: 'Oppian',
            fullName: 'Oppian',
            period: 'Imperial',
            genre: 'Didactic Poetry',
            nationality: 'Cilician',
            biography: 'Author of didactic poems on fishing and hunting'
        },
        'tlg0024': {
            name: 'Oppian',
            fullName: 'Oppian',
            period: 'Imperial',
            genre: 'Didactic Poetry',
            nationality: 'Cilician',
            biography: 'Author of didactic poems on fishing and hunting'
        },
        'tlg0026': {
            name: 'Demosthenes',
            fullName: 'Demosthenes',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Greatest Athenian orator, known for his Philippics against Philip of Macedon'
        },
        'tlg0027': {
            name: 'Andocides',
            fullName: 'Andocides',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator and politician'
        },
        'tlg0028': {
            name: 'Antiphon',
            fullName: 'Antiphon',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator and sophist'
        },
        'tlg0029': {
            name: 'Dinarchus',
            fullName: 'Dinarchus',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Corinthian/Athenian',
            biography: 'Athenian orator, one of the ten Attic orators'
        },
        'tlg0030': {
            name: 'Hyperides',
            fullName: 'Hyperides',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator, one of the ten Attic orators'
        },
        'tlg0031': {
            name: 'New Testament',
            fullName: 'New Testament',
            period: 'Imperial',
            genre: 'Religious',
            nationality: 'Christian',
            biography: 'Collection of early Christian writings'
        },
        'tlg0032': {
            name: 'Xenophon',
            fullName: 'Xenophon',
            period: 'Classical',
            genre: 'History/Philosophy',
            nationality: 'Athenian',
            biography: 'Athenian historian, philosopher, and soldier'
        },
        'tlg0033': {
            name: 'Pindar',
            fullName: 'Pindar',
            period: 'Classical',
            genre: 'Lyric Poetry',
            nationality: 'Theban',
            biography: 'Greatest lyric poet of ancient Greece, author of victory odes'
        },
        'tlg0034': {
            name: 'Lycurgus',
            fullName: 'Lycurgus',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Athenian orator and statesman'
        },
        'tlg0035': {
            name: 'Moschus',
            fullName: 'Moschus',
            period: 'Hellenistic',
            genre: 'Bucolic Poetry',
            nationality: 'Syracusan',
            biography: 'Bucolic poet, imitator of Theocritus'
        },
        'tlg0036': {
            name: 'Bion',
            fullName: 'Bion',
            period: 'Hellenistic',
            genre: 'Bucolic Poetry',
            nationality: 'Smyrnaean',
            biography: 'Bucolic poet, contemporary of Theocritus'
        },
        'tlg0057': {
            name: 'Galen',
            fullName: 'Galen',
            period: 'Imperial',
            genre: 'Medicine',
            nationality: 'Pergamene',
            biography: 'Renowned physician and medical writer'
        },
        'tlg0058': {
            name: 'Aeneas Tacticus',
            fullName: 'Aeneas Tacticus',
            period: 'Classical',
            genre: 'Military',
            nationality: 'Stymphalian',
            biography: 'Author of military treatise on siege warfare'
        },
        'tlg0059': {
            name: 'Plato',
            fullName: 'Plato',
            period: 'Classical',
            genre: 'Philosophy',
            nationality: 'Athenian',
            biography: 'Student of Socrates, founder of the Academy, author of Republic, Symposium, etc.'
        },
        'tlg0060': {
            name: 'Diodorus Siculus',
            fullName: 'Diodorus Siculus',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Sicilian',
            biography: 'Greek historian, author of the Bibliotheca historica'
        },
        'tlg0061': {
            name: 'Lucian',
            fullName: 'Lucian',
            period: 'Imperial',
            genre: 'Satire',
            nationality: 'Syrian',
            biography: 'Satirist and rhetorician, author of True History and other works'
        },
        'tlg0062': {
            name: 'Lucian',
            fullName: 'Lucian',
            period: 'Imperial',
            genre: 'Satire',
            nationality: 'Syrian',
            biography: 'Satirist and rhetorician, author of True History and other works'
        },
        'tlg0074': {
            name: 'Arrian',
            fullName: 'Arrian',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Nicomedian',
            biography: 'Greek historian and philosopher, author of Anabasis of Alexander'
        },
        'tlg0081': {
            name: 'Dionysius of Halicarnassus',
            fullName: 'Dionysius of Halicarnassus',
            period: 'Imperial',
            genre: 'History/Criticism',
            nationality: 'Halicarnassian',
            biography: 'Greek historian and rhetorician'
        },
        'tlg0085': {
            name: 'Aeschylus',
            fullName: 'Aeschylus',
            period: 'Classical',
            genre: 'Tragedy',
            nationality: 'Athenian',
            biography: 'Father of Greek tragedy, author of Oresteia and other plays'
        },
        'tlg0086': {
            name: 'Aristotle',
            fullName: 'Aristotle',
            period: 'Classical',
            genre: 'Philosophy',
            nationality: 'Macedonian/Athenian',
            biography: 'Student of Plato, founder of the Lyceum, author of Nicomachean Ethics, Politics, etc.'
        },
        'tlg0090': {
            name: 'Theophrastus',
            fullName: 'Theophrastus',
            period: 'Classical',
            genre: 'Philosophy',
            nationality: 'Eresian',
            biography: 'Student of Aristotle, successor as head of the Lyceum'
        },
        'tlg0093': {
            name: 'Theophrastus',
            fullName: 'Theophrastus',
            period: 'Classical',
            genre: 'Philosophy',
            nationality: 'Eresian',
            biography: 'Student of Aristotle, successor as head of the Lyceum'
        },
        'tlg0094': {
            name: 'Pseudo-Plutarch',
            fullName: 'Pseudo-Plutarch',
            period: 'Imperial',
            genre: 'Philosophy',
            nationality: 'Unknown',
            biography: 'Author of works attributed to Plutarch'
        },
        'tlg0099': {
            name: 'Strabo',
            fullName: 'Strabo',
            period: 'Imperial',
            genre: 'Geography',
            nationality: 'Amaseian',
            biography: 'Greek geographer, philosopher, and historian'
        },
        'tlg0199': {
            name: 'Bacchylides',
            fullName: 'Bacchylides',
            period: 'Classical',
            genre: 'Lyric Poetry',
            nationality: 'Cean',
            biography: 'Lyric poet, contemporary of Pindar'
        },
        'tlg0284': {
            name: 'Demosthenes',
            fullName: 'Demosthenes',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Athenian',
            biography: 'Greatest Athenian orator, known for his Philippics against Philip of Macedon'
        },
        'tlg0341': {
            name: 'Lycophron',
            fullName: 'Lycophron',
            period: 'Hellenistic',
            genre: 'Poetry',
            nationality: 'Chalcidian',
            biography: 'Hellenistic poet and grammarian'
        },
        'tlg0363': {
            name: 'Ptolemy',
            fullName: 'Ptolemy',
            period: 'Imperial',
            genre: 'Astronomy',
            nationality: 'Alexandrian',
            biography: 'Astronomer, mathematician, and geographer'
        },
        'tlg0385': {
            name: 'Cassius Dio',
            fullName: 'Cassius Dio',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Nicaean',
            biography: 'Roman historian, author of Roman History'
        },
        'tlg0525': {
            name: 'Pausanias',
            fullName: 'Pausanias',
            period: 'Imperial',
            genre: 'Geography',
            nationality: 'Lydian',
            biography: 'Greek traveler and geographer, author of Description of Greece'
        },
        'tlg0526': {
            name: 'Josephus',
            fullName: 'Flavius Josephus',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Judean',
            biography: 'Jewish historian and military leader'
        },
        'tlg0527': {
            name: 'Septuagint',
            fullName: 'Septuagint',
            period: 'Hellenistic',
            genre: 'Religious',
            nationality: 'Jewish',
            biography: 'Greek translation of the Hebrew Bible'
        },
        'tlg0532': {
            name: 'Achilles Tatius',
            fullName: 'Achilles Tatius',
            period: 'Imperial',
            genre: 'Novel',
            nationality: 'Alexandrian',
            biography: 'Author of the novel Leucippe and Clitophon'
        },
        'tlg0533': {
            name: 'Callimachus',
            fullName: 'Callimachus',
            period: 'Hellenistic',
            genre: 'Poetry',
            nationality: 'Cyrenian',
            biography: 'Hellenistic poet and scholar'
        },
        'tlg0535': {
            name: 'Callimachus',
            fullName: 'Callimachus',
            period: 'Hellenistic',
            genre: 'Poetry',
            nationality: 'Cyrenian',
            biography: 'Hellenistic poet and scholar'
        },
        'tlg0540': {
            name: 'Lysias',
            fullName: 'Lysias',
            period: 'Classical',
            genre: 'Oratory',
            nationality: 'Syracusan/Athenian',
            biography: 'Athenian orator, known for his clear and simple style'
        },
        'tlg0543': {
            name: 'Herodotus',
            fullName: 'Herodotus',
            period: 'Classical',
            genre: 'History',
            nationality: 'Halicarnassian',
            biography: 'Father of History, author of the Histories'
        },
        'tlg0545': {
            name: 'Aelian',
            fullName: 'Aelian',
            period: 'Imperial',
            genre: 'Natural History',
            nationality: 'Praenestine',
            biography: 'Roman author and rhetorician'
        },
        'tlg0548': {
            name: 'Apollodorus',
            fullName: 'Apollodorus',
            period: 'Imperial',
            genre: 'Mythography',
            nationality: 'Athenian',
            biography: 'Author of the Bibliotheca, a compendium of Greek mythology'
        },
        'tlg0551': {
            name: 'Diodorus Siculus',
            fullName: 'Diodorus Siculus',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Sicilian',
            biography: 'Greek historian, author of the Bibliotheca historica'
        },
        'tlg0554': {
            name: 'Diodorus Siculus',
            fullName: 'Diodorus Siculus',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Sicilian',
            biography: 'Greek historian, author of the Bibliotheca historica'
        },
        'tlg0555': {
            name: 'Clement of Alexandria',
            fullName: 'Clement of Alexandria',
            period: 'Imperial',
            genre: 'Christian Theology',
            nationality: 'Alexandrian',
            biography: 'Christian theologian and philosopher'
        },
        'tlg0556': {
            name: 'Aelian',
            fullName: 'Aelian',
            period: 'Imperial',
            genre: 'Military',
            nationality: 'Praenestine',
            biography: 'Roman author and rhetorician'
        },
        'tlg0557': {
            name: 'Epictetus',
            fullName: 'Epictetus',
            period: 'Imperial',
            genre: 'Philosophy',
            nationality: 'Phrygian',
            biography: 'Stoic philosopher, author of Discourses and Enchiridion'
        },
        'tlg0560': {
            name: 'Longinus',
            fullName: 'Longinus',
            period: 'Imperial',
            genre: 'Literary Criticism',
            nationality: 'Unknown',
            biography: 'Author of On the Sublime'
        },
        'tlg0561': {
            name: 'Longus',
            fullName: 'Longus',
            period: 'Imperial',
            genre: 'Novel',
            nationality: 'Lesbian',
            biography: 'Author of the novel Daphnis and Chloe'
        },
        'tlg0562': {
            name: 'Marcus Aurelius',
            fullName: 'Marcus Aurelius',
            period: 'Imperial',
            genre: 'Philosophy',
            nationality: 'Roman',
            biography: 'Roman emperor and Stoic philosopher, author of Meditations'
        },
        'tlg0612': {
            name: 'Libanius',
            fullName: 'Libanius',
            period: 'Imperial',
            genre: 'Oratory',
            nationality: 'Antiochian',
            biography: 'Greek sophist and rhetorician'
        },
        'tlg0613': {
            name: 'Libanius',
            fullName: 'Libanius',
            period: 'Imperial',
            genre: 'Oratory',
            nationality: 'Antiochian',
            biography: 'Greek sophist and rhetorician'
        },
        'tlg0627': {
            name: 'Hippocrates',
            fullName: 'Hippocrates',
            period: 'Classical',
            genre: 'Medicine',
            nationality: 'Cosian',
            biography: 'Father of Medicine, author of the Hippocratic Corpus'
        },
        'tlg0638': {
            name: 'Philostratus',
            fullName: 'Philostratus',
            period: 'Imperial',
            genre: 'Biography',
            nationality: 'Lemnian',
            biography: 'Greek sophist and author'
        },
        'tlg0641': {
            name: 'Xenophon of Ephesus',
            fullName: 'Xenophon of Ephesus',
            period: 'Imperial',
            genre: 'Novel',
            nationality: 'Ephesian',
            biography: 'Author of the novel Ephesiaca'
        },
        'tlg0646': {
            name: 'Epistle to Diognetus',
            fullName: 'Epistle to Diognetus',
            period: 'Imperial',
            genre: 'Christian Apologetics',
            nationality: 'Christian',
            biography: 'Early Christian apologetic work'
        },
        'tlg0647': {
            name: 'Tryphiodorus',
            fullName: 'Tryphiodorus',
            period: 'Imperial',
            genre: 'Epic Poetry',
            nationality: 'Egyptian',
            biography: 'Greek epic poet'
        },
        'tlg0648': {
            name: 'Onasander',
            fullName: 'Onasander',
            period: 'Imperial',
            genre: 'Military',
            nationality: 'Unknown',
            biography: 'Author of military treatise Strategikos'
        },
        'tlg0652': {
            name: 'Philostratus the Younger',
            fullName: 'Philostratus the Younger',
            period: 'Imperial',
            genre: 'Biography',
            nationality: 'Lemnian',
            biography: 'Greek sophist and author, son of Philostratus'
        },
        'tlg0653': {
            name: 'Aratus',
            fullName: 'Aratus',
            period: 'Hellenistic',
            genre: 'Didactic Poetry',
            nationality: 'Soli',
            biography: 'Greek didactic poet, author of Phaenomena'
        },
        'tlg0655': {
            name: 'Parthenius',
            fullName: 'Parthenius',
            period: 'Hellenistic',
            genre: 'Poetry',
            nationality: 'Nicaean',
            biography: 'Greek poet and grammarian'
        },
        'tlg0719': {
            name: 'Caelius Aurelianus',
            fullName: 'Caelius Aurelianus',
            period: 'Imperial',
            genre: 'Medicine',
            nationality: 'Roman',
            biography: 'Roman physician and medical writer'
        },
        'tlg1216': {
            name: 'Epistle of Barnabas',
            fullName: 'Epistle of Barnabas',
            period: 'Imperial',
            genre: 'Christian Epistle',
            nationality: 'Christian',
            biography: 'Early Christian epistle'
        },
        'tlg1271': {
            name: 'Clement of Rome',
            fullName: 'Clement of Rome',
            period: 'Imperial',
            genre: 'Christian Epistle',
            nationality: 'Christian',
            biography: 'Early Christian bishop and author'
        },
        'tlg1311': {
            name: 'Didache',
            fullName: 'Didache',
            period: 'Imperial',
            genre: 'Christian Manual',
            nationality: 'Christian',
            biography: 'Early Christian manual of church discipline'
        },
        'tlg1389': {
            name: 'Harpocration',
            fullName: 'Harpocration',
            period: 'Imperial',
            genre: 'Lexicography',
            nationality: 'Alexandrian',
            biography: 'Greek lexicographer'
        },
        'tlg1419': {
            name: 'Shepherd of Hermas',
            fullName: 'Shepherd of Hermas',
            period: 'Imperial',
            genre: 'Christian Apocalypse',
            nationality: 'Christian',
            biography: 'Early Christian apocalyptic work'
        },
        'tlg1443': {
            name: 'Ignatius of Antioch',
            fullName: 'Ignatius of Antioch',
            period: 'Imperial',
            genre: 'Christian Epistle',
            nationality: 'Christian',
            biography: 'Early Christian bishop and martyr'
        },
        'tlg1484': {
            name: 'Martyrdom of Polycarp',
            fullName: 'Martyrdom of Polycarp',
            period: 'Imperial',
            genre: 'Christian Martyrdom',
            nationality: 'Christian',
            biography: 'Early Christian account of Polycarp\'s martyrdom'
        },
        'tlg1600': {
            name: 'Philostratus',
            fullName: 'Philostratus',
            period: 'Imperial',
            genre: 'Biography',
            nationality: 'Lemnian',
            biography: 'Greek sophist and author'
        },
        'tlg1622': {
            name: 'Polycarp',
            fullName: 'Polycarp',
            period: 'Imperial',
            genre: 'Christian Epistle',
            nationality: 'Christian',
            biography: 'Early Christian bishop and martyr'
        },
        'tlg1799': {
            name: 'Euclid',
            fullName: 'Euclid',
            period: 'Hellenistic',
            genre: 'Mathematics',
            nationality: 'Alexandrian',
            biography: 'Father of Geometry, author of Elements'
        },
        'tlg2003': {
            name: 'Julian',
            fullName: 'Julian the Apostate',
            period: 'Imperial',
            genre: 'Philosophy/Oratory',
            nationality: 'Roman',
            biography: 'Roman emperor and philosopher, author of various works'
        },
        'tlg2018': {
            name: 'Eusebius',
            fullName: 'Eusebius of Caesarea',
            period: 'Imperial',
            genre: 'History',
            nationality: 'Caesarean',
            biography: 'Early Christian historian and bishop'
        },
        'tlg2040': {
            name: 'Basil',
            fullName: 'Basil of Caesarea',
            period: 'Imperial',
            genre: 'Christian Theology',
            nationality: 'Caesarean',
            biography: 'Early Christian bishop and theologian'
        },
        'tlg2045': {
            name: 'Nonnus',
            fullName: 'Nonnus',
            period: 'Imperial',
            genre: 'Epic Poetry',
            nationality: 'Panopolitan',
            biography: 'Greek epic poet, author of Dionysiaca'
        },
        'tlg2046': {
            name: 'Quintus Smyrnaeus',
            fullName: 'Quintus Smyrnaeus',
            period: 'Imperial',
            genre: 'Epic Poetry',
            nationality: 'Smyrnaean',
            biography: 'Greek epic poet, author of Posthomerica'
        },
        'tlg2934': {
            name: 'John of Damascus',
            fullName: 'John of Damascus',
            period: 'Byzantine',
            genre: 'Christian Theology',
            nationality: 'Damascene',
            biography: 'Christian monk, priest, and theologian'
        },
        'tlg3135': {
            name: 'Unknown',
            fullName: 'Unknown Author',
            period: 'Unknown',
            genre: 'Unknown',
            nationality: 'Unknown',
            biography: 'Author unknown'
        },
        'tlg4029': {
            name: 'Procopius',
            fullName: 'Procopius',
            period: 'Byzantine',
            genre: 'History',
            nationality: 'Caesarean',
            biography: 'Byzantine historian and writer'
        },
        'tlg4036': {
            name: 'Unknown',
            fullName: 'Unknown Author',
            period: 'Unknown',
            genre: 'Unknown',
            nationality: 'Unknown',
            biography: 'Author unknown'
        },
        'tlg4081': {
            name: 'Colluthus',
            fullName: 'Colluthus',
            period: 'Imperial',
            genre: 'Epic Poetry',
            nationality: 'Lycian',
            biography: 'Greek epic poet'
        },
        'tlg4091': {
            name: 'Unknown',
            fullName: 'Unknown Author',
            period: 'Unknown',
            genre: 'Unknown',
            nationality: 'Unknown',
            biography: 'Author unknown'
        },
        'tlg7000': {
            name: 'Greek Anthology',
            fullName: 'Greek Anthology',
            period: 'Various',
            genre: 'Poetry',
            nationality: 'Various',
            biography: 'Collection of Greek epigrams and short poems'
        }
    };

    return authorMap[tlgId] || {
        name: `Author ${tlgId}`,
        fullName: `Author ${tlgId}`,
        period: 'Unknown',
        genre: 'Unknown',
        nationality: 'Unknown',
        biography: 'Information not available'
    };
}

// Helper function to determine genre from work title
function determineGenre(title, authorGenre) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('tragedy') || titleLower.includes('tragic')) return 'Tragedy';
    if (titleLower.includes('comedy') || titleLower.includes('comic')) return 'Comedy';
    if (titleLower.includes('epic') || titleLower.includes('iliad') || titleLower.includes('odyssey')) return 'Epic Poetry';
    if (titleLower.includes('ode') || titleLower.includes('hymn')) return 'Lyric Poetry';
    if (titleLower.includes('history') || titleLower.includes('histories')) return 'History';
    if (titleLower.includes('philosophy') || titleLower.includes('ethics') || titleLower.includes('politics')) return 'Philosophy';
    if (titleLower.includes('oratory') || titleLower.includes('speech') || titleLower.includes('oration')) return 'Oratory';
    if (titleLower.includes('medicine') || titleLower.includes('medical')) return 'Medicine';
    if (titleLower.includes('mathematics') || titleLower.includes('geometry')) return 'Mathematics';
    if (titleLower.includes('geography')) return 'Geography';
    if (titleLower.includes('novel') || titleLower.includes('romance')) return 'Novel';
    if (titleLower.includes('epistle') || titleLower.includes('letter')) return 'Epistle';
    if (titleLower.includes('gospel') || titleLower.includes('acts') || titleLower.includes('revelation')) return 'Religious';
    if (titleLower.includes('bible') || titleLower.includes('testament')) return 'Religious';
    
    return authorGenre || 'Literature';
}

// Import data into database
async function importData() {
    try {
        console.log('Starting database import...\n');
        
        // Read the extraction summary
        const summaryData = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf-8'));
        console.log(`Found ${summaryData.totalAuthors} authors with ${summaryData.totalWorks} works\n`);
        
        let importedAuthors = 0;
        let importedWorks = 0;
        let importedTexts = 0;
        
        // Process each author
        for (const authorData of summaryData.authors) {
            const tlgId = authorData.author.id;
            const authorInfo = extractAuthorInfo(tlgId);
            
            console.log(`Processing author: ${authorInfo.name} (${tlgId})`);
            
            // Create or update author
            let author = await prisma.author.upsert({
                where: { tlgId },
                update: {
                    name: authorInfo.name,
                    fullName: authorInfo.fullName,
                    period: authorInfo.period,
                    genre: authorInfo.genre,
                    nationality: authorInfo.nationality,
                    biography: authorInfo.biography
                },
                create: {
                    tlgId,
                    name: authorInfo.name,
                    fullName: authorInfo.fullName,
                    period: authorInfo.period,
                    genre: authorInfo.genre,
                    nationality: authorInfo.nationality,
                    biography: authorInfo.biography
                }
            });
            
            importedAuthors++;
            
            // Process each work
            for (const workData of authorData.works) {
                const workTlgId = workData.workId;
                const workTitle = workData.workTitle || 'Unknown Work';
                const language = workData.language || 'unknown';
                const lineCount = workData.lineCount || 0;
                
                console.log(`  Processing work: ${workTitle} (${workTlgId}) - ${language} - ${lineCount} lines`);
                
                // Determine genre for this specific work
                const workGenre = determineGenre(workTitle, authorInfo.genre);
                
                // Create or update work
                let work = await prisma.work.upsert({
                    where: {
                        authorId_tlgId: {
                            authorId: author.id,
                            tlgId: workTlgId
                        }
                    },
                    update: {
                        title: workTitle,
                        genre: workGenre,
                        language,
                        lineCount,
                        isComplete: lineCount > 0
                    },
                    create: {
                        tlgId: workTlgId,
                        title: workTitle,
                        authorId: author.id,
                        genre: workGenre,
                        language,
                        lineCount,
                        isComplete: lineCount > 0
                    }
                });
                
                importedWorks++;
                
                // Load the extracted text file
                const textFilePath = path.join(EXTRACTED_TEXTS_DIR, workData.outputFile);
                if (fs.existsSync(textFilePath)) {
                    const textData = JSON.parse(fs.readFileSync(textFilePath, 'utf-8'));
                    
                    // Import text content
                    for (const textItem of textData.content) {
                        // Handle null line numbers by providing a default value
                        const lineNumber = textItem.line || `para_${importedTexts + 1}`;
                        
                        await prisma.text.upsert({
                            where: {
                                workId_language_lineNumber: {
                                    workId: work.id,
                                    language: textData.metadata.language || language,
                                    lineNumber: lineNumber
                                }
                            },
                            update: {
                                content: textItem.text,
                                contentType: textItem.line ? 'line' : 'paragraph'
                            },
                            create: {
                                workId: work.id,
                                language: textData.metadata.language || language,
                                contentType: textItem.line ? 'line' : 'paragraph',
                                lineNumber: lineNumber,
                                content: textItem.text
                            }
                        });
                        
                        importedTexts++;
                    }
                }
            }
            
            console.log(`  ✓ Completed author: ${authorInfo.name}\n`);
        }
        
        console.log('=== IMPORT COMPLETE ===');
        console.log(`Authors imported: ${importedAuthors}`);
        console.log(`Works imported: ${importedWorks}`);
        console.log(`Text entries imported: ${importedTexts}`);
        
    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
}

// Run the import
async function main() {
    try {
        await importData();
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main();
}

module.exports = { importData };
