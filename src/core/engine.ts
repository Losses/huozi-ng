import type { LayoutOptions, Glyph, TextItem } from './types';
import {
  DEFAULT_OPTIONS,
  BIAODIAN,
  BIAODIANVALIDATEND,
  BIAODIANVALIDATSTART,
  INCOMPRESSIBLE
} from './constants';

export class HuoziEngine {
  private options: LayoutOptions;
  private measureCtx: CanvasRenderingContext2D;
  private layoutData: Glyph[] = [];
  private totalPages: number = 1;

  // Regex helpers
  private static CJK_REGEX = new RegExp(`[${[
    '\\u1100-\\u11FF', '\\u2E80-\\u2EFF', '\\u2F00-\\u2FDF', '\\u2FF0-\\u2FFF', 
    '\\u3000-\\u303F', '\\u3040-\\u309F', '\\u30A0-\\u30FF', '\\u3100-\\u312F', 
    '\\u3130-\\u318F', '\\u3190-\\u319F', '\\u31A0-\\u31BF', '\\u31F0-\\u31FF', 
    '\\u3200-\\u32FF', '\\u3300-\\u33FF', '\\u3400-\\u4DBF', '\\u4E00-\\u9FFF', 
    '\\uAC00-\\uD7AF', '\\uF900-\\uFAFF', '\\uFE30-\\uFE4F', '\\uFF00-\\uFFEF',
  ].join('')}]`, 'u');

  constructor(initialOptions: LayoutOptions = DEFAULT_OPTIONS) {
    this.options = { ...DEFAULT_OPTIONS, ...initialOptions };
    // Ensure we are in a browser environment or have a polyfill before creating canvas
    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        this.measureCtx = canvas.getContext('2d')!;
    } else {
        // Fallback or error handling for non-browser environments if needed
        // For now, we assume browser as per original code
        this.measureCtx = {} as CanvasRenderingContext2D;
    }
  }

  // --- Public API ---

  public setOptions(newOptions: LayoutOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  public getLayout() {
    return this.layoutData;
  }

  public getTotalPages() {
    return this.totalPages;
  }

  public layout(text: string, fontSize: number) {
    if (!this.measureCtx || !this.measureCtx.measureText) {
         if (typeof document !== 'undefined') {
             const canvas = document.createElement('canvas');
             this.measureCtx = canvas.getContext('2d')!;
         }
    }

    const cleanText = text.replace(/\r\n/g, '\n').trim();
    const graphemes = this.splitGraphemes(cleanText);
    const textSequence: TextItem[] = graphemes.map(char => ({
      character: char,
      fontSize: fontSize
    }));

    this.layoutData = this.calculateLayout(textSequence);
    
    // Recalculate pages
    let maxPage = 1;
    this.layoutData.forEach(g => { if (g.page > maxPage) maxPage = g.page; });
    this.totalPages = maxPage;
  }

  public renderToCanvas(canvas: HTMLCanvasElement, viewPage: number = 1, showGrid: boolean = false) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const { enablePagination, pageWidth, pageHeight, padding, gridSize, xInterval, column, layoutColumnCount, layoutColumnGap } = this.options;

    // Determine Dimensions
    let canvasWidth, canvasHeight;
    
    if (enablePagination) {
        canvasWidth = pageWidth;
        canvasHeight = pageHeight;
    } else {
        let maxY = 0;
        let maxX = 0;
        this.layoutData.forEach(g => {
            if (g.y + g.height > maxY) maxY = g.y + g.height;
            if (g.x + g.width > maxX) maxX = g.x + g.width;
        });
        const contentWidth = (gridSize + xInterval) * (column + 1);
        canvasWidth = Math.max(maxX, contentWidth) + padding * 2;
        canvasHeight = maxY + padding * 2;
    }

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Guides
    if (showGrid && enablePagination) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, pageWidth, pageHeight);
        
        ctx.strokeStyle = '#cbd5e1';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(padding, padding, pageWidth - padding * 2, pageHeight - padding * 2);
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.setLineDash([]);
        const totalContentWidth = pageWidth - (padding * 2);
        const allGaps = (layoutColumnCount - 1) * layoutColumnGap;
        const singleColumnWidth = (totalContentWidth - allGaps) / layoutColumnCount;
        
        for(let i=0; i<layoutColumnCount; i++) {
             const colX = padding + i * (singleColumnWidth + layoutColumnGap);
             ctx.strokeRect(colX, padding, singleColumnWidth, pageHeight - padding * 2);
        }
    }

    // Glyphs
    ctx.textBaseline = 'middle'; 
    ctx.fillStyle = '#111827'; 
    ctx.strokeStyle = '#e5e7eb'; 

    const safeViewPage = Math.min(Math.max(viewPage, 1), this.totalPages);

    this.layoutData.forEach(glyph => {
      if (enablePagination && glyph.page !== safeViewPage) return;

      ctx.font = `${glyph.fontSize}px ${this.options.fontFamily}`;
      
      const drawX = glyph.x + padding;
      const drawY = glyph.y + padding;

      ctx.fillText(glyph.character, drawX, drawY + glyph.height / 2);

      if (showGrid) {
        ctx.setLineDash([]);
        ctx.strokeRect(drawX, drawY, glyph.width, glyph.height);
      }
    });
  }

  // --- Internals ---

  private isCJK(text: string): boolean {
    return HuoziEngine.CJK_REGEX.test(text);
  }

  private splitGraphemes(text: string): string[] {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text)).map((s) => s.segment);
    }
    return Array.from(text);
  }

  private measureTextWidth(text: string, font: string): number {
    if (!this.measureCtx) return 0;
    this.measureCtx.font = font;
    return this.measureCtx.measureText(text).width;
  }

  private processWesternText(
    textSequence: TextItem[],
    startX: number,
    startY: number,
    startRow: number,
    maxWidth: number,
    currentPage: number,
    currentLayoutColumn: number
  ): [Glyph[], number, number, number, boolean] {
    const { fontFamily, gridSize, yInterval, letterSpacing, row: maxRows } = this.options;
    const effectiveMaxRows = maxRows ?? Infinity;

    const layoutSequence: Glyph[] = [];
    
    let currentX = startX;
    let currentY = startY;
    let currentRow = startRow;
    let maxFontSize = gridSize;
    let wordBuffer = '';
    let wordItems: TextItem[] = [];
    let isMultiLine = false;

    const sequence = [...textSequence];
    if (sequence.length === 0 || sequence[sequence.length - 1]?.character !== ' ') {
      sequence.push({ fontSize: 0, character: ' ' });
    }

    for (const item of sequence) {
      if (!item) continue;
      const { fontSize, character } = item;
      maxFontSize = Math.max(maxFontSize, fontSize);

      if (character === ' ') {
        const font = `${maxFontSize}px ${fontFamily}`;
        const wordWidth = this.measureTextWidth(wordBuffer, font);
        const restSpace = maxWidth - currentX;

        if (restSpace < wordWidth && wordBuffer.length > 0) {
          currentX = 0;
          currentY += maxFontSize + yInterval; 
          currentRow += 1;
          isMultiLine = true;
          if (currentRow >= effectiveMaxRows) break;
        }

        for (const charItem of wordItems) {
          if (!charItem) continue;
          const charFont = `${charItem.fontSize}px ${fontFamily}`;
          const charWidth = this.measureTextWidth(charItem.character, charFont);
          const offsetY = (charItem.fontSize - gridSize) / 2;

          layoutSequence.push({
            character: charItem.character,
            x: currentX, 
            y: currentY - offsetY,
            width: charWidth,
            height: charItem.fontSize,
            fontSize: charItem.fontSize,
            row: currentRow,
            page: currentPage
          });
          currentX += charWidth + letterSpacing;
        }

        currentX += 0.35 * gridSize; 
        
        wordBuffer = '';
        wordItems = [];
      } else {
        wordBuffer += character;
        wordItems.push(item);
      }
    }

    return [layoutSequence, currentX - 0.35 * gridSize, currentY, currentRow, isMultiLine];
  }

  private calculateLayout(textSequence: TextItem[]): Glyph[] {
    const {
      fontFamily, gridSize, column: charsPerLine, xInterval, yInterval,
      inlineCompression, forceGridAlignment, westernCharacterFirst,
      forceSpaceBetweenCJKAndWestern, fixLeftQuote,
      enablePagination, pageHeight, padding, layoutColumnCount, layoutColumnGap, row: maxRows
    } = this.options;
    
    const effectiveMaxRows = maxRows ?? Infinity;

    let currentX = 0; 
    let currentY = 0; 
    let currentColumnIndex = 0; 
    let currentRow = 0;
    
    let currentPage = 1;
    let currentLayoutColumn = 0;

    let lastIsPunctuation = false;
    let lastCharFontSize = 0;
    let needForceWrap = false;
    let lineMaxFontSize = gridSize;

    const layoutSequence: Glyph[] = [];
    let westernCache: TextItem[] = [];
    let lastIsWesternChar = westernCharacterFirst;

    // Check std width for quote fix
    if (this.measureCtx) {
        this.measureCtx.font = '18px sans-serif';
    }
    const FLAG_STDWIDTH = this.measureCtx ? this.measureCtx.measureText('中').width === 18 : true;

    const contentHeight = enablePagination ? (pageHeight - padding * 2) : Infinity;

    const wrapLine = () => {
      currentX = 0;
      currentColumnIndex = 0;
      currentRow += 1;
      currentY += lineMaxFontSize + yInterval;
      
      if (enablePagination && currentY + gridSize > contentHeight) {
          currentLayoutColumn++;
          currentY = 0;
          if (currentLayoutColumn >= layoutColumnCount) {
              currentLayoutColumn = 0;
              currentPage++;
          }
      }

      lineMaxFontSize = gridSize;
      lastIsPunctuation = false;
      lastCharFontSize = 0;
      needForceWrap = false;
    };

    const paddedSequence = [...textSequence, { fontSize: 12, character: '　' }];

    for (let i = 0; i < paddedSequence.length; i++) {
      const charItem = paddedSequence[i];
      if (!charItem) continue;

      const { fontSize: charFontSize, character } = charItem;
      const isLastDummy = i === paddedSequence.length - 1;

      if (inlineCompression && lastIsPunctuation && !BIAODIAN.includes(character)) {
        currentX += lastCharFontSize / 2 + xInterval;
        currentColumnIndex += 0.5;
        lastIsPunctuation = false;
      }

      const isPunct = /[ “”‘’]/.test(character);
      const isWestern = !this.isCJK(character) && !/[\n “”‘’]/.test(character);

      if (isPunct && lastIsWesternChar) {
         westernCache.push(charItem);
         continue;
      }

      if (isWestern) {
        lastIsWesternChar = true;
        westernCache.push(charItem);
        continue;
      } else if (westernCache.length > 0) {
        const forceSpace = forceSpaceBetweenCJKAndWestern ? 0.25 * gridSize : 0;
        if (currentX > 0) currentX += forceSpace;

        const maxWidth = charsPerLine * gridSize + (charsPerLine - 1) * xInterval;
        
        const [westernGlyphs, newX, newY, newRow, isMulti] = this.processWesternText(
          westernCache, currentX, currentY, currentRow, maxWidth, currentPage, currentLayoutColumn
        );

        const colWidth = (charsPerLine * (gridSize + xInterval));
        const layoutXOffset = currentLayoutColumn * (colWidth + layoutColumnGap);
        
        westernGlyphs.forEach(g => {
            g.x = g.x + layoutXOffset;
            g.page = currentPage;
        });

        currentColumnIndex = Math.ceil(newX / (gridSize + xInterval));
        currentX = currentColumnIndex * (gridSize + xInterval);
        
        if (newY !== currentY) currentY = newY; 
        currentRow = newRow;

        layoutSequence.push(...westernGlyphs);
        lastIsWesternChar = false;
        westernCache = [];
      }

      if (isLastDummy) break;

      let isLineEnd = false;
      if (currentColumnIndex >= charsPerLine) {
        isLineEnd = true;
        if (!BIAODIANVALIDATEND.includes(character) || BIAODIANVALIDATSTART.includes(character) || needForceWrap) {
          wrapLine();
        }
      }

      if (character === '\n') {
        if (!isLineEnd) wrapLine();
        continue;
      }

      const fontStr = `${charFontSize}px ${fontFamily}`;
      const width = this.measureTextWidth(character, fontStr);

      let offsetX = 0;
      let offsetY = (charFontSize - gridSize) / 2;
      let doubleX = false;

      if (forceGridAlignment && charFontSize !== gridSize) {
        offsetX = (charFontSize - gridSize) / 2; 
        const colSpan = offsetX > 0 ? Math.ceil(offsetX * 2 / (gridSize + xInterval)) : 0;
        currentColumnIndex += colSpan;
        
        const spanWidth = (1 + colSpan) * (gridSize + xInterval);
        const centeringOffset = (spanWidth - charFontSize) / 2;
        currentX += centeringOffset;

        if (currentColumnIndex >= charsPerLine && !BIAODIANVALIDATEND.includes(character)) {
          wrapLine();
          doubleX = true;
        }
      }

      let quoteFix = 0;
      if (!lastIsPunctuation && character === '“') {
        quoteFix += charFontSize / 2;
      }
      if (fixLeftQuote) {
        if (character === '“' && !FLAG_STDWIDTH) {
          quoteFix -= charFontSize / 2;
        } else if (character === '“' && Math.abs(width - charFontSize) < 0.1) {
           quoteFix -= charFontSize / 2;
        }
      }

      const colWidth = (charsPerLine * (gridSize + xInterval));
      const layoutXOffset = currentLayoutColumn * (colWidth + layoutColumnGap);

      const glyph: Glyph = {
        character,
        x: currentX + quoteFix + layoutXOffset,
        y: currentY - offsetY,
        width,
        height: charFontSize,
        fontSize: charFontSize,
        row: currentRow,
        page: currentPage
      };
      layoutSequence.push(glyph);

      let advanceX = offsetX * (doubleX ? 2 : 1);
      if (advanceX > gridSize) {
        advanceX -= gridSize;
        currentColumnIndex -= 1;
      }
      currentX += advanceX;

      if (isLineEnd && BIAODIANVALIDATEND.includes(character) && !INCOMPRESSIBLE.includes(character)) {
        currentX += charFontSize / 2;
        currentColumnIndex += 0.5;
        if (currentColumnIndex % 1 !== 0.5) needForceWrap = true;
      } else if (inlineCompression && BIAODIAN.includes(character) && !INCOMPRESSIBLE.includes(character)) {
        currentX += charFontSize / 2 + xInterval * (lastIsPunctuation ? 1 : 0);
        currentColumnIndex += 0.5;
        lastIsPunctuation = !lastIsPunctuation;
      } else {
        currentX += charFontSize + xInterval;
        currentColumnIndex += 1;
      }

      lineMaxFontSize = Math.max(lineMaxFontSize, charFontSize);
      lastCharFontSize = charFontSize;
      
      if (currentRow >= effectiveMaxRows) break;
    }

    return layoutSequence;
  }
}