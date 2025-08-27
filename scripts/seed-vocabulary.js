const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function seedVocabulary() {
  try {
    console.log('🌱 Seeding vocabulary data...');

    // Create a demo user
    const user = await prisma.user.upsert({
      where: { email: 'demo@helios.edu' },
      update: {},
      create: {
        email: 'demo@helios.edu',
        name: 'Demo Student'
      }
    });

    console.log('✅ Created demo user:', user.email);

    // Sample Greek vocabulary entries
    const greekWords = [
      {
        word: 'ἀγαθός',
        language: 'grc',
        lemma: 'ἀγαθός',
        partOfSpeech: 'adjective',
        definitions: ['good', 'noble', 'brave'],
        context: 'Homer, Iliad 1.131',
        lookupCount: 3,
        difficulty: 'medium'
      },
      {
        word: 'φιλία',
        language: 'grc',
        lemma: 'φιλία',
        partOfSpeech: 'noun',
        definitions: ['friendship', 'love', 'affection'],
        context: 'Plato, Symposium 180c',
        lookupCount: 5,
        difficulty: 'easy'
      },
      {
        word: 'σοφία',
        language: 'grc',
        lemma: 'σοφία',
        partOfSpeech: 'noun',
        definitions: ['wisdom', 'knowledge', 'skill'],
        context: 'Plato, Republic 428b',
        lookupCount: 2,
        difficulty: 'easy'
      },
      {
        word: 'ἀρετή',
        language: 'grc',
        lemma: 'ἀρετή',
        partOfSpeech: 'noun',
        definitions: ['excellence', 'virtue', 'courage'],
        context: 'Aristotle, Nicomachean Ethics 1103a',
        lookupCount: 4,
        difficulty: 'medium'
      },
      {
        word: 'λόγος',
        language: 'grc',
        lemma: 'λόγος',
        partOfSpeech: 'noun',
        definitions: ['word', 'speech', 'reason', 'account'],
        context: 'Heraclitus, Fragment 1',
        lookupCount: 7,
        difficulty: 'hard'
      }
    ];

    // Sample Latin vocabulary entries
    const latinWords = [
      {
        word: 'amor',
        language: 'lat',
        lemma: 'amor',
        partOfSpeech: 'noun',
        definitions: ['love', 'passion', 'affection'],
        context: 'Vergil, Aeneid 4.412',
        lookupCount: 6,
        difficulty: 'easy'
      },
      {
        word: 'virtus',
        language: 'lat',
        lemma: 'virtus',
        partOfSpeech: 'noun',
        definitions: ['virtue', 'courage', 'excellence'],
        context: 'Cicero, De Officiis 1.18',
        lookupCount: 3,
        difficulty: 'medium'
      },
      {
        word: 'sapientia',
        language: 'lat',
        lemma: 'sapientia',
        partOfSpeech: 'noun',
        definitions: ['wisdom', 'knowledge', 'understanding'],
        context: 'Seneca, Epistulae Morales 89.4',
        lookupCount: 2,
        difficulty: 'medium'
      },
      {
        word: 'pax',
        language: 'lat',
        lemma: 'pax',
        partOfSpeech: 'noun',
        definitions: ['peace', 'tranquility', 'harmony'],
        context: 'Vergil, Aeneid 6.852',
        lookupCount: 4,
        difficulty: 'easy'
      },
      {
        word: 'fides',
        language: 'lat',
        lemma: 'fides',
        partOfSpeech: 'noun',
        definitions: ['faith', 'trust', 'loyalty', 'credit'],
        context: 'Cicero, De Officiis 1.23',
        lookupCount: 5,
        difficulty: 'hard'
      }
    ];

    // Create vocabulary entries
    const allWords = [...greekWords, ...latinWords];
    const createdEntries = [];

    for (const wordData of allWords) {
      const entry = await prisma.vocabularyEntry.create({
        data: {
          userId: user.id,
          ...wordData,
          lastLookedUp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        }
      });
      createdEntries.push(entry);
      console.log(`✅ Created vocabulary entry: ${entry.word}`);
    }

    // Create some flashcards
    const flashcardEntries = createdEntries.slice(0, 8); // Create flashcards for first 8 words
    for (const entry of flashcardEntries) {
      const flashcard = await prisma.flashcard.create({
        data: {
          userId: user.id,
          vocabularyEntryId: entry.id,
          front: entry.word,
          back: entry.definitions.join('; '),
          nextReview: new Date(),
          reviewCount: Math.floor(Math.random() * 5),
          difficulty: Math.floor(Math.random() * 5) + 1
        }
      });
      console.log(`✅ Created flashcard for: ${entry.word}`);
    }

    // Create a study session
    const studySession = await prisma.studySession.create({
      data: {
        userId: user.id,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        cardsStudied: 15,
        correctAnswers: 12,
        totalQuestions: 15,
        sessionType: 'flashcards'
      }
    });

    console.log('✅ Created study session');

    // Create a quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizType: 'vocabulary',
        score: 8,
        totalQuestions: 10,
        timeSpent: 300, // 5 minutes
        completed: true
      }
    });

    console.log('✅ Created quiz attempt');

    console.log('\n🎉 Vocabulary seeding completed successfully!');
    console.log(`📊 Created ${createdEntries.length} vocabulary entries`);
    console.log(`📚 Created ${flashcardEntries.length} flashcards`);
    console.log(`👤 Demo user: ${user.email}`);

  } catch (error) {
    console.error('❌ Error seeding vocabulary:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedVocabulary();
