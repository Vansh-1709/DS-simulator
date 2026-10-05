import { TopicMeta } from '../types';

export const TOPICS: TopicMeta[] = [
  {
    id: 'array',
    name: 'Arrays',
    tagline: 'Contiguous memory sequence with instant O(1) indexed lookups',
    category: 'Linear Structures',
    description: 'A fundamental structure storing elements in contiguous memory slots. Supports lightning-fast constant-time indexed access, but requires shifting elements for intermediate insertions and deletions.',
    gameTitle: 'Binary Search Speedrun & Two-Pointer Swap',
    gameDescription: 'Divide and conquer! Find hidden targets in minimum comparisons using binary search boundaries, or solve two-pointer inversion puzzles.',
    color: 'emerald',
    accentHex: '#10B981',
    complexity: {
      access: 'O(1)',
      search: 'O(n) / O(log n)',
      insertion: 'O(n)',
      deletion: 'O(n)',
      space: 'O(n)',
    },
    realWorldExamples: [
      'CPU Cache lines and hardware buffers',
      'Pixel framebuffers for GPU rendering',
      'Lookup tables and constant-time math tables',
      'Spreadsheet cell vectors and columnar storage'
    ]
  },
  {
    id: 'tree',
    name: 'Binary Search Tree',
    tagline: 'Hierarchical node network with logarithmic search and sorted in-order traversal',
    category: 'Hierarchical Structures',
    description: 'A rooted tree where each node has at most two children, maintaining the invariant that all left subtree keys are smaller and all right subtree keys are larger.',
    gameTitle: 'BST Master: Placement & Traversal Harvest',
    gameDescription: 'Route incoming keys to their exact node positions obeying the BST property, then harvest fruit nodes in Pre-Order, In-Order, and Post-Order.',
    color: 'amber',
    accentHex: '#F59E0B',
    complexity: {
      access: 'O(log n)',
      search: 'O(log n)',
      insertion: 'O(log n)',
      deletion: 'O(log n)',
      space: 'O(n)',
    },
    realWorldExamples: [
      'Database B-Tree and LSM indexing engines',
      'Abstract Syntax Trees (AST) in compilers',
      'File system directory hierarchies',
      'Decision trees in game AI and predictive routing'
    ]
  },
  {
    id: 'stack',
    name: 'Stack (LIFO)',
    tagline: 'Last-In, First-Out sequence essential for parsing, recursion, and undo logs',
    category: 'Linear Restricted',
    description: 'A collection governed by the LIFO rule: the most recently pushed element is the first one popped. Crucial for backtracking, call frames, and nested syntax validation.',
    gameTitle: 'Cargo LIFO & Bracket Equalizer',
    gameDescription: 'Balance incoming syntax brackets and ship container crates using strictly push and pop operations before the buffer overflows!',
    color: 'cyan',
    accentHex: '#06B6D4',
    complexity: {
      access: 'O(n)',
      search: 'O(n)',
      insertion: 'O(1)',
      deletion: 'O(1)',
      space: 'O(n)',
    },
    realWorldExamples: [
      'Program execution Call Stack and recursion frames',
      'Undo / Redo stacks in text editors (Ctrl+Z)',
      'Syntax bracket matching in IDE linters',
      'Browser navigation history (Back button)'
    ]
  },
  {
    id: 'queue',
    name: 'Queue & Circular Buffer',
    tagline: 'First-In, First-Out discipline for task scheduling, streaming, and buffering',
    category: 'Linear Restricted',
    description: 'A sequential structure adhering to FIFO: elements enter at the rear and depart from the front. Includes circular ring buffers that prevent memory re-allocation.',
    gameTitle: 'Packet Router & Conveyor Master',
    gameDescription: 'Manage incoming data packets arriving at high frequency, prevent buffer overflows, and dispatch packets to matched destination channels!',
    color: 'violet',
    accentHex: '#8B5CF6',
    complexity: {
      access: 'O(n)',
      search: 'O(n)',
      insertion: 'O(1)',
      deletion: 'O(1)',
      space: 'O(n)',
    },
    realWorldExamples: [
      'Operating system CPU scheduling and print spoolers',
      'Audio & Video streaming playback ring buffers',
      'Breadth-First Search (BFS) frontier queues',
      'Message brokers like Kafka and RabbitMQ'
    ]
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    tagline: 'Non-contiguous dynamic nodes linked via pointers, enabling instant O(1) splices',
    category: 'Linear Dynamic',
    description: 'Nodes distributed across heap memory, each holding data and a pointer to the successor (and predecessor in Doubly-Linked Lists). No fixed capacity or costly mass-shifting.',
    gameTitle: 'Pointer Rescue & Loop Detective',
    gameDescription: 'Repair severed pointer cables, reverse chains without losing nodes, and detect sneaky memory cycle loops using Floyd’s algorithm!',
    color: 'rose',
    accentHex: '#F43F5E',
    complexity: {
      access: 'O(n)',
      search: 'O(n)',
      insertion: 'O(1)*',
      deletion: 'O(1)*',
      space: 'O(n)',
    },
    realWorldExamples: [
      'Music playlist next/previous tracks (Doubly Linked)',
      'Blockchain blocks chained via cryptographic hashes',
      'Memory free-list allocators in OS kernels',
      'Hash map chaining for collision resolution'
    ]
  },
  {
    id: 'graph',
    name: 'Graph & Traversals',
    tagline: 'Vertices and interconnecting edges modeling networks, maps, and relationships',
    category: 'Non-Linear Structures',
    description: 'A versatile web of vertices connected by directional or bidirectional edges. Master Breadth-First Search (BFS), Depth-First Search (DFS), and Dijkstra’s shortest path algorithm.',
    gameTitle: 'Grid Navigator: Shortest Path Dash',
    gameDescription: 'Navigate through a network of nodes, avoiding dead ends, computing minimum edge costs, and unlocking destination gateways before the clock stops!',
    color: 'sky',
    accentHex: '#0284C7',
    complexity: {
      access: 'O(V + E)',
      search: 'O(V + E)',
      insertion: 'O(1)',
      deletion: 'O(V + E)',
      space: 'O(V + E)',
    },
    realWorldExamples: [
      'GPS navigation and route planning (Google Maps)',
      'Social networks and follower friendship graphs',
      'Internet routing protocols (BGP, OSPF)',
      'Recommendation engines and knowledge graphs'
    ]
  }
];
