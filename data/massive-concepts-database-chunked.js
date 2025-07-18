// Massive Mathematical Concepts Database - Chunked Loader
// Loads all chunks and combines them

// Import all chunks
const chunks = [];

// Function to load all chunks
async function loadAllChunks() {
    try {
        // Load chunk functions (these will be loaded by the browser)
        const chunk1 = window.getMassiveConceptsDatabaseChunk1 ? window.getMassiveConceptsDatabaseChunk1() : [];
        const chunk2 = window.getMassiveConceptsDatabaseChunk2 ? window.getMassiveConceptsDatabaseChunk2() : [];
        const chunk3 = window.getMassiveConceptsDatabaseChunk3 ? window.getMassiveConceptsDatabaseChunk3() : [];
        const chunk4 = window.getMassiveConceptsDatabaseChunk4 ? window.getMassiveConceptsDatabaseChunk4() : [];
        
        return [...chunk1, ...chunk2, ...chunk3, ...chunk4];
    } catch (error) {
        console.error('Error loading database chunks:', error);
        return [];
    }
}

// Main function that replaces the original
function getMassiveConceptsDatabase() {
    // If chunks are already loaded in memory, return them
    if (window.MASSIVE_CONCEPTS_CACHE) {
        return window.MASSIVE_CONCEPTS_CACHE;
    }
    
    // Load and cache the concepts
    return loadAllChunks().then(concepts => {
        window.MASSIVE_CONCEPTS_CACHE = concepts;
        return concepts;
    });
}

// Synchronous version for backward compatibility
function getMassiveConceptsDatabaseSync() {
    if (window.MASSIVE_CONCEPTS_CACHE) {
        return window.MASSIVE_CONCEPTS_CACHE;
    }
    
    // Try to load chunks synchronously
    try {
        const chunk1 = window.getMassiveConceptsDatabaseChunk1 ? window.getMassiveConceptsDatabaseChunk1() : [];
        const chunk2 = window.getMassiveConceptsDatabaseChunk2 ? window.getMassiveConceptsDatabaseChunk2() : [];
        const chunk3 = window.getMassiveConceptsDatabaseChunk3 ? window.getMassiveConceptsDatabaseChunk3() : [];
        const chunk4 = window.getMassiveConceptsDatabaseChunk4 ? window.getMassiveConceptsDatabaseChunk4() : [];
        
        const allConcepts = [...chunk1, ...chunk2, ...chunk3, ...chunk4];
        window.MASSIVE_CONCEPTS_CACHE = allConcepts;
        return allConcepts;
    } catch (error) {
        console.error('Error loading database chunks synchronously:', error);
        return [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getMassiveConceptsDatabase, getMassiveConceptsDatabaseSync, loadAllChunks };
} else {
    window.getMassiveConceptsDatabase = getMassiveConceptsDatabase;
    window.getMassiveConceptsDatabaseSync = getMassiveConceptsDatabaseSync;
    window.loadAllChunks = loadAllChunks;
}