const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

// Configuration
const INPUT_DIR = path.join(__dirname, '../canonical-greekLit/data');
const OUTPUT_DIR = path.join(__dirname, '../data/extracted-texts');
const SUPPORTED_LANGUAGES = ['grc', 'eng', 'lat', 'fre', 'ger', 'ita'];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to clean text content
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
}

// Helper function to get text content from element
function getTextContent(element) {
    if (!element) return '';
    let text = '';
    
    // Convert childNodes to array to ensure it's iterable
    const children = Array.from(element.childNodes || []);
    
    for (let child of children) {
        if (child.nodeType === 3) { // Text node
            text += child.nodeValue || '';
        } else if (child.nodeType === 1) { // Element node
            text += getTextContent(child);
        }
    }
    return text;
}

// Helper function to get elements by tag name (like getElementsByTagName)
function getElementsByTagName(doc, tagName) {
    return doc.getElementsByTagName(tagName);
}

// Helper function to get first element by tag name
function getFirstElementByTagName(doc, tagName) {
    const elements = doc.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0] : null;
}

// Extract text from XML file
function extractTextFromXML(filePath) {
    try {
        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Check for parsing errors
        const parseErrors = doc.getElementsByTagName('parsererror');
        if (parseErrors.length > 0) {
            console.warn(`XML parsing errors in ${filePath}`);
            return null;
        }
        
        // Extract metadata
        const titleElement = getFirstElementByTagName(doc, 'title');
        const title = titleElement ? getTextContent(titleElement) : 'Unknown Title';
        
        const authorElement = getFirstElementByTagName(doc, 'author');
        const author = authorElement ? getTextContent(authorElement) : 'Unknown Author';
        
        const textElement = getFirstElementByTagName(doc, 'text');
        const language = textElement ? textElement.getAttribute('xml:lang') : 'unknown';
        
        // Extract text content
        const textContent = [];
        const lines = getElementsByTagName(doc, 'l');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = line.getAttribute('n') || '';
            const lineText = cleanText(getTextContent(line));
            if (lineText) {
                textContent.push({
                    line: lineNumber,
                    text: lineText
                });
            }
        }
        
        // Extract paragraphs and other text elements
        const paragraphs = getElementsByTagName(doc, 'p');
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const pText = cleanText(getTextContent(p));
            if (pText) {
                textContent.push({
                    line: 'para',
                    text: pText
                });
            }
        }
        
        // Extract div elements (common in prose texts)
        const divs = getElementsByTagName(doc, 'div');
        for (let i = 0; i < divs.length; i++) {
            const div = divs[i];
            const divText = cleanText(getTextContent(div));
            if (divText) {
                textContent.push({
                    line: 'div',
                    text: divText
                });
            }
        }
        
        return {
            metadata: {
                title,
                author,
                language,
                filePath: path.relative(INPUT_DIR, filePath),
                totalLines: textContent.length
            },
            content: textContent
        };
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return null;
    }
}

// Process a single author directory
function processAuthorDir(authorDir) {
    const authorPath = path.join(INPUT_DIR, authorDir);
    const authorMetadataPath = path.join(authorPath, '__cts__.xml');
    
    // Read author metadata
    let authorInfo = { id: authorDir, name: 'Unknown Author' };
    if (fs.existsSync(authorMetadataPath)) {
        try {
            const authorXml = fs.readFileSync(authorMetadataPath, 'utf-8');
            const parser = new DOMParser();
            const doc = parser.parseFromString(authorXml, 'text/xml');
            const titleElement = getFirstElementByTagName(doc, 'ti:title');
            if (titleElement) {
                const authorName = getTextContent(titleElement);
                authorInfo.name = authorName;
            }
        } catch (error) {
            console.warn(`Could not parse author metadata for ${authorDir}`);
        }
    }
    
    const works = [];
    const workDirs = fs.readdirSync(authorPath).filter(item => 
        fs.statSync(path.join(authorPath, item)).isDirectory() && 
        item !== '__cts__'
    );
    
    workDirs.forEach(workDir => {
        const workPath = path.join(authorPath, workDir);
        const workMetadataPath = path.join(workPath, '__cts__.xml');
        
        // Read work metadata
        let workInfo = { id: workDir, title: 'Unknown Work' };
        if (fs.existsSync(workMetadataPath)) {
            try {
                const workXml = fs.readFileSync(workMetadataPath, 'utf-8');
                const parser = new DOMParser();
                const doc = parser.parseFromString(workXml, 'text/xml');
                const titleElement = getFirstElementByTagName(doc, 'ti:title');
                if (titleElement) {
                    const workTitle = getTextContent(titleElement);
                    workInfo.title = workTitle;
                }
            } catch (error) {
                console.warn(`Could not parse work metadata for ${workDir}`);
            }
        }
        
        // Find all text files for this work
        const textFiles = fs.readdirSync(workPath).filter(file => 
            file.endsWith('.xml') && 
            !file.startsWith('__cts__') &&
            file.includes('perseus-')
        );
        
        textFiles.forEach(textFile => {
            const textFilePath = path.join(workPath, textFile);
            const extractedText = extractTextFromXML(textFilePath);
            
            if (extractedText && extractedText.content.length > 0) {
                const language = extractedText.metadata.language;
                const outputFileName = `${authorDir}_${workDir}_${language}.json`;
                const outputPath = path.join(OUTPUT_DIR, outputFileName);
                
                // Save extracted text
                fs.writeFileSync(outputPath, JSON.stringify(extractedText, null, 2));
                
                works.push({
                    workId: workDir,
                    workTitle: workInfo.title,
                    language,
                    outputFile: outputFileName,
                    lineCount: extractedText.content.length
                });
                
                console.log(`✓ Extracted: ${authorInfo.name} - ${workInfo.title} (${language}) - ${extractedText.content.length} lines`);
            }
        });
    });
    
    return {
        author: authorInfo,
        works
    };
}

// Main extraction function
function extractAllTexts() {
    console.log('Starting Greek Literature Text Extraction...\n');
    
    const authorDirs = fs.readdirSync(INPUT_DIR).filter(item => 
        fs.statSync(path.join(INPUT_DIR, item)).isDirectory() && 
        item.startsWith('tlg')
    );
    
    console.log(`Found ${authorDirs.length} author directories\n`);
    
    const extractionResults = [];
    
    authorDirs.forEach((authorDir, index) => {
        console.log(`Processing ${authorDir} (${index + 1}/${authorDirs.length})...`);
        const result = processAuthorDir(authorDir);
        if (result.works.length > 0) {
            extractionResults.push(result);
        }
    });
    
    // Generate summary report
    const summary = {
        totalAuthors: extractionResults.length,
        totalWorks: extractionResults.reduce((sum, author) => sum + author.works.length, 0),
        totalFiles: extractionResults.reduce((sum, author) => 
            sum + author.works.reduce((wSum, work) => wSum + 1, 0), 0
        ),
        extractionDate: new Date().toISOString(),
        authors: extractionResults
    };
    
    const summaryPath = path.join(OUTPUT_DIR, 'extraction-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n=== EXTRACTION COMPLETE ===');
    console.log(`Total Authors: ${summary.totalAuthors}`);
    console.log(`Total Works: ${summary.totalWorks}`);
    console.log(`Total Files: ${summary.totalFiles}`);
    console.log(`Output Directory: ${OUTPUT_DIR}`);
    console.log(`Summary: ${summaryPath}`);
}

// Run the extraction
if (require.main === module) {
    extractAllTexts();
}

module.exports = { extractAllTexts, extractTextFromXML };
