declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: any;
    version: string;
  }

  function PDFParse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  export default PDFParse;
}

declare module 'react-pdf' {
  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    getDocument(source: string): {
      promise: Promise<PDFDocumentProxy>;
    };
  };

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface TextItem {
    str: string;
  }
} 