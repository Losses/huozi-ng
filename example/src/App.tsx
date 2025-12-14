import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Settings, Type, LayoutTemplate, ChevronLeft, ChevronRight, FileText, Lock, Globe } from 'lucide-react';
import { useHuoziEngine } from '../../src/react';
import { type LayoutOptions, DEFAULT_OPTIONS } from '../../src/core';

// --- Constants & Types ---

const FONT_PRESETS = [
    { label: 'Default Sans (PingFang/YaHei)', value: '"PingFang SC", "Microsoft YaHei", "Source Han Sans SC", sans-serif' },
    { label: 'IBM Plex Sans SC (Modern)', value: '"IBM Plex Sans SC", sans-serif' },
    { label: 'Noto Sans SC (Regular)', value: '"Noto Sans SC", sans-serif' },
    { label: 'Noto Serif SC (Serif)', value: '"Noto Serif SC", serif' },
    { label: 'Ma Shan Zheng (Calligraphy)', value: '"Ma Shan Zheng", cursive' },
    { label: 'ZCOOL XiaoWei (Serif-ish)', value: '"ZCOOL XiaoWei", serif' },
    { label: 'ZCOOL QingKe HuangYou (Display)', value: '"ZCOOL QingKe HuangYou", sans-serif' },
    { label: 'Microsoft YaHei (微软雅黑)', value: '"Microsoft YaHei", sans-serif' },
    { label: 'SimSun (宋体)', value: 'SimSun, serif' },
    { label: 'Kaiti (楷体)', value: 'KaiTi, serif' },
];

// --- Components ---

interface NumberControlProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
    suffix?: string;
    className?: string;
}

const NumberControl = memo<NumberControlProps>(({ label, value, onChange, min, max, step = 1, disabled = false, suffix = '', className = '' }) => (
  <div className={`mb-3 ${disabled ? 'opacity-50' : ''} ${className}`}>
    <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            {label} {suffix ? `(${suffix})` : ""}
            {disabled && <Lock size={10} className="text-gray-400" />}
        </label>
    </div>
    <div className="flex gap-2 items-center">
        <input
            type="range"
            className={`flex-grow accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
        />
        <input
            type="number"
            className="w-16 text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 py-1 text-right disabled:bg-gray-100"
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
        />
    </div>
  </div>
));

NumberControl.displayName = 'NumberControl';

const ControlGroup = memo<{ label: string, children: React.ReactNode }>(({ label, children }) => (
  <div className="flex flex-col gap-1 mb-5 border-b border-gray-100 pb-3 last:border-0">
    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">{label}</label>
    {children}
  </div>
));

ControlGroup.displayName = 'ControlGroup';

// --- Sample Data ---
const SAMPLE_TEXTS = {
  beiying: "我与父亲不相见已二年余了，我最不能忘记的是他的背影。那年冬天，祖母死了，父亲的差使也交卸了，正是祸不单行的日子，我从北京到徐州，打算跟着父亲奔丧回家。到徐州见着父亲，看见满院狼藉的东西，又想起祖母，不禁簌簌地流下眼泪。父亲说，\"事已如此，不必难过，好在天无绝人之路！\n\t　　回家变卖典质，父亲还了亏空；又借钱办了丧事。这些日子，家中光景很是惨淡，一半为了丧事，一半为了父亲赋闲。丧事完毕，父亲要到南京谋事，我也要回北京念书，我们便同行。\n\t　　到南京时，有朋友约去游逛，勾留了一日；第二日上午便须渡江到浦口，下午上车北去。父亲因为事忙，本已说定不送我，叫旅旅馆里一个熟识的茶房陪我同去。他再三嘱咐茶房，甚是仔细。但他终于不放心，怕茶房不妥帖；颇踌躇了一会。其实我那年已二十岁，北京已来往过两三次，是没有甚么要紧的了。他踌躇了一会，终于决定还是自己送我去。我两三回劝他不必去；他只说，\"不要紧，他们去不好！",
  mixed: "如同大部分北海道地区的地名由来，“札幌”这一地名也是起源于北海道当地的原住民阿伊努族的语言阿伊努语。关于札幌的名称起源有二种说法，一说认为札幌（さっぽろ）起源于阿伊努语中的“sat-poro-pet/サッ・ポロ・ペッ”，意指“干渴的大河”；另一说则认为起源于阿伊努语中的“sar-poro-pet/サリ・ポロ・ペッ”，意思是完全与前者颠倒的“有大片湿地的河流”。",
  lorem: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  emoji: '你可以看到ℹ️绘制出来的emoji🌟与文本框中的样式一致。它也支持特殊的控制字符，如设置肤色👨🏽或将多个emoji拼合在一起的样式。👩‍👩‍👧‍👦，就像这样。'
};

export default function HuoziApp() {
  const [text, setText] = useState(SAMPLE_TEXTS.beiying);
  const [fontSize, setFontSize] = useState(18);
  const [gridSize, setGridSize] = useState(18);
  const [columns, setColumns] = useState(25);
  const [showStroke, setShowStroke] = useState(false);
  const [compress, setCompress] = useState(true);
  const [fontFamily, setFontFamily] = useState(FONT_PRESETS[0]?.value ?? 'serif');
  const [fontLoadTrigger, setFontLoadTrigger] = useState(0); 
  const [enableGoogleFonts, setEnableGoogleFonts] = useState(false); // New state, default disabled
  
  // Pagination State
  const [enablePagination, setEnablePagination] = useState(false);
  const [layoutColumnCount, setLayoutColumnCount] = useState(1);
  const [layoutColumnGap, setLayoutColumnGap] = useState(40);
  const [pageHeight, setPageHeight] = useState(800);
  const [pageWidth, setPageWidth] = useState(800);
  
  // Padding State (Split)
  const defaultPadding = useMemo(() => DEFAULT_OPTIONS.padding as { top: number, right: number, bottom: number, left: number }, []);
  const [paddingTop, setPaddingTop] = useState(defaultPadding.top);
  const [paddingRight, setPaddingRight] = useState(defaultPadding.right);
  const [paddingBottom, setPaddingBottom] = useState(defaultPadding.bottom);
  const [paddingLeft, setPaddingLeft] = useState(defaultPadding.left);

  const [viewPage, setViewPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the new hook
  const engine = useHuoziEngine();

  // Derive full options object
  const options: LayoutOptions = useMemo(() => {
    let effectiveColumns = columns;

    const currentPadding = {
        top: paddingTop,
        right: paddingRight,
        bottom: paddingBottom,
        left: paddingLeft
    };

    if (enablePagination) {
        const totalContentWidth = pageWidth - (currentPadding.left + currentPadding.right);
        const allGaps = (layoutColumnCount - 1) * layoutColumnGap;
        const singleColumnWidth = (totalContentWidth - allGaps) / layoutColumnCount;
        if (singleColumnWidth > gridSize) {
             effectiveColumns = Math.floor(singleColumnWidth / gridSize); 
        }
    }

    return {
        ...DEFAULT_OPTIONS,
        fontFamily,
        gridSize,
        column: effectiveColumns,
        inlineCompression: compress,
        enablePagination,
        pageHeight,
        pageWidth,
        layoutColumnCount,
        layoutColumnGap,
        padding: currentPadding
    };
  }, [gridSize, columns, compress, fontFamily, enablePagination, pageHeight, pageWidth, layoutColumnCount, layoutColumnGap, paddingTop, paddingRight, paddingBottom, paddingLeft]);

  // Memoized callback groups
  const textHandlers = useMemo(() => ({
    handleTextChange: (newText: string) => setText(newText),
    handleSampleTextChange: (sample: keyof typeof SAMPLE_TEXTS) => setText(SAMPLE_TEXTS[sample]),
  }) as const, []);

  const typographyHandlers = useMemo(() => ({
    handleFontSizeChange: (size: number) => setFontSize(size),
    handleGridSizeChange: (size: number) => setGridSize(size),
    handleFontFamilyChange: (e: React.ChangeEvent<HTMLSelectElement>) => setFontFamily(e.target.value),
  }) as const, []);

  const layoutHandlers = useMemo(() => ({
    handleColumnsChange: (cols: number) => setColumns(cols),
    handleShowStrokeChange: (checked: boolean) => setShowStroke(checked),
    handleCompressChange: (checked: boolean) => setCompress(checked),
  }) as const, []);

  const paginationHandlers = useMemo(() => ({
    handleEnablePaginationChange: (checked: boolean) => setEnablePagination(checked),
    handlePageWidthChange: (width: number) => setPageWidth(width),
    handlePageHeightChange: (height: number) => setPageHeight(height),
    handleLayoutColumnCountChange: (count: number) => setLayoutColumnCount(count),
    handleLayoutColumnGapChange: (gap: number) => setLayoutColumnGap(gap),
  }) as const, []);

  const paddingHandlers = useMemo(() => ({
    handlePaddingTopChange: (value: number) => setPaddingTop(value),
    handlePaddingBottomChange: (value: number) => setPaddingBottom(value),
    handlePaddingLeftChange: (value: number) => setPaddingLeft(value),
    handlePaddingRightChange: (value: number) => setPaddingRight(value),
  }) as const, []);

  const featureHandlers = useMemo(() => ({
    handleEnableGoogleFontsChange: (checked: boolean) => setEnableGoogleFonts(checked),
  }) as const, []);

  const navigationHandlers = useMemo(() => ({
    handlePrevPage: () => setViewPage(p => Math.max(1, p - 1)),
    handleNextPage: () => setViewPage(p => Math.min(totalPages, p + 1)),
  }) as const, [totalPages]);

  // Inject Google Fonts (Updated to depend on switch)
  useEffect(() => {
    if (!enableGoogleFonts) return; // Only load if enabled

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+SC:wght@100..700&family=IBM+Plex+Serif+SC:wght@100..700&family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@100..900&family=Noto+Serif+SC:wght@200..900&family=ZCOOL+QingKe+HuangYou&family=ZCOOL+XiaoWei&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [enableGoogleFonts]);

  // Listen for Font Loads (Updated dependencies)
  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    const fontSpec = `16px ${fontFamily}`;
    (document as any).fonts.load(fontSpec).then(() => {
      console.log(`Font loaded/ready: ${fontFamily}`);
      setFontLoadTrigger(prev => prev + 1);
    });
  }, [fontFamily, enableGoogleFonts]);

  // Layout & Render via Engine
  useEffect(() => {
    if (!canvasRef.current || !engine.current) return;
    
    // Update Engine State
    engine.current.setOptions(options);
    engine.current.layout(text, fontSize);

    // Sync state back to UI
    const total = engine.current.getTotalPages();
    setTotalPages(total);
    
    // Validate view page
    const safeViewPage = Math.min(Math.max(viewPage, 1), total);
    if (safeViewPage !== viewPage) setViewPage(safeViewPage);

    // Render
    engine.current.renderToCanvas(canvasRef.current, safeViewPage, showStroke);

  }, [text, fontSize, options, viewPage, fontLoadTrigger, showStroke]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col items-center py-8 px-4">
      
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-serif mb-2 text-gray-800">
            <ruby className="ruby-position-under">
              活<rt className="text-sm text-gray-400 font-sans font-normal">huó</rt>
              字<rt className="text-sm text-gray-400 font-sans font-normal">zì</rt>
              -ng
            </ruby>
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
            A modern CJK typography engine for the web.
            <br/>
            <span className="text-xs">Based on the legacy engine by Icemic Jia.</span>
        </p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Settings size={20} />
              <h2 className="font-bold text-lg">Configuration</h2>
            </div>
            
            <ControlGroup label="Typography">
                <NumberControl
                    label="Text Size"
                    value={fontSize}
                    onChange={typographyHandlers.handleFontSizeChange}
                    min={12} max={96} suffix="px"
                />
                <NumberControl
                    label="Grid Size"
                    value={gridSize}
                    onChange={typographyHandlers.handleGridSizeChange}
                    min={12} max={96} suffix="px"
                />
                <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Font Family</label>
                    <select
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        value={fontFamily}
                        onChange={typographyHandlers.handleFontFamilyChange}
                    >
                        {FONT_PRESETS.map((font, idx) => (
                            <option key={idx} value={font.value}>{font.label}</option>
                        ))}
                    </select>
                </div>
            </ControlGroup>

            <ControlGroup label="Layout">
                <NumberControl
                    label={enablePagination ? "Chars / Line (Auto)" : "Chars / Line"}
                    value={options.column}
                    onChange={layoutHandlers.handleColumnsChange}
                    min={10} max={60}
                    disabled={enablePagination}
                />
            </ControlGroup>

             <div className="border-b border-gray-100 pb-3 mb-5">
                 <div className="flex items-center gap-2 mb-3 text-indigo-600">
                    <LayoutTemplate size={18} />
                    <h2 className="font-bold text-sm">Page & Columns</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input type="checkbox" checked={enablePagination} onChange={e => paginationHandlers.handleEnablePaginationChange(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                    <span className="text-sm font-semibold">Enable Pagination</span>
                </label>

                {enablePagination && (
                    <div className="space-y-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <NumberControl label="Page Width" value={pageWidth} onChange={paginationHandlers.handlePageWidthChange} min={300} max={1200} step={10} suffix="px"/>
                        <NumberControl label="Page Height" value={pageHeight} onChange={paginationHandlers.handlePageHeightChange} min={300} max={1600} step={10} suffix="px"/>

                        <div className="border-t border-gray-200 my-3"></div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Padding</label>
                        <div className="flex flex-col gap-1">
                            <NumberControl label="Top" value={paddingTop} onChange={paddingHandlers.handlePaddingTopChange} min={0} max={200} step={5} className="mb-0" />
                            <NumberControl label="Bottom" value={paddingBottom} onChange={paddingHandlers.handlePaddingBottomChange} min={0} max={200} step={5} className="mb-0" />
                            <NumberControl label="Left" value={paddingLeft} onChange={paddingHandlers.handlePaddingLeftChange} min={0} max={200} step={5} className="mb-0" />
                            <NumberControl label="Right" value={paddingRight} onChange={paddingHandlers.handlePaddingRightChange} min={0} max={200} step={5} className="mb-0" />
                        </div>

                        <div className="border-t border-gray-200 my-3"></div>
                        <NumberControl label="Text Columns" value={layoutColumnCount} onChange={paginationHandlers.handleLayoutColumnCountChange} min={1} max={4} step={1}/>
                        <NumberControl label="Column Gap" value={layoutColumnGap} onChange={paginationHandlers.handleLayoutColumnGapChange} min={0} max={100} step={5} suffix="px"/>
                    </div>
                )}
                {!enablePagination && (
                    <div className="space-y-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Padding</label>
                        <div className="flex flex-col gap-1">
                            <NumberControl label="Top" value={paddingTop} onChange={paddingHandlers.handlePaddingTopChange} min={0} max={200} step={5} className="mb-0" />
                            <NumberControl label="Bottom" value={paddingBottom} onChange={paddingHandlers.handlePaddingBottomChange} min={0} max={200} step={5} className="mb-0" />
                            <NumberControl label="Left" value={paddingLeft} onChange={paddingHandlers.handlePaddingLeftChange} min={0} max={200} step={5} className="mb-0" />
                            <NumberControl label="Right" value={paddingRight} onChange={paddingHandlers.handlePaddingRightChange} min={0} max={200} step={5} className="mb-0" />
                        </div>
                    </div>
                )}
            </div>

            <ControlGroup label="Debug & Features">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-indigo-700">
                        <input type="checkbox" checked={enableGoogleFonts} onChange={e => featureHandlers.handleEnableGoogleFontsChange(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-sm font-semibold flex items-center gap-1"><Globe size={14}/> Load Google Fonts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={showStroke} onChange={e => layoutHandlers.handleShowStrokeChange(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-sm">Show Grid Bounds</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={compress} onChange={e => layoutHandlers.handleCompressChange(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                        <span className="text-sm">Punctuation Compression</span>
                    </label>
                </div>
            </ControlGroup>

          </div>
        </div>

        {/* Canvas Output */}
        <div className="lg:col-span-2">

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-5">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Type size={20} />
              <h2 className="font-bold text-lg">Input Text</h2>
            </div>
            <textarea
                className="w-full h-40 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-sans"
                value={text}
                onChange={e => textHandlers.handleTextChange(e.target.value)}
            />
            <div className="flex gap-2 justify-end mt-2">
                <button onClick={() => textHandlers.handleSampleTextChange('beiying')} className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 border rounded transition-colors text-left">📜 Classic</button>
                <button onClick={() => textHandlers.handleSampleTextChange('mixed')} className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 border rounded transition-colors text-left">🎌 Mixed CJK</button>
                <button onClick={() => textHandlers.handleSampleTextChange('lorem')} className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 border rounded transition-colors text-left">🔤 Western</button>
                <button onClick={() => textHandlers.handleSampleTextChange('emoji')} className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 border rounded transition-colors text-left">✨ Emoji</button>
            </div>
          </div>
            <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-200 overflow-hidden" ref={containerRef}>            
                {/* Scrollable Area */}
                <div className="overflow-auto max-h-[800px] p-8 flex justify-center bg-gray-100 min-h-[500px]">
                    <canvas ref={canvasRef} className="shadow-lg border border-gray-200 bg-white" />
                </div>

                {/* Page Navigation Footer */}
                {enablePagination && (
                    <div className="bg-gray-50 border-t p-3 flex justify-between items-center">
                         <div className="text-sm text-gray-500 flex items-center gap-2">
                            <FileText size={16} />
                            Page {viewPage} of {totalPages}
                         </div>
                         <div className="flex gap-2">
                             <button
                                onClick={navigationHandlers.handlePrevPage}
                                disabled={viewPage === 1}
                                className="p-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                <ChevronLeft size={20} />
                             </button>
                             <button
                                onClick={navigationHandlers.handleNextPage}
                                disabled={viewPage === totalPages}
                                className="p-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                <ChevronRight size={20} />
                             </button>
                         </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}