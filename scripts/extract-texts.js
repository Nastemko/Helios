#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// Configuration
const SGML_PATH = path.join(__dirname, '../../sgml');
const OUTPUT_PATH = path.join(__dirname, '../data/extracted-texts');

// Create output directory
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

// Initialize XML parser
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text"
});

console.log('🔍 Starting text extraction from Perseus data...');
console.log(`📁 Source: ${SGML_PATH}`);
console.log(`📁 Output: ${OUTPUT_PATH}`);

// Function to extract texts from classics.xml metadata
function extractTextMetadata() {
  const classicsPath = path.join(SGML_PATH, 'xml/classics.xml');
  
  if (!fs.existsSync(classicsPath)) {
    console.log('❌ classics.xml not found');
    return [];
  }

  try {
    console.log('📖 Parsing classics.xml metadata...');
    const content = fs.readFileSync(classicsPath, 'utf8');
    const parsed = parser.parse(content);
    
    const texts = [];
    if (parsed['rdf:RDF'] && parsed['rdf:RDF']['rdf:Description']) {
      const descriptions = Array.isArray(parsed['rdf:RDF']['rdf:Description']) 
        ? parsed['rdf:RDF']['rdf:Description'] 
        : [parsed['rdf:RDF']['rdf:Description']];
      
      descriptions.forEach(desc => {
        if (desc['@_rdf:about'] && desc['dc:title'] && desc['dc:creator']) {
          texts.push({
            id: desc['@_rdf:about'],
            title: desc['dc:title']['#text'] || desc['dc:title'],
            creator: desc['dc:creator']['#text'] || desc['dc:creator'],
            language: desc['dc:language'] ? (desc['dc:language']['#text'] || desc['dc:language']) : 'unknown'
          });
        }
      });
    }
    
    console.log(`✅ Found ${texts.length} text metadata entries`);
    return texts;
  } catch (error) {
    console.error('❌ Error parsing classics.xml:', error.message);
    return [];
  }
}

// Function to extract morphological data
function extractMorphologicalData() {
  const greekPath = path.join(SGML_PATH, 'xml/data/greek.morph.xml');
  const latinPath = path.join(SGML_PATH, 'xml/data/latin.morph.xml');
  
  const results = {};
  
  // Extract Greek morphology
  if (fs.existsSync(greekPath)) {
    console.log('🏺 Extracting Greek morphological data...');
    try {
      const content = fs.readFileSync(greekPath, 'utf8');
      const parsed = parser.parse(content);
      
      if (parsed.analyses && parsed.analyses.analysis) {
        const analyses = Array.isArray(parsed.analyses.analysis) 
          ? parsed.analyses.analysis 
          : [parsed.analyses.analysis];
        
        results.greek = {
          count: analyses.length,
          sample: analyses.slice(0, 10).map(a => ({
            form: a.form,
            lemma: a.lemma,
            pos: a.pos,
            number: a.number,
            gender: a.gender,
            case: a.case
          }))
        };
        console.log(`✅ Greek: ${results.greek.count} morphological entries`);
      }
    } catch (error) {
      console.error('❌ Error parsing Greek morphology:', error.message);
    }
  }
  
  // Extract Latin morphology
  if (fs.existsSync(latinPath)) {
    console.log('🏛️ Extracting Latin morphological data...');
    try {
      const content = fs.readFileSync(latinPath, 'utf8');
      const parsed = parser.parse(content);
      
      if (parsed.analyses && parsed.analyses.analysis) {
        const analyses = Array.isArray(parsed.analyses.analysis) 
          ? parsed.analyses.analysis 
          : [parsed.analyses.analysis];
        
        results.latin = {
          count: analyses.length,
          sample: analyses.slice(0, 10).map(a => ({
            form: a.form,
            lemma: a.lemma,
            pos: a.pos,
            number: a.number,
            gender: a.gender,
            case: a.case
          }))
        };
        console.log(`✅ Latin: ${results.latin.count} morphological entries`);
      }
    } catch (error) {
      console.error('❌ Error parsing Latin morphology:', error.message);
    }
  }
  
  return results;
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
  
  // Extract morphological data
  const morphologicalData = extractMorphologicalData();
  
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
