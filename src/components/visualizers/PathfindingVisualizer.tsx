import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Pause, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROWS = 15;
const COLS = 25;
const SPEED = 20;

type NodeType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path';

interface Node {
  row: number;
  col: number;
  type: NodeType;
  distance: number;
  previousNode: Node | null;
}

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [nodeTypeToPlace, setNodeTypeToPlace] = useState<'wall' | 'start' | 'end'>('wall');
  
  // Refs for start and end positions to track them easily
  const startPos = useRef({ row: 7, col: 4 });
  const endPos = useRef({ row: 7, col: 20 });
  const isRunningRef = useRef(false);

  useEffect(() => {
    resetGrid();
  }, []);

  const createNode = (row: number, col: number): Node => {
    let type: NodeType = 'empty';
    if (row === startPos.current.row && col === startPos.current.col) type = 'start';
    if (row === endPos.current.row && col === endPos.current.col) type = 'end';
    
    return {
      row,
      col,
      type,
      distance: Infinity,
      previousNode: null,
    };
  };

  const resetGrid = () => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    setMouseIsPressed(true);
    handleMouseEnter(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed || isRunning) return;
    
    const newGrid = [...grid];
    const node = newGrid[row][col];

    if (nodeTypeToPlace === 'wall') {
      if (node.type !== 'start' && node.type !== 'end') {
        node.type = node.type === 'wall' ? 'empty' : 'wall';
        setGrid(newGrid);
      }
    }
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNeighbors = (node: Node, grid: Node[][]) => {
    const neighbors = [];
    const { row, col } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  };

  const animatePath = async (endNode: Node) => {
    const pathInOrder = [];
    let currentNode: Node | null = endNode;
    while (currentNode !== null) {
      pathInOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }

    for (const node of pathInOrder) {
      if (node.type !== 'start' && node.type !== 'end') {
        node.type = 'path';
        setGrid([...grid]);
        await new Promise(resolve => setTimeout(resolve, SPEED * 2));
      }
    }
  };

  const runBFS = async () => {
    if (isRunning) return;
    setIsRunning(true);
    isRunningRef.current = true;

    const newGrid = [...grid];
    // Reset visited/path nodes but keep walls
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const node = newGrid[r][c];
        if (node.type === 'visited' || node.type === 'path') {
          node.type = 'empty';
        }
        node.distance = Infinity;
        node.previousNode = null;
      }
    }
    setGrid(newGrid);

    const startNode = newGrid[startPos.current.row][startPos.current.col];
    const endNode = newGrid[endPos.current.row][endPos.current.col];
    
    startNode.distance = 0;
    const queue: Node[] = [startNode];
    const visitedNodesInOrder: Node[] = [];

    while (queue.length > 0) {
      if (!isRunningRef.current) break;

      const currentNode = queue.shift()!;
      
      if (currentNode.type === 'wall') continue;
      if (currentNode.distance === Infinity) break; // Should not happen for BFS if connected

      visitedNodesInOrder.push(currentNode);

      if (currentNode === endNode) {
        await animatePath(endNode);
        setIsRunning(false);
        isRunningRef.current = false;
        return;
      }

      const neighbors = getNeighbors(currentNode, newGrid);
      for (const neighbor of neighbors) {
        if (neighbor.distance === Infinity && neighbor.type !== 'wall') {
          neighbor.distance = currentNode.distance + 1;
          neighbor.previousNode = currentNode;
          queue.push(neighbor);
        }
      }

      // Visualize visited
      if (currentNode.type !== 'start' && currentNode.type !== 'end') {
        currentNode.type = 'visited';
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, SPEED));
      }
    }
    
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const runDFS = async () => {
    if (isRunning) return;
    setIsRunning(true);
    isRunningRef.current = true;

    const newGrid = [...grid];
    // Reset visited/path nodes but keep walls
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const node = newGrid[r][c];
        if (node.type === 'visited' || node.type === 'path') {
          node.type = 'empty';
        }
        node.distance = Infinity;
        node.previousNode = null;
      }
    }
    setGrid(newGrid);

    const startNode = newGrid[startPos.current.row][startPos.current.col];
    const endNode = newGrid[endPos.current.row][endPos.current.col];
    
    const stack: Node[] = [startNode];
    const visitedNodesInOrder: Node[] = [];

    while (stack.length > 0) {
      if (!isRunningRef.current) break;

      const currentNode = stack.pop()!;
      
      if (currentNode.type === 'wall') continue;
      if (currentNode.type === 'visited' && currentNode !== startNode) continue;

      visitedNodesInOrder.push(currentNode);

      if (currentNode === endNode) {
        await animatePath(endNode);
        setIsRunning(false);
        isRunningRef.current = false;
        return;
      }

      // Visualize visited
      if (currentNode.type !== 'start' && currentNode.type !== 'end') {
        currentNode.type = 'visited';
        setGrid([...newGrid]);
        await new Promise(resolve => setTimeout(resolve, SPEED));
      }

      const neighbors = getNeighbors(currentNode, newGrid);
      for (const neighbor of neighbors) {
        if (neighbor.type !== 'visited' && neighbor.type !== 'wall') {
          neighbor.previousNode = currentNode;
          stack.push(neighbor);
        }
      }
    }
    
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const clearWalls = () => {
    if (isRunning) return;
    const newGrid = grid.map(row => row.map(node => {
      if (node.type === 'wall') {
        return { ...node, type: 'empty' as NodeType };
      }
      return node;
    }));
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-6">
      <div className="flex flex-wrap gap-4 justify-center items-center">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <div className="w-4 h-4 bg-green-500 rounded-sm" /> Start
          <div className="w-4 h-4 bg-red-500 rounded-sm" /> End
          <div className="w-4 h-4 bg-neutral-700 rounded-sm" /> Wall
          <div className="w-4 h-4 bg-indigo-500 rounded-sm" /> Visited
          <div className="w-4 h-4 bg-yellow-400 rounded-sm" /> Path
        </div>
        
        <div className="h-6 w-px bg-neutral-800" />

        <button
          onClick={resetGrid}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg disabled:opacity-50 transition-colors text-sm"
        >
          <RotateCcw size={16} /> Reset
        </button>
        <button
          onClick={clearWalls}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg disabled:opacity-50 transition-colors text-sm"
        >
          Clear Walls
        </button>
        <button
          onClick={runBFS}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-colors text-sm"
        >
          <Play size={16} /> Run BFS
        </button>
        <button
          onClick={runDFS}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 transition-colors text-sm"
        >
          <Play size={16} /> Run DFS
        </button>
      </div>

      <div 
        className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 select-none touch-none overflow-auto max-w-full"
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="grid gap-px bg-neutral-800"
          style={{ 
            gridTemplateColumns: `repeat(${COLS}, minmax(20px, 1fr))`,
          }}
        >
          {grid.map((row, rowIdx) => (
            row.map((node, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                onMouseUp={handleMouseUp}
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-200 ease-out",
                  node.type === 'empty' && "bg-neutral-950 hover:bg-neutral-900",
                  node.type === 'wall' && "bg-neutral-700",
                  node.type === 'start' && "bg-green-500",
                  node.type === 'end' && "bg-red-500",
                  node.type === 'visited' && "bg-indigo-500 animate-pulse",
                  node.type === 'path' && "bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/50 z-10"
                )}
              />
            ))
          ))}
        </div>
      </div>
      
      <p className="text-neutral-500 text-sm">
        Click and drag to draw walls. BFS guarantees the shortest path in an unweighted grid.
      </p>
    </div>
  );
}
