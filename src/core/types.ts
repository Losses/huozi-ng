export interface LayoutOptions {
  fontFamily: string;
  gridSize: number;
  column: number;
  xInterval: number;
  yInterval: number;
  letterSpacing: number;
  inlineCompression: boolean;
  forceGridAlignment: boolean;
  westernCharacterFirst: boolean;
  forceSpaceBetweenCJKAndWestern: boolean;
  fixLeftQuote: boolean;
  enablePagination: boolean;
  pageWidth: number;
  pageHeight: number;
  layoutColumnCount: number;
  layoutColumnGap: number;
  padding: number;
  // Added row to match usage in engine
  row?: number; 
}

export interface Glyph {
  character: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  row: number;
  page: number;
}

export interface TextItem {
  character: string;
  fontSize: number;
}
