/**
 * Represents the structure of a simplified medical report.
 */
export interface SimplifiedReport {
  /**
   * The title of the report.
   */
  title: string;
  /**
    * The target language of the report (e.g., "Hindi", "Bengali").
    * Used to determine which font to load.
    */
  language?: string;
  /**
   * The content of the report, divided into sections.
   */
  sections: {
    heading: string;
    content: string;
  }[];
}

// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';

// URLs for Noto Sans fonts to support various languages
const FONT_URLS: Record<string, string> = {
  'Hindi': 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansdevanagari/NotoSansDevanagari-Regular.ttf',
  'Bengali': 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansbengali/NotoSansBengali-Regular.ttf',
  'Chinese': 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC-Regular.ttf',
  'Japanese': 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP-Regular.ttf',
};

async function loadFont(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  // Convert ArrayBuffer to Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Asynchronously generates a PDF file from a simplified medical report.
 *
 * @param report The simplified report data.
 * @returns A promise that resolves to a Blob containing the PDF data.
 */
export async function generatePdf(report: SimplifiedReport): Promise<Blob> {
  // 1. Initialize VFS
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && (pdfFonts as any).vfs) {
    pdfMake.vfs = (pdfFonts as any).vfs;
  }

  // 2. Determine Font
  const language = report.language || 'English';
  let fontName = 'Roboto'; // Default pdfMake font

  // If we have a custom font for this language, load it
  if (FONT_URLS[language]) {
    try {
      const fontBase64 = await loadFont(FONT_URLS[language]);
      const customFontName = `NotoSans${language}`;

      // Add detailed debugging
      console.log(`Loading custom font for ${language}: ${customFontName}`);

      // Add to VFS
      pdfMake.vfs[`${customFontName}.ttf`] = fontBase64;

      // Define in fonts directory
      pdfMake.fonts = {
        ...pdfMake.fonts,
        [customFontName]: {
          normal: `${customFontName}.ttf`,
          bold: `${customFontName}.ttf`, // Use regular for bold to save bandwidth/complexity in demo
          italics: `${customFontName}.ttf`,
          bolditalics: `${customFontName}.ttf`,
        },
        Roboto: { // Ensure default still exists
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };

      fontName = customFontName;
    } catch (e) {
      console.error(`Failed to load font for ${language}. Falling back to default.`, e);
    }
  }

  // 3. Define Document
  const documentDefinition: any = {
    content: [
      { text: report.title, style: 'header' },
      ...report.sections.map(section => [
        { text: section.heading, style: 'sectionHeader' },
        { text: section.content, style: 'sectionContent' },
      ]).flat(),
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20],
        color: '#0e7490',
        font: fontName // Explicitly set font
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
        color: '#06b6d4',
        font: fontName
      },
      sectionContent: {
        fontSize: 12,
        margin: [0, 0, 0, 10],
        color: '#334155',
        font: fontName
      },
    },
    defaultStyle: {
      fontSize: 12,
      color: '#1e293b',
      font: fontName
    }
  };

  // 4. Generate PDF
  return new Promise<Blob>((resolve, reject) => {
    try {
      const pdfGenerator = pdfMake.createPdf(documentDefinition);
      pdfGenerator.getBlob((blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}
