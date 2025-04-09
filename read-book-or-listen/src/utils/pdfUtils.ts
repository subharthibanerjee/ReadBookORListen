// Import PDF.js from CDN
declare const pdfjsLib: any;

interface TextItem {
  str: string;
  transform: number[];
  fontName: string;
  fontSize: number;
}

interface PageText {
  items: TextItem[];
  styles: {
    fontSize: number;
    fontFamily: string;
  };
}

export async function extractTextFromPDF(pdfUrl: string): Promise<PageText[]> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    const pages: PageText[] = [];
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Process text items
      const items = textContent.items.map((item: any) => ({
        str: item.str,
        transform: item.transform,
        fontName: item.fontName,
        fontSize: item.fontSize
      }));
      
      pages.push({
        items: items,
        styles: {
          fontSize: viewport.height / 50,
          fontFamily: 'serif'
        }
      });
    }
    
    return pages;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return [];
  }
} 