import { useRef } from 'react';
import { HuoziEngine } from '../core/engine';
import type { LayoutOptions } from '../core/types';

export const useHuoziEngine = (initialOptions?: LayoutOptions) => {
  const engineRef = useRef<HuoziEngine | null>(null);
  
  // Initialize the engine if it doesn't exist
  if (!engineRef.current) {
    engineRef.current = new HuoziEngine(initialOptions);
  }
  
  return engineRef;
};
