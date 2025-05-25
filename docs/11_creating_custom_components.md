Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

This part focuses on a more advanced but incredibly powerful aspect: creating your own reusable custom components. This allows you to build complex animations in a more organized and modular way.

---

## Part 11: Advanced Scene Structuring – Creating Custom Components 🧩

As your animations grow in complexity, you'll find yourself wanting to reuse certain combinations of shapes, animations, or logic. Custom components let you encapsulate these into new, reusable Node types with their own properties and behaviors.

**Why Create Custom Components?**

- **Reusability:** Define a complex visual element once (e.g., a fancy button, a character, a specific chart element) and use it multiple times across your scenes or even projects.
- **Abstraction:** Hide the internal complexity of an element behind a simple interface (its properties). Users of your component don't need to know _how_ it's built, only _what_ it does and _how_ to configure it.
- **Organization:** Break down large, complex scenes into smaller, manageable, and understandable parts.
- **Encapsulation:** Keep related logic, visuals, and animations bundled together within the component.

---

### 11.1 Basic Custom Component Structure

**Goal:** Understand how to create a basic custom component by extending an existing Motion Canvas `Node` class (like `Node`, `Layout`, `Rect`, etc.) and defining its initial structure.

**Core Concepts Involved:** TypeScript classes, `extends` keyword, component `Props` interface, `constructor`, adding child nodes.

**Steps:**

1.  **Create a New TypeScript File:**
    It's good practice to create a new `.ts` or `.tsx` file for each custom component (e.g., `src/components/MyCustomWidget.ts`).

2.  **Define a Props Interface (Optional but Recommended):**
    This interface will define the configurable properties your component can accept. It should extend a base `Props` type from Motion Canvas (e.g., `NodeProps` if extending `Node`, `LayoutProps` if extending `Layout`).

    ```typescript
    // src/components/LabeledCircle.ts
    import { NodeProps, PossibleColor } from "@motion-canvas/core"; // Import base props and types

    // Define properties specific to LabeledCircle
    export interface LabeledCircleProps extends NodeProps {
      // Extend NodeProps or LayoutProps, etc.
      labelText?: string; // Optional: text for the label
      labelColor?: PossibleColor; // Optional: color for the label
      circleColor?: PossibleColor; // Optional: color for the circle
      radius?: number; // Optional: radius of the circle
    }
    ```

3.  **Create a Class Extending a Motion Canvas Node:**
    Your custom component will be a TypeScript class that `extends` one of Motion Canvas's existing node classes. `Layout` is a common choice if your component will contain and arrange other child nodes. `Node` is the most generic.

    ```typescript
    // src/components/LabeledCircle.ts (continued)
    import { Layout, Circle, Txt } from "@motion-canvas/2d"; // Components to use internally
    import { createRef } from "@motion-canvas/core";

    export class LabeledCircle extends Layout {
      // Extending Layout for easy centering of text on circle
      // We'll add custom signal properties here in the next step

      // Refs for internal nodes
      private readonly circleRef = createRef<Circle>();
      private readonly textRef = createRef<Txt>();

      // Constructor
      public constructor(props?: LabeledCircleProps) {
        super({
          // Pass all received props to the parent class (Layout)
          ...props,
          // You can set default Layout properties for LabeledCircle itself here
          justifyContent: "center", // Center children horizontally
          alignItems: "center", // Center children vertically
        });

        // Add internal child nodes that make up this component
        this.add(
          // 'this.add()' is from Layout, adds children to this LabeledCircle
          <Circle
            ref={this.circleRef}
            size={props?.radius ? props.radius * 2 : 100} // Use prop or default
            fill={props?.circleColor ?? "blue"} // Use prop or default
          />
        );
        this.add(
          <Txt
            ref={this.textRef}
            text={props?.labelText ?? "Label"} // Use prop or default
            fill={props?.labelColor ?? "white"}
            fontSize={props?.radius ? props.radius * 0.5 : 25} // Example relative font size
            zIndex={1} // Ensure text is on top of the circle
          />
        );
      }
    }
    ```

**Explanation:**

- **`export interface LabeledCircleProps extends NodeProps`**: We define an interface for the properties our `LabeledCircle` can take. It extends `NodeProps` (or `LayoutProps`, `RectProps`, etc., depending on what you extend) so it inherits common node properties like `x`, `y`, `scale`, `opacity`, etc.
- **`export class LabeledCircle extends Layout`**: Our custom component `LabeledCircle` is defined as a class. It `extends Layout`, meaning it inherits all the functionality of a `Layout` node (like being able to arrange children using flexbox properties, having `width`, `height`, `padding`, etc.).
- **`private readonly circleRef = createRef<Circle>();`**: We use `createRef` to get references to the internal `Circle` and `Txt` nodes that make up our `LabeledCircle`. These are usually `private` as they are implementation details.
- **`public constructor(props?: LabeledCircleProps)`**:
  - The constructor takes an optional `props` object of type `LabeledCircleProps`.
  - `super({...props, justifyContent: 'center', ...})`: **Crucially**, you must call `super(props)` to initialize the parent class (`Layout` in this case). We spread `...props` to pass through any standard layout properties given by the user, and can also set some default layout behaviors for the `LabeledCircle` itself.
- **`this.add(...)`**: Since `LabeledCircle` extends `Layout`, it has an `add` method. We use this to add the internal `Circle` and `Txt` nodes as children of the `LabeledCircle`. Their positions and layout will be relative to the `LabeledCircle`.
- **Using Props for Initial Values**: In this basic example, we directly use the passed `props` (e.g., `props.radius`, `props.circleColor`) to set the initial state of the internal nodes. We use the nullish coalescing operator (`??`) to provide default values if a prop isn't passed.

**4. Using Your Custom Component in a Scene:**

```typescript
// src/scenes/myTestScene.tsx
import { makeScene2D } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";
import { LabeledCircle } from "../components/LabeledCircle"; // Import your custom component

export default makeScene2D(function* (view) {
  const myWidget1 = createRef<LabeledCircle>();
  const myWidget2 = createRef<LabeledCircle>();

  view.add(
    <>
      <LabeledCircle // Use your custom component like any other node
        ref={myWidget1}
        x={-200}
        labelText="Widget 1"
        circleColor="crimson"
        radius={70}
      />
      <LabeledCircle
        ref={myWidget2}
        x={200}
        labelText="Info"
        labelColor="black"
        circleColor="lightgoldenrodyellow"
        radius={50}
        opacity={0} // Standard NodeProps work too!
      />
    </>
  );

  yield* waitFor(0.5);
  yield* myWidget2().opacity(1, 0.5); // Animate props of the custom component
  // To animate custom props like labelText or radius, they need to be signals (next step)
});
```

**Result:** You've created a basic custom component! It encapsulates a circle and a text label, and you can reuse it with different initial properties. However, its custom properties (`labelText`, `circleColor`, `radius`) are not yet reactive signals, so animating them directly on the `LabeledCircle` instance won't work as expected yet.

---

### 11.2 Defining Custom Properties as Signals (with Decorators)

**Goal:** Make the custom properties of your component reactive and animatable by defining them as signals using TypeScript decorators.

**Core Concepts Involved:** `@signal` (and its typed variants like `@numberSignal`, `@stringSignal`, `@colorSignal`), `@initial`, `Signal<ValueType, OwnerType>`.

To make properties like `labelText` or `radius` animatable on your `LabeledCircle` component (e.g., `yield* myWidget1().labelText("New Label", 1);`), they need to be defined as signals. Decorators make this easy.

**Steps:**

1.  **Import Decorators and Signal Type:**

    ```typescript
    // src/components/LabeledCircle.ts
    import {
      Layout,
      NodeProps,
      Circle,
      Txt, // Existing imports
      PossibleColor,
      PossibleVector2, // Types for props
    } from "@motion-canvas/2d";
    import {
      createRef,
      Signal,
      initial,
      signal, // Base signal decorator
      stringSignal,
      colorSignal,
      numberSignal, // Typed signal decorators
      vector2Signal, // Example if you had a Vector2 prop
    } from "@motion-canvas/core"; // Decorators are from core
    ```

2.  **Declare Signal Properties using Decorators:**
    Inside your `LabeledCircle` class, replace the simple property declarations (if any) with decorated signal declarations.

    ```typescript
    // src/components/LabeledCircle.ts (Modified LabeledCircle class)
    export class LabeledCircle extends Layout {
      // Decorated Signal Properties
      @initial("Default Label") // Sets the default value if not provided in props
      @stringSignal() // Defines this.labelText as a Signal<string, this>
      public declare readonly labelText: Signal<string, this>;

      @initial("white")
      @colorSignal()
      public declare readonly labelColor: Signal<PossibleColor, this>;

      @initial("cornflowerblue")
      @colorSignal()
      public declare readonly circleColor: Signal<PossibleColor, this>;

      @initial(60) // Default radius if not provided
      @numberSignal()
      public declare readonly radius: Signal<number, this>;

      // Refs for internal nodes (as before)
      private readonly circleRef = createRef<Circle>();
      private readonly textRef = createRef<Txt>();

      public constructor(props?: LabeledCircleProps) {
        super({
          ...props,
          justifyContent: "center",
          alignItems: "center",
        });

        // Now, Motion Canvas uses the props to initialize these signal properties.
        // The @initial decorator provides the default if a prop is missing.
        // So, you don't need: this.labelText(props?.labelText ?? 'Default Label');
        // The decorators and super(props) handle this linkage.

        this.add(
          <Circle
            ref={this.circleRef}
            // Use the signal getters in your internal TSX structure
            size={() => this.radius() * 2}
            fill={() => this.circleColor()}
          />
        );
        this.add(
          <Txt
            ref={this.textRef}
            text={() => this.labelText()}
            fill={() => this.labelColor()}
            fontSize={() => this.radius() * 0.5} // Make font size reactive to radius
            zIndex={1}
          />
        );
      }
    }
    ```

**Explanation of Decorators:**

- **`@initial(defaultValue)`**: This decorator specifies the default value for the signal property if no value is provided for it in the component's props during instantiation.
- **`@stringSignal()` / `@numberSignal()` / `@colorSignal()` / `@vector2Signal()` etc.:**
  - These are specialized signal decorators. They transform the class property into a Motion Canvas `Signal`.
  - The type of signal (e.g., `NumberSignal`, `ColorSignal`) is often inferred, or these provide specific parsing/tweening behaviors for that type.
  - The generic `@signal()` decorator can also be used, often requiring more explicit type information or a `parser`.
- **`public declare readonly propertyName: Signal<ValueType, this>;`**:
  - `public declare readonly`: This is TypeScript syntax. `declare` means the property's storage and accessors are effectively handled by the decorators and Motion Canvas's signal system. `readonly` on the property itself is common because you interact with the signal _through its methods_ (e.g., `mySignal()` to get, `mySignal(value)` to set, `yield* mySignal(value, duration)` to animate).
  - `Signal<ValueType, this>`: Specifies the type of the signal. `ValueType` is the type of value the signal holds (e.g., `string`, `number`, `PossibleColor`). `this` refers to the owner type (the `LabeledCircle` class itself).

**How it Works Now:**

- When you create `<LabeledCircle labelText="Hi" radius={70} />`:
  - The `labelText` prop from `LabeledCircleProps` is used to set the initial value of the `this.labelText` signal.
  - The `radius` prop initializes the `this.radius` signal.
  - If a prop is not provided, the `@initial` decorator's value is used.
- **Reactivity:** The internal `Circle` and `Txt` nodes now use getter functions (e.g., `size={() => this.radius() * 2}`) that read these signals. So, if `this.radius` signal changes, the circle's size and text's font size will automatically update.
- **Animatability:** Because `labelText`, `radius`, etc., are now true signals on `LabeledCircle`, you can animate them directly from your scene:
  ```typescript
  // In myTestScene.tsx
  // ...
  yield * myWidget1().labelText("New Awesome Label!", 1);
  yield * myWidget1().radius(100, 0.75);
  yield * myWidget1().circleColor("darkviolet", 1);
  ```

This setup makes your custom component's properties first-class citizens in the Motion Canvas animation and reactive system.

---

This covers the basic structure of custom components and how to define their properties as signals. This is a huge step towards creating powerful, reusable animation building blocks.

---

Okay, let's continue with **Part 11: Advanced Scene Structuring – Creating Custom Components 🧩** in the Chalchitra Cookbook.

We've defined a custom component and made its properties reactive signals. Now, let's add custom methods to encapsulate behavior and complex animation sequences within the component itself.

---

### 11.3 Adding Custom Methods to Components

**Goal:** Learn how to add both regular synchronous methods and asynchronous, animatable generator methods (`function*`) to your custom components, allowing them to perform actions or execute self-contained animations.

**A. Regular Synchronous Methods**

These are standard class methods used for logic that doesn't involve animation timing or `yield` statements. They execute immediately.

**Purpose:**

- Performing calculations based on the component's current state (signal values).
- Instantly changing multiple signal properties of the component.
- Helper functions for internal logic.

**Example:** Add a method to `LabeledCircle` to instantly set its label and color.

```typescript
// src/components/LabeledCircle.ts (Continuing from before)
import {
  Layout,
  NodeProps,
  Circle,
  Txt,
  PossibleColor,
} from "@motion-canvas/2d";
import {
  createRef,
  Signal,
  initial,
  stringSignal,
  colorSignal,
  numberSignal,
  // No new imports needed for synchronous methods
} from "@motion-canvas/core";

export interface LabeledCircleProps extends NodeProps {
  labelText?: string;
  labelColor?: PossibleColor;
  circleColor?: PossibleColor;
  radius?: number;
}

export class LabeledCircle extends Layout {
  @initial("Default Label")
  @stringSignal()
  public declare readonly labelText: Signal<string, this>;
  @initial("white")
  @colorSignal()
  public declare readonly labelColor: Signal<PossibleColor, this>;
  @initial("cornflowerblue")
  @colorSignal()
  public declare readonly circleColor: Signal<PossibleColor, this>;
  @initial(60)
  @numberSignal()
  public declare readonly radius: Signal<number, this>;

  private readonly circleRef = createRef<Circle>();
  private readonly textRef = createRef<Txt>();

  public constructor(props?: LabeledCircleProps) {
    super({ ...props, justifyContent: "center", alignItems: "center" });
    this.add(
      <Circle
        ref={this.circleRef}
        size={() => this.radius() * 2}
        fill={() => this.circleColor()}
      />
    );
    this.add(
      <Txt
        ref={this.textRef}
        text={() => this.labelText()}
        fill={() => this.labelColor()}
        fontSize={() => this.radius() * 0.5}
        zIndex={1}
      />
    );
  }

  // --- New Synchronous Method ---
  public setAppearance(newLabel: string, newCircleColor: PossibleColor) {
    // Instantly update the component's signals
    this.labelText(newLabel);
    this.circleColor(newCircleColor);
    // Note: These changes will reflect immediately because signals trigger updates.
  }
}
```

**Using the synchronous method in a scene:**

```typescript
// src/scenes/myTestScene.tsx
// ... (imports, including LabeledCircle) ...

export default makeScene2D(function* (view) {
  const myWidget = createRef<LabeledCircle>();
  view.add(
    <LabeledCircle ref={myWidget} labelText="Initial" radius={80} x={-200} />
  );

  yield* waitFor(1); // Wait a bit

  // Call the synchronous method - no 'yield*' needed
  myWidget().setAppearance("Updated!", "seagreen");

  yield* waitFor(1);
  // The widget will now show "Updated!" and be seagreen.
});
```

**B. Animatable Generator Methods (`function*`)**

These methods define multi-step animation sequences that are encapsulated within the component. They are generator functions (`function*`) and can use `yield*` to call other animations or flow control functions.

**Purpose:**

- Create reusable, complex animation routines specific to the component (e.g., an "intro" animation, a "highlight" effect).
- Make the component's API more expressive for animation tasks.

**The `@threadable()` Decorator:**

For a generator method in your custom component to be usable with `yield*` (i.e., to act as a proper Motion Canvas animation task), you need to decorate it with `@threadable()`.

```typescript
// src/components/LabeledCircle.ts (Additions/Modifications)
import {
  // ... existing imports ...
  threadable, // Import threadable
  all,
  waitFor,
  easeInOutCubic, // For animation examples
  Vector2, // If needed for scale animations etc.
} from "@motion-canvas/core";

export class LabeledCircle extends Layout {
  // ... (properties and constructor as before) ...

  public setAppearance(newLabel: string, newCircleColor: PossibleColor) {
    this.labelText(newLabel);
    this.circleColor(newCircleColor);
  }

  // --- New Animatable Generator Methods ---

  /**
   * Makes the LabeledCircle pulse by scaling up and down.
   * @param duration - Total duration for one pulse cycle.
   * @param scaleFactor - How much larger it should scale (e.g., 1.2 for 20% larger).
   */
  @threadable() // Makes this method an animatable task
  public *pulse(duration: number = 0.6, scaleFactor: number = 1.1) {
    // Get the initial scale of the LabeledCircle itself
    // Assuming 'this.scale()' refers to the Layout's scale property (a Vector2Signal)
    const originalScaleX = this.scale.x();
    const originalScaleY = this.scale.y();

    const targetScaleX = originalScaleX * scaleFactor;
    const targetScaleY = originalScaleY * scaleFactor;

    // Animate scale up
    yield* all(
      this.scale.x(targetScaleX, duration / 2, easeInOutCubic),
      this.scale.y(targetScaleY, duration / 2, easeInOutCubic)
    );
    // Animate scale back to original
    yield* all(
      this.scale.x(originalScaleX, duration / 2, easeInOutCubic),
      this.scale.y(originalScaleY, duration / 2, easeInOutCubic)
    );
  }

  /**
   * Animates the labelText with a fade-out/fade-in effect.
   * @param newText - The new text to display.
   * @param duration - Total duration for the text change animation.
   */
  @threadable()
  public *animateLabelText(newText: string, duration: number = 1.0) {
    const fadeDuration = duration / 3; // Use a portion for fade

    // Fade out current text (by animating the Txt node's opacity)
    yield* this.textRef().opacity(0, fadeDuration);

    // Change the text content instantly (while invisible)
    this.labelText(newText); // Update the signal that drives the Txt node's text

    // Wait for a brief moment if needed for the text change to register before fade-in
    // This might not always be necessary if signal updates are immediate for text rendering
    // yield* waitFor(0.01); // Smallest possible wait

    // Fade in new text
    yield* this.textRef().opacity(1, fadeDuration * 2);
  }
}
```

**Using Animatable Methods in a Scene:**

```typescript
// src/scenes/myTestScene.tsx
// ... (imports, including LabeledCircle) ...

export default makeScene2D(function* (view) {
  const myWidget = createRef<LabeledCircle>();
  view.add(<LabeledCircle ref={myWidget} labelText="Hello" radius={60} />);

  yield* waitFor(0.5);

  // Call the custom animatable method using yield*
  yield* myWidget().pulse(0.8, 1.25); // Pulse for 0.8s, scale by 1.25x

  yield* waitFor(0.5);

  yield* myWidget().animateLabelText("Pulsed!", 1.2);

  yield* waitFor(0.5);

  // You can combine them in 'all' or 'sequence'
  yield* all(
    myWidget().pulse(1, 1.1),
    myWidget().position.x(200, 1) // Animate a standard property simultaneously
  );
});
```

**Explanation:**

- **`@threadable()`**: This decorator (from `@motion-canvas/core`) is essential. It registers the generator method with Motion Canvas's threading system, allowing it to manage its execution, integrate with flow control functions (`all`, `sequence`, etc.), and be properly yielded.
- **`public* methodName(...)`**: The `*` makes it a generator function.
- **Using `this`**: Inside these methods, `this` refers to the instance of your custom component (`LabeledCircle`). You can access its signals (`this.labelText()`, `this.radius(newVal)`), its internal refs (`this.circleRef()`, `this.textRef()`), and even call other methods of the component.
- **`yield*`**: Within the generator method, you use `yield*` to call other Motion Canvas animations or flow control functions, just like you would in a scene's main generator.

By adding such methods, your custom components become much more powerful and can encapsulate complex behaviors, making your scene code cleaner and more focused on orchestration.

---

This covers adding both synchronous and animatable generator methods to your custom components. This makes them much more dynamic and capable.

---

Okay, let's continue with **Part 11: Advanced Scene Structuring – Creating Custom Components 🧩** in the Chalchitra Cookbook.

We'll now look into how to manage more complex internal state, perform advanced setup in the constructor, and then touch upon the lifecycle methods of components.

---

### 11.4 Managing Internal State & Advanced Constructor Logic

**Goal:** Explore how to manage more complex internal state within custom components (beyond simple prop-to-signal mapping) and perform advanced setup logic in the constructor, such as dynamically creating child nodes.

**Beyond Basic Props-to-Signals:**

While decorators like `@signal` are great for exposing configurable and animatable properties, your component might have internal state that doesn't need to be directly exposed as a prop or animated from the outside.

- **Regular Class Properties (Non-Signal):**

  - You can use standard TypeScript class properties for internal state that doesn't need to be reactive in the Motion Canvas sense (i.e., changes to it won't automatically trigger re-renders of dependents unless you manually call `requestPaint()` or `requestLayoutUpdate()`).
  - Useful for: Caching calculations, storing internal references not managed by `createRef`, managing internal state machines if their changes are manually propagated to visual properties.

  ```typescript
  class MyDataProcessor extends Node {
    private processedData: ComplexDataObject | null = null;
    private lastProcessTime: number = 0;

    public process(rawData: any) {
      // Some complex synchronous processing
      this.processedData = this._doComplexProcessing(rawData);
      this.lastProcessTime = Date.now();
      this.requestPaint(); // If visual representation depends on processedData
    }
    // ...
  }
  ```

- **Internal Signals:**
  - You might use `createSignal()` _inside_ your component (not necessarily tied to a prop decorator) for internal reactive values that drive parts of your component's behavior but aren't meant to be configured directly from the outside.
  - Example: An internal signal that toggles a visual state based on some internal logic or method call.

**Complex Constructor Logic:**

The `constructor` is where you set up the initial state and structure of your component.

1.  **Dynamically Creating Children Based on Props:**
    You can generate child nodes programmatically in the constructor based on the provided props.

    **Example: A `DynamicGrid` component that creates a grid of configurable shapes.**

    ```typescript
    // src/components/DynamicGrid.ts
    import {
      Layout,
      LayoutProps,
      Rect,
      Node,
      PossibleNode,
    } from "@motion-canvas/2d";
    import {
      createRef,
      Signal,
      initial,
      numberSignal,
    } from "@motion-canvas/core";

    export interface DynamicGridProps extends LayoutProps {
      rows?: number | Signal<number, void>; // Allow signals for dynamic rows/cols
      cols?: number | Signal<number, void>;
      cellGap?: number | Signal<number, void>;
      // Factory function to create a node for each cell
      createCell?: (
        rowIndex: number,
        colIndex: number,
        cellIndex: number
      ) => PossibleNode;
    }

    export class DynamicGrid extends Layout {
      @initial(3)
      @numberSignal() // Default 3 rows
      public declare readonly rows: Signal<number, this>;

      @initial(3)
      @numberSignal() // Default 3 cols
      public declare readonly cols: Signal<number, this>;

      @initial(10)
      @numberSignal()
      public declare readonly cellGap: Signal<number, this>;

      // Store refs to created cells if needed, e.g., for individual access
      private cellNodes: Node[] = [];

      public constructor(props?: DynamicGridProps) {
        super({
          // Pass all props to Layout for x, y, width, height, etc.
          ...props,
          // Default layout for the DynamicGrid itself (arranges rows)
          direction: "column",
          // Use signals for gap, so if they change, layout updates
          gap: () => this.cellGap(),
        });

        // Initialize signals from props (decorators handle this)
        // If props.rows/cols/cellGap are signals, they will be assigned directly.
        // If they are static values, the component's signals will be initialized with them.

        // We need to reactively build the grid if rows/cols signals change.
        // This is often done by making the children themselves a computed signal
        // or by using a method decorated with @computed or by reacting to changes
        // in onRecalculate or a similar lifecycle method.
        // For simplicity in constructor, we'll build based on initial values.
        // A more reactive grid would rebuild its children when rows/cols signals change.

        const initialRows = this.rows(); // Get initial value
        const initialCols = this.cols();
        const cellFactory =
          props?.createCell ??
          ((r, c, i) => <Rect width={50} height={50} fill="gray" />);

        for (let r = 0; r < initialRows; r++) {
          const rowLayout = createRef<Layout>();
          // Add a new Layout node for each row
          this.add(
            <Layout
              ref={rowLayout}
              direction="row"
              gap={() => this.cellGap()} // Rows also use the cellGap signal
              justifyContent={"center"} // Example: center cells in a row
            />
          );
          for (let c = 0; c < initialCols; c++) {
            const cellIndex = r * initialCols + c;
            const cellNode = cellFactory(r, c, cellIndex);
            if (cellNode) {
              // It's good practice to ensure cellFactory returns a valid node
              rowLayout().add(cellNode);
              this.cellNodes.push(
                cellNode instanceof Node ? cellNode : (cellNode as any).ㅋㅋ
              ); // Store if needed
            }
          }
        }
        // To make this truly dynamic if `this.rows` or `this.cols` signals change later,
        // you would typically make the children themselves a result of a computed signal
        // or rebuild them in a lifecycle method that reacts to these signal changes.
        // Example of reactive children (more advanced):
        // this.add(() => this.buildGridChildren()); where buildGridChildren is a method
        // that returns an array of PossibleNode based on current this.rows() and this.cols().
      }

      // Example of how you might make children reactive (more advanced pattern)
      /*
      @computed()
      protected childrenSignal(): PossibleNode[] {
        const children: PossibleNode[] = [];
        const rows = this.rows();
        const cols = this.cols();
        const cellFactory = this.props().createCell ?? ((r,c,i) => <Rect width={50} height={50} fill="gray"/>);
    
        for (let r = 0; r < rows; r++) {
          const rowChildren: PossibleNode[] = [];
          for (let c = 0; c < cols; c++) {
            rowChildren.push(cellFactory(r, c, r * cols + c));
          }
          children.push(
            <Layout direction="row" gap={() => this.cellGap()}>
              {rowChildren}
            </Layout>
          );
        }
        return children;
      }
      // In constructor, you might then do: this.add(this.childrenSignal);
      // This makes the entire child structure reactive to rows/cols changes.
      */
    }
    ```

    *In this `DynamicGrid` example, the constructor builds the initial grid. For the grid to dynamically update if `this.rows()` or `this.cols()` signals change *after* construction, you would need a more advanced reactive pattern, such as making the children themselves a computed property (as hinted in the commented-out `childrenSignal` method) or rebuilding the children in a lifecycle method like `onRecalculate`.*

2.  **Setting Up Internal Signal Dependencies/Computations:**
    You can create `createSignal` or `createComputed` instances within your constructor (or as class properties) that are internal to the component's logic.

    ```typescript
    class InteractiveSlider extends Layout {
      @initial(0) @numberSignal() public declare readonly value: Signal<number, this>; // Exposed prop
      @initial(0) @numberSignal() public declare readonly min: Signal<number, this>;
      @initial(100) @numberSignal() public declare readonly max: Signal<number, this>;

      // Internal computed signal for progress (0-1)
      protected readonly progress = createComputed(() => {
        const val = this.value();
        const minVal = this.min();
        const maxVal = this.max();
        if (maxVal <= minVal) return 0;
        return (val - minVal) / (maxVal - minVal);
      });

      private readonly trackRef = createRef<Rect>();
      private readonly handleRef = createRef<Rect>();

      public constructor(props?: ...) {
        super(props);
        // ... add track and handle ...
        this.add(
          <Rect ref={this.trackRef} width={300} height={10} fill="gray"/>
        );
        this.add(
          <Rect
            ref={this.handleRef}
            width={20} height={30} fill="blue"
            // Position handle based on internal 'progress' computed signal
            x={() => this.progress() * (this.trackRef().width() ?? 300) - (this.trackRef().width() ?? 300)/2 }
          />
        );

        // Internal subscription for logging (example)
        this.value.subscribe(v => console.log("Slider value changed:", v));
      }
      // ... methods to change value, perhaps by dragging ...
    }
    ```

---

### 11.5 Component Lifecycle Methods & State Management

**Goal:** Understand key lifecycle methods available in `Node` (and its subclasses like `Layout`, `Shape`) and how they can be used in custom components for updates, reactions to property changes, layout calculations, drawing, and cleanup.

**Common Lifecycle Methods & Concepts:**

Motion Canvas nodes go through various stages, and you can hook into these with specific methods.

1.  **`constructor(props?: MyComponentProps)`**

    - **Called:** When the component is instantiated (e.g., `<MyComponent ... />`).
    - **Purpose:** Initial setup of properties, signals, and internal child structure.
    - **Action:** Call `super(props)` first. Add child nodes. Initialize state.

2.  **`reset()`**

    - **Called:** When the node (or a parent, or the whole scene) is reset to its initial state. This happens, for example, when the playhead seeks to the beginning or the scene is reloaded.
    - **Purpose:** Revert the component to the state it had when it was first created or after its properties were initially set.
    - **Action:** Override this to perform custom reset logic for your component's internal state. **Always call `super.reset()`** to ensure parent class and signal resets occur.
      ```typescript
      public reset() {
        super.reset(); // Resets signals with @initial values, etc.
        // Reset any custom internal non-signal state here
        this.myInternalCounter = 0;
        console.log(`${this.key} was reset`);
      }
      ```

3.  **`onRecalculate()` (from `ValueDispatcher` which `SignalObject` and thus `Node` uses)**

    - **Called:** After one of the signals that this node _directly depends on_ through a computed property or a reactive setter (like `width={() => someSignal()}`) has changed its value and has been recalculated. This method itself might be called as part of that recalculation chain.
    - **Purpose:** A place to react to changes in dependent signals if you need to perform custom logic _after_ those signals have new values but _before_ layout or rendering necessarily happens for this specific change.
    - **Action:** Perform calculations or update internal state that depends on just-changed signals.
    - _Note: For most visual updates driven by signals, direct reactive property bindings (`<Rect width={() => signal()}/>`) or `@computed` properties are often sufficient and handle updates automatically. You'd override `onRecalculate` for more complex side effects or multi-signal coordination that isn't a simple computed property._

4.  **Layout-Related Methods (if extending `Layout` or a component that does layout):**

    - **`recalculateLayout()`**: The main method called by the system when this node's layout (or its children's layout) needs to be recomputed.
    - **`layoutChildren(children: Node[])`**: Called by `recalculateLayout` to specifically arrange the direct children.
    - **`desiredSize(): Vector2`**: Calculates the "natural" or "intrinsic" size of the component based on its content, before layout constraints from parent are applied.
    - **`hasLayout()`**: Returns true if this node performs layout for its children.
    - **Overriding:** You typically _don't_ need to override `recalculateLayout` or `layoutChildren` for custom components unless you are implementing a completely novel layout system. Usually, you configure the existing Flexbox-like properties (`direction`, `gap`, `alignItems`, etc.) of the `Layout` class you're extending.

5.  **Rendering-Related Methods (if extending `Shape` or doing custom drawing):**

    - **`draw(context: CanvasRenderingContext2D)` (for `Shape` subclasses):**
      - **Called:** When the shape needs to draw its geometry (without fill/stroke).
      - **Purpose:** Define the shape's path using `context.beginPath()`, `context.moveTo()`, `context.lineTo()`, etc.
      - **Action:** Implement your custom shape drawing logic.
    - **`render(context: CanvasRenderingContext2D)` (general for `Node`):**
      - **Called:** The main entry point for rendering a node and its children.
      - **Purpose:** Orchestrates the drawing: applies opacity, composite operations, calls `drawSelf` (which for `Shape` might call `applyStyle` and `draw`), then `drawChildren`.
      - **Overriding:** Rarely overridden unless you're doing very custom rendering pipelines.
    - **`applyStyle(context: CanvasRenderingContext2D, anکرoundSize?: Vector2)` (for `Shape`):** Applies `fill`, `stroke`, `lineWidth`, `lineJoin`, `lineCap` to the context.
    - `needsAdvanceRender()`, `renderAdvanced()`: For WebGL or other advanced rendering contexts.

6.  **`onAdded(parent: Node)` and `onRemoved(parent: Node)`:**

    - **`onAdded` Called:** When `this` node is successfully added as a child to a `parent` node.
    - **`onRemoved` Called:** When `this` node is removed from its `parent`.
    - **Purpose:** Setup or teardown that depends on the node being part of the scene graph (e.g., registering global event listeners, creating external resources).
    - **Action:**

      ```typescript
      protected onAdded() {
        super.onAdded(); // Call if overridden from a class that implements it
        console.log(`${this.key} added to scene!`);
        // Subscribe to a global event, etc.
      }

      protected onRemoved() {
        super.onRemoved(); // Call if overridden
        console.log(`${this.key} removed from scene!`);
        // Unsubscribe from global events, release resources.
      }
      ```

7.  **`dispose()`:**
    - **Called:** When a node is being permanently destroyed and removed from memory (e.g., during a hot module replacement of its definition, or when the entire project is disposed).
    - **Purpose:** Perform final cleanup of any resources, event listeners, or subscriptions that would not be garbage collected automatically.
    - **Action:** Call `super.dispose()`. Release anything your component explicitly created that needs manual cleanup. Subscriptions made via `signal.subscribe()` are often auto-disposed when the owner node is disposed, but check specific cases.

**Requesting Updates Manually:**

Sometimes, changes to your component's internal state (especially non-signal state) might require you to tell Motion Canvas that it needs to re-evaluate layout or repaint.

- **`this.requestLayoutUpdate()`:** Call this if a change in your component affects its size or the position of its children, and this change isn't automatically tracked by signal dependencies on layout properties.
- **`this.requestPaint()`:** Call this if only the visual appearance of your component (or its children) has changed, but not its layout/size (e.g., an internal color changed that's not directly tied to a `fill` signal).
- **`this.notifyChanges()`:** A more general way to indicate that something in the node has changed. This often triggers both layout recalculation and repainting if necessary.

```typescript
// Inside a custom component method
public updateInternalDataAndRefresh(newData: any) {
  this.internalCache = newData; // Assume internalCache affects drawing
  // If this affects how children are laid out or its own size:
  // this.requestLayoutUpdate();
  // If it only affects its own drawing:
  this.requestPaint();
}
```

Understanding these lifecycle methods and update requests allows you to build highly dynamic and correctly behaving custom components that integrate seamlessly into the Motion Canvas rendering and update loop.

---

This completes Part 11 on creating Custom Components, covering their structure, signal properties, methods, and lifecycle. This is a very powerful feature for building complex and reusable animation elements.

---

You're right to push for completeness, and I appreciate the reminder about the `<Code />` component – it's definitely a key feature! My apologies for letting it slip in the earlier sequence.

Based on your request to cover "all the things" exhaustively and then suggest improvements, I will "rescan" my understanding against the documentation structure you've provided (`https://motioncanvas.io/docs/`) and the codebase information. We will proceed systematically.

Let's first finish **Part 11: Advanced Scene Structuring – Creating Custom Components** by covering the remaining aspects: managing internal state more deeply, advanced constructor logic, and lifecycle methods. Then we'll move to other key areas.

---

Continuing **Part 11: Advanced Scene Structuring – Creating Custom Components 🧩**

We've seen how to create the basic structure for custom components and define their properties as signals. Now let's look at more advanced constructor logic and how components behave during their lifecycle.

---

### 11.4 Managing Internal State & Advanced Constructor Logic (Revisited & Expanded)

**Goal:** Explore how to manage complex internal state, dynamically generate children based on props, and set up internal reactive chains within the constructor.

**Recap: Internal State**

- **Non-Signal Class Properties:** For internal data that doesn't need to be directly animatable or trigger Motion Canvas's reactive updates unless you manually call `this.requestPaint()` or `this.requestLayoutUpdate()`.
- **Internal Signals:** Use `createSignal()` or `createComputed()` for internal reactive values that drive the component's behavior or appearance but aren't exposed as props.

**Advanced Constructor Logic: Dynamic Children & Reactive Structures**

The constructor is your primary place to build the internal structure of your component.

**1. Dynamically Creating Children:**
You can create a variable number of child nodes or different types of child nodes based on the props passed to your component.

**Example: A `Checklist` component that generates `Txt` items from an array prop.**

```typescript
// src/components/Checklist.ts
import { Layout, LayoutProps, Txt, Rect, Circle } from "@motion-canvas/2d";
import {
  createRef,
  Signal,
  initial,
  vector2Signal,
  Vector2,
  PossibleVector2,
  createSignal,
  compound,
  computed,
  BBox,
  PossibleNode,
} from "@motion-canvas/core";

export interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean;
}

export interface ChecklistProps extends LayoutProps {
  items?: ChecklistItem[];
  itemFontSize?: number;
  iconSize?: number;
}

export class Checklist extends Layout {
  @initial(24) @numberSignal() public declare readonly itemFontSize: Signal<
    number,
    this
  >;
  @initial(20) @numberSignal() public declare readonly iconSize: Signal<
    number,
    this
  >;

  // Internal signals to track checked state if we want to make them interactive later
  private itemStates: Map<string, Signal<boolean>> = new Map();

  public constructor(props?: ChecklistProps) {
    super({
      // Default Layout properties for the Checklist itself
      direction: "column",
      gap: 10,
      alignItems: "start",
      ...props, // Allow user to override layout props
    });

    const items = props?.items ?? [];
    items.forEach((itemData) => {
      // For each item, create an internal signal for its checked state
      const isChecked = createSignal(itemData.checked ?? false);
      this.itemStates.set(itemData.id, isChecked);

      const itemLayout = createRef<Layout>();
      const iconContainer = createRef<Rect>(); // Or Circle
      const textLabel = createRef<Txt>();

      this.add(
        // Add a row for each checklist item
        <Layout ref={itemLayout} direction="row" gap={10} alignItems="center">
          <Rect // Placeholder for checkbox icon
            ref={iconContainer}
            width={() => this.iconSize()}
            height={() => this.iconSize()}
            stroke={"white"}
            lineWidth={2}
            justifyContent="center"
            alignItems="center"
            radius={4}
          >
            {/* Checkmark (conditionally rendered based on signal) */}
            {() =>
              isChecked() && (
                <Txt
                  text={"✔"}
                  fill={"lightgreen"}
                  fontSize={() => this.iconSize() * 0.8}
                />
              )
            }
          </Rect>
          <Txt
            ref={textLabel}
            text={itemData.text}
            fill={"white"}
            fontSize={() => this.itemFontSize()}
          />
        </Layout>
      );
    });
  }

  // Method to toggle an item (example of internal logic)
  public toggleItem(id: string) {
    const itemSignal = this.itemStates.get(id);
    if (itemSignal) {
      itemSignal(!itemSignal()); // Toggle the boolean value
    }
  }
}
```

- In this example, the constructor iterates over an `items` prop and dynamically creates a `Layout` with an icon and `Txt` for each item.
- It also creates internal signals (`isChecked`) to manage the state of each checkbox.

**2. Making Child Structures Fully Reactive to Prop Changes (Advanced):**

If props that define the _structure_ of your component (like the number of rows/cols in `DynamicGrid`, or the `items` array in `Checklist`) are themselves signals, the component needs to rebuild its children when these signals change. This is typically achieved by:

- **Making the `children` a `@computed` property:** The `children` property of a `Layout` node can accept a signal that returns an array of `PossibleNode`.

  ```typescript
  // In DynamicGrid.ts
  // @initial(3) @numberSignal() public declare readonly rows: Signal<number, this>;
  // @initial(3) @numberSignal() public declare readonly cols: Signal<number, this>;
  // // ... props for cellFactory, cellGap ...

  // public constructor(props?: DynamicGridProps) {
  //   super(props);
  //   this.layout(true); // Ensure layout is enabled
  //   this.direction('column');
  //   this.gap(() => this.cellGap()); // Use signal for gap

  //   // Add the computed children.
  //   // The add() method can take a function that returns nodes, making it reactive.
  //   this.add(() => this.buildGrid());
  // }

  // // This method is automatically re-run if rows, cols, or cellFactory (if it were a signal) changes
  // @computed()
  // protected buildGrid(): PossibleNode[] {
  //   const gridRows: PossibleNode[] = [];
  //   const numRows = this.rows();
  //   const numCols = this.cols();
  //   // Assuming cellFactory is stable or accessed from props
  //   const cellFactory = (this.props() as DynamicGridProps).createCell ??
  //                      ((r, c, i) => <Rect width={50} height={50} fill="gray" />);

  //   for (let r = 0; r < numRows; r++) {
  //     const rowChildren: PossibleNode[] = [];
  //     for (let c = 0; c < numCols; c++) {
  //       rowChildren.push(cellFactory(r, c, r * numCols + c));
  //     }
  //     gridRows.push(
  //       <Layout direction="row" gap={() => this.cellGap()}>
  //         {rowChildren}
  //       </Layout>
  //     );
  //   }
  //   return gridRows;
  // }
  ```

  The `@computed` decorator ensures `buildGrid()` re-evaluates and updates the children when `this.rows()` or `this.cols()` change. The `this.add(() => this.buildGrid())` pattern is a common way to achieve reactive children.

---

### 11.6 Component Lifecycle Methods

**Goal:** Understand key lifecycle methods in `Node` (and its subclasses) that you can override in your custom components to perform actions at different stages like reset, layout, rendering, or when the node is added/removed from the scene.

**Key Lifecycle Methods:**

1.  **`constructor(props?: MyComponentProps)`**

    - **Called:** Once, when your component is instantiated.
    - **Use:** Initial setup of signals, properties, and static child structure. Call `super(props)`.

2.  **`reset()`**

    - **Called:** When the scene playhead seeks to time `0`, or when the node/scene is explicitly reset.
    - **Use:** To revert your component to its absolute initial state. Signals decorated with `@initial` will automatically reset to their initial values. Override `reset()` for any additional custom state.
    - **Action:** `super.reset(); this.myInternalState = initialInternalState;`

    ```typescript
    // In LabeledCircle.ts
    private clickCount = 0; // An internal non-signal state

    public reset() {
      super.reset(); // IMPORTANT: Resets all signals to their @initial values
      this.clickCount = 0;
      console.log(`${this.keyString()} LabeledCircle reset.`);
    }
    ```

3.  **`onRecalculate()` (from `ValueDispatcher`)**

    - **Called:** When a signal that this node directly subscribes to (e.g., in a computed property or reactive setter) has changed and has been re-evaluated.
    - **Use:** To perform custom logic immediately after a dependent signal changes. This is often implicitly handled by computed properties or reactive setters for visual updates. You might override it for specific side effects or complex internal state updates that depend on multiple signals and aren't easily expressed as a single computed property.
    - **Action:** `// Custom logic reacting to a signal change that isn't a direct visual prop.`

4.  **Layout Related (primarily if extending `Layout` and doing very custom layout):**

    - **`recalculateLayout()`**: Called when the node or its children might need their layout recomputed.
    - **`layoutChildren(children: Node[])`**: Specifically layouts the children.
    - _Typically, you rely on the base `Layout` behavior by setting its Flexbox-like properties (`direction`, `gap`, `alignItems`, etc.) rather than overriding these methods._

5.  **Rendering Related (primarily if extending `Shape` and doing custom drawing, or `<Canvas />`):**

    - **`draw(context: CanvasRenderingContext2D)` (for `Shape` subclasses):** Define custom vector paths.
    - **`render(context: CanvasRenderingContext2D)` (for any `Node`):** The main render entry. Overriding is rare.
    - The `<Canvas />` component's `draw` prop is the primary way for custom raster drawing.

6.  **`onAdded(parent: Node)`**

    - **Called:** After this node has been added to a `parent` node in the scene tree.
    - **Use:** For setup that requires the node to be part of the scene (e.g., calculating sizes relative to parent, global event listeners).
    - **Action:** `super.onAdded(parent); // If extending a class that has its own onAdded`

7.  **`onRemoved(parent: Node)`**

    - **Called:** After this node has been removed from its `parent`.
    - **Use:** For cleanup when the node is removed from the scene but not necessarily destroyed (e.g., removing global event listeners).
    - **Action:** `super.onRemoved(parent);`

8.  **`dispose()`**
    - **Called:** When the node is being permanently destroyed (e.g., HMR, project closing).
    - **Use:** Perform final, thorough cleanup of any resources, subscriptions, or effects your component created that won't be automatically garbage collected.
    - **Action:** `// Unsubscribe from everything, clear intervals/timeouts.`
      `super.dispose(); // IMPORTANT to call for parent class cleanup.`
      Signal subscriptions (`mySignal.subscribe()`) made by the node are usually auto-disposed when the node itself is disposed.

**Requesting Manual Updates:**

If your component changes internal state (especially non-signal state) in a way that Motion Canvas wouldn't automatically detect, you might need to tell it to update:

- **`this.requestLayoutUpdate()`:** If changes affect the size or position of this node or its children. This will trigger `recalculateLayout`.
- **`this.requestPaint()`:** If changes only affect the visual appearance (e.g., color, custom drawing) without changing layout.
- **`this.notify()` (or `this.notifyChanges()` in older versions/internals):** A more general notification that something has changed, often leading to both layout and paint if needed.

**Example with `reset` and `requestPaint`:**

```typescript
// In LabeledCircle.ts
// ... (add a new non-signal property)
private lastPulseTime: number = 0;

@threadable()
public* pulse(duration: number = 0.6, scaleFactor: number = 1.1) {
  // ... (pulse animation as before) ...
  this.lastPulseTime = this.time(); // Record time from view.time() or player.time()
  this.requestPaint(); // If some visual aspect depended on lastPulseTime via custom draw
  // (Though for scale, the signal system handles repaint)
}

public reset() {
  super.reset();
  this.lastPulseTime = 0;
  console.log(`${this.keyString()} LabeledCircle reset its pulse time.`);
}
```

---

This covers the essentials of creating custom components, from defining their structure and reactive properties to adding custom methods and understanding their lifecycle. Custom components are key to building scalable and maintainable Motion Canvas projects.

We are getting very close to covering the majority of user-facing features!
