import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { motion } from 'motion/react';

const ARRAY_SIZE = 20;
const ANIMATION_SPEED_MS = 50;

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [swappingIndices, setSwappingIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const stopSortingRef = useRef(false);

  useEffect(() => {
    resetArray();
  }, []);

  const resetArray = () => {
    stopSortingRef.current = true;
    setIsSorting(false);
    setComparingIndices([]);
    setSwappingIndices([]);
    setSortedIndices([]);
    
    const newArray = Array.from({ length: ARRAY_SIZE }, () => 
      Math.floor(Math.random() * 100) + 10
    );
    setArray(newArray);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    setIsSorting(true);
    stopSortingRef.current = false;
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopSortingRef.current) return;

        setComparingIndices([j, j + 1]);
        await sleep(ANIMATION_SPEED_MS);

        if (arr[j] > arr[j + 1]) {
          setSwappingIndices([j, j + 1]);
          await sleep(ANIMATION_SPEED_MS);
          
          // Swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          
          setSwappingIndices([]);
        }
      }
      setSortedIndices(prev => [...prev, n - i - 1]);
    }
    setSortedIndices(prev => [...prev, 0]); // First element is also sorted
    setComparingIndices([]);
    setIsSorting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-8">
      <div className="flex items-end justify-center gap-1 h-64 w-full max-w-2xl bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
        {array.map((value, idx) => {
          let color = "bg-indigo-500"; // Default
          if (comparingIndices.includes(idx)) color = "bg-yellow-500";
          if (swappingIndices.includes(idx)) color = "bg-red-500";
          if (sortedIndices.includes(idx)) color = "bg-green-500";

          return (
            <motion.div
              key={idx}
              layout
              className={`w-full rounded-t-md ${color} opacity-90`}
              style={{ height: `${value}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={resetArray}
          disabled={isSorting}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          <RotateCcw size={18} />
          Reset
        </button>
        <button
          onClick={bubbleSort}
          disabled={isSorting}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {isSorting ? <Pause size={18} /> : <Play size={18} />}
          {isSorting ? "Sorting..." : "Start Bubble Sort"}
        </button>
      </div>
      
      <div className="flex gap-6 text-sm text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-sm" /> Unsorted
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm" /> Comparing
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" /> Swapping
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm" /> Sorted
        </div>
      </div>
    </div>
  );
}
