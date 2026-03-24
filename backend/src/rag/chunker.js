export const chunkCode = (content, filePath, repoPath) => {
  const CHUNK_SIZE = 1000;
  const CHUNK_OVERLAP = 150;
  
  if (!content || content.trim() === '') {
    return [];
  }

  const chunks = [];
  let start = 0;
  
  while (start < content.length) {
    let end = start + CHUNK_SIZE;
    
    if (end > content.length) {
      end = content.length;
    }
    
    // Find nearest newline to avoid cutting words/lines strictly
    if (end < content.length) {
      const nextNewline = content.indexOf('\n', end);
      if (nextNewline !== -1 && nextNewline - end < 100) {
        end = nextNewline + 1;
      }
    }
    
    const text = content.slice(start, end).trim();
    if (text.length > 0) {
      chunks.push({ text, filePath, repoPath });
    }
    
    start = end - CHUNK_OVERLAP;
    if (start <= chunks[chunks.length - 1]?.start) {
        start += CHUNK_OVERLAP; // prevent infinite loop if overlap logic fails
    }
  }
  
  return chunks;
};