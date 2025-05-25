Here is the beginning of **Chalchitra.py Cookbook: The Definitive Guide to Motion Canvas**.

---

## Part 1: Foundations 🏗️

This section covers the absolute essentials to get you started with Motion Canvas, from installation to understanding the core building blocks of any animation.

---

### 1.1 Setting Up Your Motion Canvas Environment

**Goal:** To install Motion Canvas and create a new project.

**Core Concepts Involved:** Node.js, npm (Node Package Manager), Motion Canvas CLI.

**Steps:**

1.  **Install Node.js:**
    Motion Canvas requires Node.js (LTS version recommended). If you don't have it, download and install it from [nodejs.org](https://nodejs.org). This will also install `npm`.
    Verify installation in your terminal:

    ```bash
    node -v
    npm -v
    ```

2.  **Create a New Motion Canvas Project:**
    Open your terminal and run:

    ```bash
    npm init @motion-canvas@latest
    ```

    Follow the prompts:

    - **Project name:** e.g., `my-chalchitra-project`
    - **Language:** Choose **TypeScript**.
    - **Template:** Select a suitable template (e.g., the default 2D template).

3.  **Navigate to Project Directory:**

    ```bash
    cd my-chalchitra-project
    ```

4.  **Install Dependencies:**

    ```bash
    npm install
    ```

5.  **Start the Development Server:**
    ```bash
    npm start
    ```
    This usually opens the Motion Canvas editor in your browser (e.g., `http://localhost:9000`). You'll see a live preview of your animation.

**Key Files and Folders:**

- `src/`: Contains your project's source code.
  - `project.ts`: Defines the project settings and lists all scenes.
  - `scenes/`: Directory where your animation scene files (e.g., `example.tsx`) are stored.
- `package.json`: Lists project dependencies and scripts.
- `vite.config.ts`: Configuration for Vite, the build tool.
- `tsconfig.json`: TypeScript configuration.

---

### 1.2 Understanding Scenes

**Goal:** Learn what a Scene is and its basic structure. A Scene is where you define and orchestrate a distinct animation sequence.

**Core Concepts Involved:** `makeScene2D`, Generator Functions (`function*`), `view` object, `yield` / `yield*`.

**Basic Scene Structure:**

File: `src/scenes/myFirstScene.tsx`

```typescript
import { makeScene2D } from "@motion-canvas/2d";
// Import other components like Circle, Rect, etc. as needed
// import {Circle} from '@motion-canvas/2d';
// import {createRef} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  // 'view' is the main stage for this scene.
  // All visual elements are added to this 'view'.

  // Example: Add a shape (more on this later)
  // const circleRef = createRef<Circle>();
  // view.add(<Circle ref={circleRef} fill="red" size={100} />);

  // Animation commands go here, prefixed with 'yield*'
  // yield* circleRef().position.x(100, 1); // Animate x to 100 over 1 second

  // If no animation commands, at least one 'yield' is needed
  // for the scene to be valid and render its initial state.
  yield;
});
```

**Explanation:**

- **`import {makeScene2D} from '@motion-canvas/2d';`**: Imports the function to create a 2D scene.
- **`export default makeScene2D(function* (view) { ... });`**:
  - This defines your scene. `export default` makes it discoverable by `project.ts`.
  - `makeScene2D` takes a **generator function** (`function*`) as its argument.
  - **`view`**: This parameter passed to your generator function is the root of your scene's visual tree. It's the main "canvas" or "stage" onto which you'll add all your shapes and elements.
  - **Generator Function (`function*`)**: This special type of function can be paused and resumed. Motion Canvas uses this to execute your animation step-by-step.
    - **`yield`**: Pauses the function, renders the current state of the scene for one frame, and then resumes on the next frame.
    - **`yield* <animationTask>`**: Executes an animation task (like a tween or a sequence of animations) and waits for it to complete before moving to the next line in the generator function.

**Registering the Scene:**

To make your scene visible, you must add it to `src/project.ts`:

```typescript
import { makeProject } from "@motion-canvas/core";

// Import your scene file
import myFirstScene from "./scenes/myFirstScene?scene"; // The '?scene' suffix is important

export default makeProject({
  // Add your imported scene to the scenes array
  scenes: [myFirstScene],
});
```

---

### 1.3 Nodes: The Building Blocks

**Goal:** Understand that everything visual in a scene is a "Node" and how these nodes form a hierarchy.

**Core Concepts Involved:** `Node` class (base for all visual elements), component hierarchy (scene graph).

**What is a Node?**

A **Node** is the fundamental object for anything that exists in your scene. This includes:

- **Visual Elements:** Shapes (`Rect`, `Circle`, `Line`), text (`Txt`), images (`Img`), video (`Video`).
- **Layout Elements:** `Layout` (for Flexbox-like positioning), generic `Node` (often used as a container to group other nodes).
- **Camera:** The `Camera` itself is a node that controls the viewpoint.

**Node Hierarchy (Scene Graph):**

Nodes are organized in a tree-like structure.

- The `view` object (from `makeScene2D(function* (view)`) is the **root node** of this tree for your scene.
- When you add a node to the view (e.g., `view.add(<Circle />)`), that `Circle` becomes a **child** of the `view`.
- Nodes can also have their own children, creating nested structures. For example, a `Layout` node will contain other nodes as its children.

```
view (root)
  ├── Rect (child of view)
  ├── Circle (child of view)
  └── Layout (child of view)
      ├── Txt (child of Layout)
      └── Img (child of Layout)
```

**Key Characteristics:**

- **Properties:** Nodes have properties that define their appearance and behavior (e.g., `position`, `size`, `fill`, `opacity`). Many of these properties are "signals," meaning they can be animated or made reactive.
- **Transformations:** Changes to a parent node's properties (like `scale` or `position`) typically affect its children.
- **Order of Addition:** The order in which you add nodes to a parent (e.g., using `view.add()`) can affect their default rendering order (stacking) if they have the same `zIndex`.

**Example: Adding Nodes**

```typescript
// Inside makeScene2D(function* (view) { ... })
import { Rect, Circle, Txt, Node as MotionNode } from "@motion-canvas/2d"; // Renaming Node to avoid conflict

const rectNode = <Rect fill="blue" width={200} height={100} />;
const circleNode = <Circle fill="red" size={80} x={150} />;

// A generic MotionNode can be used for grouping
const groupNode = (
  <MotionNode x={-100} y={100}>
    <Txt text="Grouped" fill="white" />
    <Circle fill="yellow" size={30} y={50} />
  </MotionNode>
);

view.add(rectNode);
view.add(circleNode);
view.add(groupNode);

yield;
```

- In this example, `rectNode` and `circleNode` are direct children of `view`.
- `groupNode` is also a child of `view`, and it, in turn, contains a `Txt` and another `Circle` node as its children. If `groupNode` is moved or scaled, its children will be affected relative to `groupNode`.

---

### 1.4 References (`createRef`): Naming and Controlling Nodes

**Goal:** Learn how to create and use references to access and manipulate specific nodes after they've been defined.

**Core Concepts Involved:** `createRef()`, `ref` property.

**Why Use References?**

When you define a node using TSX (e.g., `<Circle />`), you're describing its initial state. To animate it or change its properties later in your `function*` (generator function), you need a way to refer to that specific instance of the node. This is done using **references**.

**Steps:**

1.  **Import `createRef`:**

    ```typescript
    import { createRef } from "@motion-canvas/core";
    ```

2.  **Declare a Reference Variable:**
    Before you use the reference, declare it using `createRef<NodeType>()`. The `<NodeType>` part (e.g., `<Circle>`) is a TypeScript generic that tells Motion Canvas what kind of node this reference will point to. This enables better type checking and editor autocompletion.

    ```typescript
    // Inside makeScene2D(function* (view) { ... })
    const myCircleRef = createRef<Circle>();
    const myRectangleRef = createRef<Rect>();
    ```

3.  **Assign the Reference in TSX:**
    When defining your node, use the `ref` attribute to assign the created reference.

    ```typescript
    // Inside view.add(...) or as a direct child of another node
    <Circle ref={myCircleRef} fill="green" size={120} />
    <Rect ref={myRectangleRef} fill="purple" width={150} height={70} x={200} />
    ```

4.  **Use the Reference:**
    After the node has been "mounted" (i.e., after the `view.add()` call and typically after the first `yield` that renders the initial state), you can use the reference to control the node. When calling methods on the node via its reference, you use parentheses `()` after the ref name.

    ```typescript
    // ... after view.add(...) and an initial yield (if needed for initial state)

    // Animate the circle's opacity
    yield * myCircleRef().opacity(0, 1); // Fade out over 1 second

    // Animate the rectangle's scale
    yield * myRectangleRef().scale(2, 0.5); // Scale to 2x size over 0.5 seconds

    // You can also access properties (if they are signals)
    // console.log(myCircleRef().opacity()); // Get current opacity
    ```

**Example:**

```typescript
import { makeScene2D, Circle } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const coolCircle = createRef<Circle>();

  view.add(<Circle ref={coolCircle} size={100} fill={"#FF6470"} x={-200} />);

  // Initial state rendered by the first yield (implicit if animations follow)
  // yield; // Not strictly necessary if an animation yield* follows immediately

  // Animate the circle using its reference
  yield* coolCircle().position.x(200, 2); // Move to x=200 over 2 seconds
  yield* coolCircle().fill("#32A852", 1); // Change color to green over 1 second
});
```

**Chef's Notes:**

- Reference names (e.g., `coolCircle`) are just standard JavaScript/TypeScript variable names.
- The `createRef()` function initializes an empty reference. Motion Canvas populates this reference with the actual node instance when the TSX containing the `ref={...}` attribute is processed.

---

### 1.5 The View: Your Stage and Its Properties

**Goal:** Understand the `view` object and its role as the main stage or camera viewport.

**Core Concepts Involved:** `view` object, resolution, coordinate system.

**The `view` Object:**

As seen in `makeScene2D(function* (view) { ... })`, the `view` object is your primary interaction point with the scene's stage.

- **Root Node:** It's the root of your scene graph. All top-level visual elements are added as children to the `view`.
- **Dimensions:** The `view` has a size that typically matches your project's configured resolution (e.g., 1920x1080). You can access these:
  - `view.width()`: Gets the current width of the view.
  - `view.height()`: Gets the current height of the view.
  - `view.size()`: Gets the size as a `Vector2`.
- **Coordinate System:**
  - By default, the origin `(0, 0)` is at the **center** of the view.
  - The **X-axis** increases to the right.
  - The **Y-axis** increases downwards.
  - So, `x: -view.width() / 2` is the left edge, and `y: -view.height() / 2` is the top edge.

**Adding Elements to the View:**

You use `view.add()` to place nodes onto the stage.

```typescript
// Add a single element
view.add(<Rect width={100} height={100} fill="red" />);

// Add multiple elements using a Fragment (<> ... </>)
view.add(
  <>
    <Circle fill="blue" size={50} x={-100} />
    <Txt text="Hello" fill="white" x={100} />
  </>
);

// Add elements that are already created and stored in variables
const myShape = createRef<Rect>();
const myText = createRef<Txt>();
view.add(
  <>
    <Rect ref={myShape} width={100} height={100} fill="red" />
    <Txt ref={myText} text="Hello" fill="white" x={100} />
  </>
);
```

**Manipulating the View (as a Node):**

The `view` itself is a special kind of `Layout` node. This means you can technically manipulate properties of the `view` like `scale`, `position`, etc., though it's more common to use a `Camera` node for complex view manipulations.

```typescript
// Example: Zoom out the entire view (not commonly done this way for camera work)
// yield* view.scale(0.8, 1);

// Example: Shift the entire view
// yield* view.position.x(100, 1);
```

For typical camera movements like panning and zooming, you'll use the `Camera` node (covered later). However, the `view` can be useful for applying global layout rules to all direct children if needed, as it acts like a root `Layout` node.

For example, to center all direct children within the view using its layout capabilities:

```typescript
import { makeScene2D, Rect, Circle, Layout } from "@motion-canvas/2d"; // Layout is the base for View
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  // Apply layout properties to the view itself to affect direct children
  view.justifyContent("center").alignItems("center").gap(20);

  const rect = createRef<Rect>();
  const circle = createRef<Circle>();

  // These will now be centered and have a gap due to view's layout props
  view.add(
    <>
      <Rect ref={rect} size={150} fill="lightcoral" />
      <Circle ref={circle} size={100} fill="lightblue" />
    </>
  );
  yield;
});
```

---

This covers the foundational elements: Setup, Scenes, Nodes, References, and the View. This should give you a solid base to understand how Motion Canvas projects are structured and how individual elements are defined and controlled.

Please let me know if you'd like to **"continue"** to the next part, where we'll delve into **2D Package Components** (various shapes, text, layout, etc.) and their specific properties.
