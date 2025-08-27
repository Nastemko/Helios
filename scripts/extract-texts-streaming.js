#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');
const { Transform } = require('stream');

// Configuration
const SGML_PATH = path.join(__dirname, '../../sgml');
const OUTPUT_PATH = path.join(__dirname, '../data/extracted-texts');

// Create output directory
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

console.log('🔍 Starting streaming text extraction from Perseus data...');
console.log(`📁 Source: ${SGML_PATH}`);
console.log(`📁 Output: ${OUTPUT_PATH}`);

// Function to extract texts from classics.xml metadata (small file, can load entirely)
function extractTextMetadata() {
  const classicsPath = path.join(SGML_PATH, 'xml/classics.xml');
  
  if (!fs.existsSync(classicsPath)) {
    console.log('❌ classics.xml not found');
    return [];
  }

  try {
    console.log('📖 Parsing classics.xml metadata...');
    const content = fs.readFileSync(classicsPath, 'utf8');
    
    // Simple regex-based parsing to avoid XML parser memory issues
    const textEntries = [];
    const rdfMatches = content.match(/<rdf:Description[^>]*>/g);
    
    if (rdfMatches) {
      rdfMatches.forEach(match => {
        const idMatch = match.match(/rdf:about="([^"]+)"/);
        if (idMatch) {
          const id = idMatch[1];
          
          // Find the corresponding closing tag and content
          const endIndex = content.indexOf('</rdf:Description>', content.indexOf(match));
          if (endIndex > -1) {
            const section = content.substring(content.indexOf(match), endIndex);
            
            const titleMatch = section.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
            const creatorMatch = section.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);
            const languageMatch = section.match(/<dc:language[^>]*>([^<]+)<\/dc:language>/);
            
            if (titleMatch && creatorMatch) {
              textEntries.push({
                id: id,
                title: titleMatch[1].trim(),
                creator: creatorMatch[1].trim(),
                language: languageMatch ? languageMatch[1].trim() : 'unknown'
              });
            }
          }
        }
      });
    }
    
    console.log(`✅ Found ${textEntries.length} text metadata entries`);
    return textEntries;
  } catch (error) {
    console.error('❌ Error parsing classics.xml:', error.message);
    return [];
  }
}

// Streaming parser for large morphological files
function createMorphologyParser() {
  let buffer = '';
  let analysisCount = 0;
  let sampleAnalyses = [];
  
  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      
      // Process complete <analysis> tags
      let startIndex = 0;
      while (true) {
        const analysisStart = buffer.indexOf('<analysis>', startIndex);
        if (analysisStart === -1) break;
        
        const analysisEnd = buffer.indexOf('</analysis>', analysisStart);
        if (analysisEnd === -1) break;
        
        const analysisXml = buffer.substring(analysisStart, analysisEnd + 11);
        
        // Extract key morphological information
        const formMatch = analysisXml.match(/<form>([^<]+)<\/form>/);
        const lemmaMatch = analysisXml.match(/<lemma>([^<]+)<\/lemma>/);
        const posMatch = analysisXml.match(/<pos>([^<]+)<\/pos>/);
        const numberMatch = analysisXml.match(/<number>([^<]+)<\/number>/);
        const genderMatch = analysisXml.match(/<gender>([^<]+)<\/gender>/);
        const caseMatch = analysisXml.match(/<case>([^<]+)<\/case>/);
        
        if (formMatch && lemmaMatch) {
          analysisCount++;
          
          // Keep first 10 samples
          if (sampleAnalyses.length < 10) {
            sampleAnalyses.push({
              form: formMatch[1],
              lemma: lemmaMatch[1],
              pos: posMatch ? posMatch[1] : '',
              number: numberMatch ? numberMatch[1] : '',
              gender: genderMatch ? genderMatch[1] : '',
              case: caseMatch ? caseMatch[1] : ''
            });
          }
        }
        
        startIndex = analysisEnd + 11;
      }
      
      // Keep only the last incomplete tag in buffer
      const lastAnalysisStart = buffer.lastIndexOf('<analysis>');
      if (lastAnalysisStart > -1) {
        buffer = buffer.substring(lastAnalysisStart);
      } else {
        buffer = '';
      }
      
      callback();
    },
    
    flush(callback) {
      callback();
    }
  });
}

// Function to extract morphological data using streaming
function extractMorphologicalDataStreaming() {
  const greekPath = path.join(SGML_PATH, 'xml/data/greek.morph.xml');
  const latinPath = path.join(SGML_PATH, 'xml/data/latin.morph.xml');
  
  const results = {};
  
  return new Promise((resolve) => {
    // Extract Greek morphology
    if (fs.existsSync(greekPath)) {
      console.log('🏺 Extracting Greek morphological data (streaming)...');
      
      const greekParser = createMorphologyParser();
      let greekCount = 0;
      let greekSamples = [];
      
      greekParser.on('data', (chunk) => {
        // Data is processed in transform
      });
      
      greekParser.on('end', () => {
        results.greek = {
          count: greekParser.analysisCount || 0,
          sample: greekParser.sampleAnalyses || []
        };
        console.log(`✅ Greek: ${results.greek.count} morphological entries`);
        
        // Now process Latin
        if (fs.existsSync(latinPath)) {
          console.log('🏛️ Extracting Latin morphological data (streaming)...');
          
          const latinParser = createMorphologyParser();
          
          latinParser.on('end', () => {
            results.latin = {
              count: latinParser.analysisCount || 0,
              sample: latinParser.sampleAnalyses || []
            };
            console.log(`✅ Latin: ${results.latin.count} morphological entries`);
            resolve(results);
          });
          
          createReadStream(latinPath).pipe(latinParser);
        } else {
          resolve(results);
        }
      });
      
      createReadStream(greekPath).pipe(greekParser);
    } else if (fs.existsSync(latinPath)) {
      // Only Latin exists
      console.log('🏛️ Extracting Latin morphological data (streaming)...');
      
      const latinParser = createMorphologyParser();
      
      latinParser.on('end', () => {
        results.latin = {
          count: latinParser.analysisCount || 0,
          sample: latinParser.sampleAnalyses || []
        };
        console.log(`✅ Latin: ${results.latin.count} morphological entries`);
        resolve(results);
      });
      
      createReadStream(latinPath).pipe(latinParser);
    } else {
      resolve(results);
    }
  });
}

// Function to search for actual text files
function searchForTextFiles() {
  console.log('🔍 Searching for actual text content files...');
  
  const textFiles = [];
  const staticXmlPath = path.join(SGML_PATH, 'reading/static/xml');
  
  if (fs.existsSync(staticXmlPath)) {
    const files = fs.readdirSync(staticXmlPath);
    
    files.forEach(file => {
      if (file.endsWith('.xml') && !file.includes('places')) {
        const filePath = path.join(staticXmlPath, file);
        const stats = fs.statSync(filePath);
        
        textFiles.push({
          name: file,
          size: stats.size,
          path: filePath
        });
      }
    });
  }
  
  console.log(`✅ Found ${textFiles.length} potential text files`);
  return textFiles;
}

// Main extraction function
async function main() {
  console.log('\n🚀 Starting Perseus text extraction for Helios project...\n');
  
  // Extract text metadata
  const textMetadata = extractTextMetadata();
  
  // Extract morphological data using streaming
  const morphologicalData = await extractMorphologicalDataStreaming();
  
  // Search for text files
  const textFiles = searchForTextFiles();
  
  // Save extracted data
  const summary = {
    extractionDate: new Date().toISOString(),
    textMetadata: {
      total: textMetadata.length,
      greek: textMetadata.filter(t => t.language === 'grc' || t.language === 'greek').length,
      latin: textMetadata.filter(t => t.language === 'lat' || t.language === 'latin').length,
      samples: textMetadata.slice(0, 20)
    },
    morphologicalData,
    textFiles: {
      total: textFiles.length,
      files: textFiles.slice(0, 20)
    }
  };
  
  // Save summary
  fs.writeFileSync(
    path.join(OUTPUT_PATH, 'extraction-summary.json'), 
    JSON.stringify(summary, null, 2)
  );
  
  // Save text metadata
  fs.writeFileSync(
    path.join(OUTPUT_PATH, 'text-metadata.json'), 
    JSON.stringify(textMetadata, null, 2)
  );
  
  console.log('\n📊 Extraction Summary:');
  console.log(`📚 Text Metadata: ${summary.textMetadata.total} entries`);
  console.log(`🏺 Greek Morphology: ${morphologicalData.greek?.count || 0} entries`);
  console.log(`🏛️ Latin Morphology: ${morphologicalData.latin?.count || 0} entries`);
  console.log(`📄 Text Files: ${summary.textFiles.total} files`);
  console.log(`\n💾 Data saved to: ${OUTPUT_PATH}`);
  console.log('\n✅ Extraction complete!');
}

// Run the extraction
main().catch(console.error);
