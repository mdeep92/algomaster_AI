import { BookOpen, Code, GitGraph, Home, Layers, LayoutGrid, Settings, Trophy } from "lucide-react";

export type Topic = {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'data-structures' | 'algorithms' | 'advanced';
  icon: any;
};

export const TOPICS: Topic[] = [
  {
    id: 'big-o',
    title: 'Big O Notation',
    description: 'Understanding time and space complexity analysis.',
    category: 'basics',
    icon: GitGraph
  },
  {
    id: 'arrays',
    title: 'Arrays & Strings',
    description: 'Fundamental linear data structures and manipulation techniques.',
    category: 'data-structures',
    icon: LayoutGrid
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    description: 'Singly and doubly linked lists, pointer manipulation.',
    category: 'data-structures',
    icon: GitGraph
  },
  {
    id: 'stacks-queues',
    title: 'Stacks & Queues',
    description: 'LIFO and FIFO data structures and their applications.',
    category: 'data-structures',
    icon: Layers
  },
  {
    id: 'trees',
    title: 'Trees & BST',
    description: 'Hierarchical structures, traversals, and binary search trees.',
    category: 'data-structures',
    icon: GitGraph
  },
  {
    id: 'graphs',
    title: 'Graphs',
    description: 'Nodes, edges, BFS, DFS, and shortest path algorithms.',
    category: 'data-structures',
    icon: GitGraph
  },
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description: 'Bubble, Merge, Quick, and Heap sort implementations.',
    category: 'algorithms',
    icon: Layers
  },
  {
    id: 'searching',
    title: 'Searching',
    description: 'Binary search and its variations.',
    category: 'algorithms',
    icon: BookOpen
  },
  {
    id: 'dp',
    title: 'Dynamic Programming',
    description: 'Solving complex problems by breaking them down into simpler subproblems.',
    category: 'advanced',
    icon: Trophy
  }
];
