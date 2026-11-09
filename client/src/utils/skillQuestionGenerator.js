/**
 * Question generator utility for PeerX Skill Exchange
 * Generates 15 high-quality Mid-Term questions and 15 Final Evaluation questions (30 total)
 * tailored to the course skill name.
 */

export const generateSkillQuestions = (skillName = 'React.js') => {
  const s = (skillName || '').toLowerCase();

  if (s.includes('python')) {
    return {
      midterm: [
        {
          questionText: 'What is the primary difference between a list and a tuple in Python?',
          options: ['Lists are immutable while tuples are mutable', 'Lists are mutable while tuples are immutable', 'Tuples can only store numbers', 'Lists cannot be indexed'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'Which keyword is used to create a generator function in Python?',
          options: ['return', 'generate', 'yield', 'produce'],
          correctOptionIndex: 2,
          points: 10,
        },
        {
          questionText: 'What is the time complexity of searching for a key in a Python dictionary on average?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correctOptionIndex: 0,
          points: 10,
        },
        {
          questionText: 'How do you handle exceptions in Python?',
          options: ['try/catch block', 'try/except block', 'do/catch block', 'catch/throw block'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What does the *args parameter in a Python function definition allow?',
          options: ['Passing keyword arguments only', 'Passing any number of positional arguments as a tuple', 'Passing a single list argument', 'Restricting arguments to integers'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the output of bool([]) in Python?',
          options: ['True', 'False', 'None', 'Error'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'Which built-in function returns the number of items in a collection?',
          options: ['size()', 'count()', 'len()', 'length()'],
          correctOptionIndex: 2,
          points: 10,
        },
        {
          questionText: 'What does a list comprehension [x**2 for x in range(5)] produce?',
          options: ['[0, 1, 4, 9, 16]', '[1, 4, 9, 16, 25]', '[0, 2, 4, 6, 8]', '[1, 2, 3, 4, 5]'],
          correctOptionIndex: 0,
          points: 10,
        },
        {
          questionText: 'In Python OOP, what does the __init__ method represent?',
          options: ['The object destructor', 'The constructor method initializing new instances', 'A static class helper', 'The class inheritance declaration'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What does the "self" parameter represent in class methods?',
          options: ['A global singleton object', 'The current instance of the class', 'The superclass definition', 'The Python interpreter context'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'Which Python module is standard for regular expressions?',
          options: ['regex', 're', 'string', 'pyregex'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'How do you open a file for reading safely ensuring it closes automatically?',
          options: ['open("file.txt", "r")', 'with open("file.txt", "r") as f:', 'using open("file.txt") as f:', 'try open("file.txt") as f:'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the purpose of the "pass" statement in Python?',
          options: ['To terminate a loop immediately', 'A null statement serving as a syntactical placeholder', 'To pass a variable by reference', 'To trigger garbage collection'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What data structure does Python set use internally?',
          options: ['Linked List', 'Hash Table', 'Binary Search Tree', 'Dynamic Array'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'Which operator is used for integer floor division in Python?',
          options: ['/', '//', '%', '^'],
          correctOptionIndex: 1,
          points: 10,
        },
      ],
      final: [
        {
          questionText: 'What is the Global Interpreter Lock (GIL) in CPython?',
          options: ['A lock preventing file system overwrites', 'A mutex that prevents multiple native threads from executing Python bytecodes simultaneously', 'A security sandbox for untrusted scripts', 'A database transaction isolation lock'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the primary difference between deepcopy and shallow copy in Python copy module?',
          options: ['Shallow copy copies nested objects recursively', 'Deepcopy recursively copies all nested objects, creating independent clones', 'Shallow copy is only for dictionaries', 'Deepcopy does not copy primitive values'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What does a Python decorator fundamentally do?',
          options: ['Modifies CSS styles in web frameworks', 'Takes a function as argument, extends its behavior, and returns a new function', 'Compiles Python to C code', 'Initializes class attributes'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'In asyncio, what keyword is used to pause coroutine execution waiting for a future/task?',
          options: ['pause', 'wait', 'await', 'yield from'],
          correctOptionIndex: 2,
          points: 10,
        },
        {
          questionText: 'What is the method resolution order (MRO) algorithm used in Python 3?',
          options: ['Depth-First Search', 'C3 Linearization algorithm', 'Breadth-First Search', 'Dijkstra Algorithm'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the difference between __str__ and __repr__?',
          options: ['__str__ is for developers, __repr__ is for end-users', '__str__ is readable for users, __repr__ provides unambiguous code representation for debugging', '__str__ returns bytes, __repr__ returns string', 'There is no difference'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the purpose of __slots__ in a Python class?',
          options: ['To allow dynamic attribute addition', 'To optimize memory by replacing instance __dict__ with a fixed set of attributes', 'To implement multi-threading', 'To define abstract methods'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'Which tool is the standard package manager for Python?',
          options: ['npm', 'pip', 'cargo', 'gem'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'How does Python manage memory and clean up unused objects?',
          options: ['Manual malloc and free', 'Reference counting combined with a cyclic garbage collector', 'Mark-and-sweep only with no reference count', 'Stack allocation only'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is a context manager in Python implemented using?',
          options: ['__get__ and __set__', '__enter__ and __exit__', '__start__ and __stop__', '__open__ and __close__'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the difference between multiprocessing and threading in Python?',
          options: ['Multiprocessing creates separate memory spaces bypassing the GIL, while threading shares memory within one process', 'Threading bypasses the GIL while multiprocessing cannot', 'Multiprocessing is slower than single threading always', 'They are completely identical'],
          correctOptionIndex: 0,
          points: 10,
        },
        {
          questionText: 'What does the functools.lru_cache decorator do?',
          options: ['Encrypts return values', 'Memoizes callable results with a Least Recently Used eviction cache', 'Enforces strict type checking', 'Limits API rate calls'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is a metaclass in Python?',
          options: ['A class that defines the rules and creation of other classes (class of a class)', 'A class with only static methods', 'A base class for exceptions', 'An abstract interface definition'],
          correctOptionIndex: 0,
          points: 10,
        },
        {
          questionText: 'What does the "is" operator check in Python?',
          options: ['Value equality (equivalent to ==)', 'Object identity (whether two references point to the exact same memory address)', 'Type similarity', 'Subclass relationship'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'In typing module, how do you specify a function that takes an int and returns a string?',
          options: ['Callable[[int], str]', 'Function(int -> str)', 'Lambda[int: str]', 'Type[int, str]'],
          correctOptionIndex: 0,
          points: 10,
        },
      ],
    };
  }

  // Default: React / Modern Web / JavaScript
  return {
    midterm: [
      {
        questionText: 'Which React hook is used to persist mutable values across renders without causing re-renders?',
        options: ['useState', 'useRef', 'useEffect', 'useReducer'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'When does the cleanup function in useEffect run?',
        options: ['Only once when the browser window closes', 'Before unmounting and prior to re-executing effect on dependency update', 'Only in development mode', 'Synchronously during the initial render before DOM commit'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is the primary role of keys in React list rendering?',
        options: ['To provide CSS selectors', 'To help React identify which items have changed, been added, or removed', 'To encrypt list items', 'To order elements alphabetically'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What happens when you update state using useState with the exact same primitive value?',
        options: ['React re-renders all child components', 'React bails out without re-rendering children or firing effects', 'An error is thrown', 'State is reset to null'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is the Virtual DOM in React?',
        options: ['A direct binary copy of the real DOM tree in C++', 'A lightweight JavaScript in-memory representation of the actual DOM', 'A browser plugin requirement', 'A virtual machine executing JSX bytecode'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is the recommended way to pass data deeply through a component tree without prop drilling?',
        options: ['Global window variables', 'React Context API', 'LocalStorage polling', 'Document querySelector'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'Why should state in React never be mutated directly (e.g. state.push(item))?',
        options: ['It causes memory overflows', 'React uses shallow reference equality checks and will miss re-render triggers', 'Direct mutation is forbidden by JavaScript engine', 'It slows down CSS animation rates'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is the primary benefit of custom hooks in React?',
        options: ['Direct manipulation of browser DOM nodes', 'Extracting and reusing stateful component logic across different components', 'Speeding up CSS rendering speeds', 'Enabling multi-threaded JavaScript execution'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'Which hook should you use for complex state logic that involves multiple sub-values?',
        options: ['useRef', 'useReducer', 'useLayoutEffect', 'useImperativeHandle'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is a controlled component in React form handling?',
        options: ['A component rendered inside an iframe', 'An input element whose value is controlled by React component state', 'A component with disabled event listeners', 'A read-only server component'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'When does useEffect execute compared to useLayoutEffect?',
        options: ['useLayoutEffect runs asynchronously after paint; useEffect runs synchronously before paint', 'useEffect runs asynchronously after paint; useLayoutEffect runs synchronously after DOM mutations before paint', 'They execute at the exact same moment', 'useEffect only runs on server side'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is JSX in React?',
        options: ['A JavaScript syntax extension that resembles HTML and compiles to React.createElement calls', 'A separate templating language like Handlebars', 'A new binary format replacing JavaScript', 'A style sheet language'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'What is the purpose of React.Fragment (<>...</>)?',
        options: ['To cache API network responses', 'To group a list of children without adding extra nodes to the DOM', 'To split code into chunks', 'To render components on the GPU'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What does the dependency array in useEffect([]) with empty brackets indicate?',
        options: ['The effect runs on every single render', 'The effect runs only once after the initial render (mount)', 'The effect never runs', 'The effect runs continuously on a loop'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is "lifting state up" in React architecture?',
        options: ['Moving state to the closest common ancestor of components that need it', 'Storing state in cookies', 'Exporting state to a global node server', 'Converting functional components to class components'],
        correctOptionIndex: 0,
        points: 10,
      },
    ],
    final: [
      {
        questionText: 'What is the primary benefit of React.memo in performance optimization?',
        options: ['It caches network fetch requests', 'It memoizes a component, skipping re-renders if props have not changed', 'It compresses images automatically', 'It prevents all re-renders permanently'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'When should you use useCallback vs useMemo?',
        options: ['useCallback memoizes a callback function instance; useMemo memoizes the computed result value', 'useCallback is only for class components; useMemo is for hooks', 'useCallback runs on server; useMemo runs on client', 'They are completely interchangeable aliases'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'Why should dependency arrays in useEffect be complete and exhaustive?',
        options: ['To prevent infinite re-rendering and stale state closures', 'To increase browser memory allocation limits', 'To automatically compile TypeScript into WebAssembly', 'To eliminate all network latency'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'What is code-splitting in React applications using React.lazy and Suspense?',
        options: ['Splitting CSS from HTML files', 'Dynamically importing component bundles on demand rather than loading all JavaScript upfront', 'Running code across multiple worker threads', 'Splitting state into separate reducers'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What problem does an Error Boundary solve in a React application?',
        options: ['Catches JavaScript syntax errors before bundling', 'Catches JavaScript errors anywhere in its child component tree, logs them, and displays a fallback UI', 'Fixes network timeouts automatically', 'Validates form schema inputs'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'In React 18, what is automatic batching?',
        options: ['Grouping network requests into a single HTTP packet', 'Batching state updates inside promises, setTimeout, and native event handlers into a single re-render', 'Compiling multiple components into one file', 'Batching database writes'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is the purpose of the useId hook introduced in React 18?',
        options: ['To generate unique IDs that are consistent between server and client hydration', 'To generate UUIDs for database primary keys', 'To track user session login tokens', 'To measure DOM rendering speed'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'What is the primary difference between client-side rendering (CSR) and server-side rendering (SSR)?',
        options: ['CSR renders HTML on the browser with JS; SSR pre-renders HTML on the server before sending to browser', 'CSR is only for mobile apps; SSR is only for desktops', 'CSR does not require JavaScript', 'SSR is always slower than CSR'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'What does the useTransition hook accomplish in React 18+?',
        options: ['Animates CSS transitions with keyframes', 'Marks non-urgent state updates so the UI remains responsive and interruptible', 'Manages page routing transitions', 'Translates text to different languages'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is hydration in modern React frameworks (like Next.js)?',
        options: ['Cleaning up unused memory variables', 'Attaching event listeners to server-rendered HTML so it becomes interactive', 'Downloading static assets to disk', 'Compiling Tailwind CSS classes'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What happens if you update state during the render phase of a component without a condition?',
        options: ['Nothing happens', 'Causes an infinite re-render loop exceeding max update depth', 'The component freezes permanently without error', 'React rolls back to initial state'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'Which React hook allows a child component to expose specific imperative methods to a parent ref?',
        options: ['useImperativeHandle', 'useLayoutEffect', 'useDeferredValue', 'useInsertionEffect'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'What is stale closure in React hooks?',
        options: ['A closed WebSocket connection', 'When a hook callback captures older state or prop values from a previous render because of a missing dependency', 'A memory leak in Node.js server', 'An unclosed HTML tag in JSX'],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'How does Redux / Zustand manage global state differently from Context API?',
        options: ['Context triggers re-renders on all consumers when value changes, while state managers support selective fine-grained subscriptions', 'Context is stored on disk; Redux is stored in RAM', 'Context only works on class components', 'There is no functional difference'],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'What is the purpose of the key prop when passed to an entire component instance <Child key={id} />?',
        options: ['Encrypts the component props', 'Forces React to discard the old component instance, unmount it, and recreate state from scratch when key changes', 'Renders the component on a separate GPU thread', 'Registers the component for search engine indexing'],
        correctOptionIndex: 1,
        points: 10,
      },
    ],
  };
};
