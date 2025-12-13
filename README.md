# Huozi-ng

A modern CJK typography engine for the web.
Refactored and modernized version of the original Huozi.js engine.

## Installation

Install directly from GitHub:

**Bun**
```bash
bun add github:Losses/huozi-ng
```

**NPM**
```bash
npm install github:Losses/huozi-ng
```

**Yarn**
```bash
yarn add github:Losses/huozi-ng
```

**PNPM**
```bash
pnpm add github:Losses/huozi-ng
```

## Usage

### Core Engine (Framework Agnostic)

The core engine can be used in any JavaScript/TypeScript environment. It handles text layout and rendering to an HTML Canvas.

```typescript
import { HuoziEngine, DEFAULT_OPTIONS } from 'huozi-ng/core';

// 1. Initialize the engine
const engine = new HuoziEngine(DEFAULT_OPTIONS);

// 2. Configure the layout options
engine.setOptions({
  fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
  gridSize: 24,       // Size of the grid cells
  column: 20,         // Number of characters per line
  lineHeight: 1.5,    // (Calculated via yInterval)
  yInterval: 12,      // Vertical gap between lines
  xInterval: 0,       // Horizontal gap between characters
  inlineCompression: true, // Enable punctuation compression
  // Padding can be a number or an object with directional values
  padding: {
    top: 60,
    right: 40,
    bottom: 60,
    left: 40
  }
});

// 3. Perform layout
// This calculates the position of every character.
// layout(text: string, fontSize: number)
engine.layout('这里是一段中文文本。Hello World.', 24);

// 4. Retrieve Layout Data (Optional)
// Returns an array of Glyph objects containing x, y, width, height, etc.
const glyphs = engine.getLayout();
console.log(glyphs);

// 5. Render to Canvas
// renderToCanvas(canvasElement, pageNumber, showGrid)
const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
if (canvas) {
    // Render the first page
    engine.renderToCanvas(canvas, 1, false); 
}
```

### React Usage

For React applications, use the provided `useHuoziEngine` hook to maintain a persistent engine instance across renders.

```typescript
import { useEffect, useRef } from 'react';
import { useHuoziEngine } from 'huozi-ng/react';
import type { LayoutOptions } from 'huozi-ng/core';

function TypographyViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize the hook
  const engine = useHuoziEngine();

  useEffect(() => {
    if (!engine.current || !canvasRef.current) return;

    // Define options
    const options: LayoutOptions = {
        fontFamily: 'sans-serif',
        gridSize: 20,
        column: 30,
        xInterval: 0,
        yInterval: 10,
        letterSpacing: 0,
        inlineCompression: true,
        forceGridAlignment: true,
        westernCharacterFirst: false,
        forceSpaceBetweenCJKAndWestern: true,
        fixLeftQuote: true,
        enablePagination: false,
        pageWidth: 800,
        pageHeight: 1000,
        layoutColumnCount: 1,
        layoutColumnGap: 40,
        padding: 40
    };

    // Update settings
    engine.current.setOptions(options);
    
    // Layout text
    engine.current.layout('这是一个 React 示例。', 20);
    
    // Render
    engine.current.renderToCanvas(canvasRef.current);

  }, []); // Re-run when dependencies change

  return <canvas ref={canvasRef} />;
}
```

### Advanced Features

#### Pagination
Enable pagination to split content across multiple virtual pages.

```typescript
engine.setOptions({
    enablePagination: true,
    pageWidth: 600,
    pageHeight: 800,
    padding: 40
});

// Layout text
engine.layout(longText, 16);

// Get total pages
const totalPages = engine.getTotalPages();

// Render specific page (e.g., Page 2)
engine.renderToCanvas(canvas, 2);
```

#### Multi-Column Layout
Create newspaper-style layouts with multiple columns per page.

```typescript
engine.setOptions({
    enablePagination: true,
    layoutColumnCount: 2, // 2 columns
    layoutColumnGap: 20   // 20px gap between columns
});
```

## Credits

This project is a refactor and modernization of [huozi.js](https://github.com/Icemic/huozi.js) by Icemic Jia.
The original code is licensed under the Apache License 2.0.

## License

Apache License 2.0
