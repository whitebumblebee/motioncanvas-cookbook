Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

---

## Part 4: Signals – The Power of Reactivity ✨

Signals are a cornerstone of Motion Canvas, enabling dynamic and interconnected animations. They represent values that can change over time, and importantly, other parts of your animation can automatically react to these changes.

---

### 4.1 What are Signals? (Revisited & Expanded)

**Goal:** Understand the core concept of signals as reactive values that drive animations and dynamic properties.

**Core Concepts Involved:** Reactive values, `SignalValue<T>`, `createSignal()`, dependency tracking (conceptual).

**Beyond Simple Variables:**

In standard programming, if you have:

```javascript
let a = 10;
let b = a * 2;
a = 20;
// b is still 20, it doesn't automatically update
```

In Motion Canvas, signals allow `b` to automatically update when `a` changes if they are defined as signals and `b`'s computation depends on `a`.

**Signals in Motion Canvas:**

- **Reactive Values:** A signal holds a value that can change. When it changes, any part of your animation that _depends_ on this signal can automatically update or re-evaluate.
- **Animations are Signal Manipulations:** Most animations you define (like `yield* myNode().position.x(100, 1);`) are, under the hood, smoothly changing the value of a signal (the `x` position signal in this case) over time.
- **Declarative Dependencies:** You can define properties of nodes to be functions of signals. For example, a rectangle's width could be a function that uses the value of a signal. When that signal changes, the width (and the rectangle's appearance) updates.

**`SignalValue<T>`:**
This is a TypeScript type you'll often see. It represents a value that can either be a direct static value of type `T` (e.g., a `number`, `string`, `Vector2`) or a function that returns `T` (a "getter" function, often used for reactive computations). Many node properties accept `SignalValue<T>`.

---

### 4.2 Creating and Using Signals

**Goal:** Learn how to define signals, use them to set node properties, and modify their values (both instantly and with animation).

**Core Concepts Involved:** `createSignal()`, property assignment, signal getters (`mySignal()`), signal setters (`mySignal(newValue)`), animated setters (`yield* mySignal(newValue, duration)`).

**1. Creating a Signal with `createSignal()`:**

You import `createSignal` from `@motion-canvas/core`.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createSignal, createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  // Create a signal for a number, initialized to 100
  const rectWidthSignal = createSignal(100);

  // Create a signal for a color string
  const rectColorSignal = createSignal("lightcoral");

  // Create a signal initialized with the result of a function
  // (This is less common for createSignal; createComputed is usually for derived values.
  // But if the function is just for an initial complex value, it's fine.)
  const initialYPosSignal = createSignal(() => view.height() / 4);

  const myRect = createRef<Rect>();

  // ... (use these signals)
  yield;
});
```

**2. Reading a Signal's Value (Getter):**

To get the current value of a signal, you call it like a function:

```typescript
const currentWidth = rectWidthSignal(); // Returns 100
const currentColor = rectColorSignal(); // Returns 'lightcoral'
console.log(`Current width is: ${currentWidth}`);
```

**3. Setting Node Properties with Signals:**

There are a few ways properties can consume signals:

- **Direct Signal Assignment (for properties that accept `Signal<T>`):**
  Some advanced properties or custom components might be designed to accept a signal object directly.
- **Reactive Function Assignment (Most Common for Built-in Components):**
  You provide a function (usually an arrow function) that returns the signal's value. This function will be re-evaluated whenever the underlying signal changes.
  ```typescript
  view.add(
    <Rect
      ref={myRect}
      // width property reactively uses rectWidthSignal
      width={() => rectWidthSignal()}
      height={150}
      // fill property reactively uses rectColorSignal
      fill={() => rectColorSignal()}
      y={() => initialYPosSignal()}
    />
  );
  ```
  When `rectWidthSignal` or `rectColorSignal` changes, the rectangle's `width` or `fill` will automatically update.

**4. Setting/Updating a Signal's Value (Setter):**

You can change a signal's value by calling it with the new value.

- **Instantaneous Set:**

  ```typescript
  // Sometime after the rect is added and signals are defined
  rectWidthSignal(200); // Instantly changes the signal's value to 200
  // The rect's width will update reactively.
  rectColorSignal("skyblue");
  ```

- **Animated Set (Tweening a Signal):**
  This is how most property animations work! When you write `yield* myRect().width(200, 1)`, you are essentially telling the underlying width signal of `myRect` to tween its value. You can do this directly with signals you create too.

  ```typescript
  // Animate the signal's value from its current value to 250 over 1 second
  yield * rectWidthSignal(250, 1);

  // Animate the color signal
  yield * rectColorSignal("darkslateblue", 0.75);
  ```

**Full Example:**

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createSignal, createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const widthSignal = createSignal(100);
  const colorSignal = createSignal("lightcoral");
  const myRect = createRef<Rect>();

  view.add(
    <Rect
      ref={myRect}
      width={() => widthSignal()} // Reactive width
      height={100}
      fill={() => colorSignal()} // Reactive fill
      y={0}
    />
  );

  // Initial state
  yield* waitFor(0.5);

  // Animate the signals
  yield* widthSignal(300, 1.5); // Rect width animates
  yield* colorSignal("lightseagreen", 1.5); // Rect color animates

  yield* waitFor(0.5);

  // Set signals instantly
  widthSignal(50);
  colorSignal("gold");

  yield* waitFor(1);
});
```

---

### 4.3 Computed Signals (Derived Values with `createComputed`)

**Goal:** Create signals whose values are automatically calculated and updated based on one or more other signals.

**Core Concepts Involved:** `createComputed<T>(() => T)`, automatic dependency tracking.

Computed signals are powerful for creating relationships between properties without manually updating them.

**Creating a Computed Signal:**

`createComputed` takes a function (the "computer" function). This function will be re-run whenever any signal it _reads_ inside it changes.

```typescript
import { makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import {
  createSignal,
  createComputed,
  createRef,
  waitFor,
  all,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const baseSize = createSignal(100);
  const padding = createSignal(20);

  // Computed signal: its value depends on baseSize and padding
  const totalWidth = createComputed(() => baseSize() + padding() * 2);
  const totalHeight = createComputed(() => baseSize() + padding());

  const outerRect = createRef<Rect>();
  const innerRect = createRef<Rect>();
  const infoText = createRef<Txt>();

  view.add(
    <Rect
      ref={outerRect}
      width={() => totalWidth()} // Uses computed signal
      height={() => totalHeight()} // Uses computed signal
      fill={"#2A2A2A"}
      radius={10}
    >
      <Rect // Child of Layout (Rect acts as layout by default if children present)
        ref={innerRect}
        width={() => baseSize()} // Uses base signal
        height={() => baseSize() / 2} // Reactive to base signal
        fill={"lightskyblue"}
        radius={5}
      />
      <Txt
        ref={infoText}
        text={() => `Total Width: ${totalWidth().toFixed(0)}`} // Text updates reactively
        fill={"white"}
        fontSize={30}
        y={120} // Position relative to outerRect if outerRect has layout=true
      />
    </Rect>
  );

  yield* waitFor(1);

  // Animate one of the base signals
  yield* baseSize(200, 1.5);
  // totalWidth, totalHeight, innerRect's height, and infoText will update automatically!

  yield* waitFor(0.5);

  yield* padding(40, 1);
  // Again, totalWidth, totalHeight, and infoText will update.

  yield* waitFor(1);
});
```

**Explanation:**

- `const totalWidth = createComputed(() => baseSize() + padding() * 2);`
  - `totalWidth` is now a signal.
  - Its value is determined by the function `() => baseSize() + padding() * 2`.
  - Motion Canvas automatically detects that this function reads `baseSize()` and `padding()`.
  - Whenever `baseSize` or `padding` changes, the function is re-executed, and `totalWidth` gets a new value, propagating updates to anything that uses `totalWidth()`.

**Key Behaviors of Computed Signals:**

- **Read-only:** You don't set the value of a computed signal directly (e.g., `totalWidth(500)` would be an error or have no effect). Its value is solely determined by its computer function.
- **Efficient Updates:** They only recompute when their specific dependencies change.
- **Chainable:** Computed signals can depend on other computed signals, creating complex reactive chains.

---

This covers the basics of creating signals and computed signals. This reactive system is what allows you to define complex relationships and have your animations adapt dynamically.

---

Okay, let's continue with **Part 4: Signals – The Power of Reactivity ✨** in the Chalchitra Cookbook.

We've covered `createSignal` and `createComputed`. Now let's look at specialized signal types and more advanced ways to use signals.

---

### 4.4 Specialized Signal Types

**Goal:** Learn about built-in specialized signal types in Motion Canvas that make working with common data structures like vectors, colors, and others more convenient and type-safe.

Many node properties are instances of these specialized signals (e.g., `node.position` is often a `Vector2Signal`). You can also create them explicitly.

**How `createSignal` Infers Type:**

When you use `createSignal(initialValue)`, Motion Canvas often infers the most appropriate signal type:

- `createSignal(10)` -> `NumberSignal` (or a general `SimpleSignal<number>`)
- `createSignal("hello")` -> `StringSignal` (or `SimpleSignal<string>`)
- `createSignal(true)` -> `BooleanSignal` (or `SimpleSignal<boolean>`)
- `createSignal(new Vector2(10, 20))` -> `Vector2Signal`
- `createSignal(new Color("red"))` -> `ColorSignal`

**1. `Vector2Signal` (and `Vector3Signal`, `Vector4Signal`)**

**Goal:** Work with 2D (or 3D/4D) vector quantities reactively, allowing component-wise access and animation.

**Core Concepts:** `Vector2`, `Vector2Signal`, accessing components (`.x`, `.y`), component-wise animation.

**Creating `Vector2Signal`:**

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createSignal, createRef, Vector2, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  // Method 1: Inferred from Vector2 initial value
  const positionSignal = createSignal(new Vector2(0, 0));

  // Method 2: Explicit creation (less common for users, more internal or for type clarity)
  // import {Vector2Signal} from '@motion-canvas/core';
  // const explicitPositionSignal = new Vector2Signal(new Vector2(50, 50));

  const myRect = createRef<Rect>();
  view.add(
    <Rect
      ref={myRect}
      size={100}
      fill={"mediumpurple"}
      // Assign the Vector2Signal directly if the property supports it,
      // or use its components reactively.
      // Most built-in node properties like 'position' are already Vector2Signals.
      // Here, we're using our custom signal for demonstration.
      x={() => positionSignal().x} // Access x component
      y={() => positionSignal().y} // Access y component
    />
  );

  // Reading components
  console.log(positionSignal().x); // Logs 0
  console.log(positionSignal.x()); // Also logs 0 - .x itself is a sub-signal!

  // Animating the whole Vector2Signal
  yield* positionSignal(new Vector2(200, 100), 1);
  yield* waitFor(0.5);

  // Animating individual components of the Vector2Signal
  // The .x and .y properties of a Vector2Signal are themselves NumberSignals!
  yield* positionSignal.x(-200, 1); // Animate only the x-component
  yield* waitFor(0.5);
  yield* positionSignal.y(-100, 1); // Animate only the y-component

  // Setting components instantly
  positionSignal.x(0); // Set x component instantly
});
```

**Explanation:**

- `Vector2Signal` holds a `Vector2` value.
- It conveniently exposes its components (`x`, `y`) as individual `NumberSignal`s. This means you can:
  - Read `myVectorSignal.x()`.
  - Set `myVectorSignal.x(newValue)` or `yield* myVectorSignal.x(newValue, duration)`.
  - Use `myVectorSignal.x` in a computed signal or reactive property directly.
- This structure is why you can write `myNodeRef().position.x(100, 1)` – `myNodeRef().position` is a `Vector2Signal`, and `.x` is one of its component signals.

**2. `ColorSignal`**

**Goal:** Work with colors reactively, allowing animation and manipulation of color properties.

**Core Concepts:** `Color`, `ColorSignal`.

**Creating `ColorSignal`:**

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createSignal, createRef, Color, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const rectColor = createSignal(new Color("crimson"));
  // Or: const rectColor = createSignal('crimson'); // Motion Canvas often infers it as ColorSignal

  const myRect = createRef<Rect>();
  view.add(
    <Rect
      ref={myRect}
      size={200}
      fill={() => rectColor()} // Use the ColorSignal
    />
  );

  yield* waitFor(0.5);

  // Animate the ColorSignal to a new color
  yield* rectColor(new Color("deepskyblue"), 1.5);
  yield* waitFor(0.5);
  yield* rectColor("#33FF66", 1); // Can also use hex strings

  // ColorSignals have sub-signals for components like r, g, b, a, h, s, l
  // (though direct animation of these might be less common than tweening the whole color)
  // console.log(rectColor().r); // Get red component (0-255)
  // rectColor().alpha(0.5); // Set alpha component if .alpha() is a setter signal
});
```

**Explanation:**

- `ColorSignal` holds a `Color` object.
- It allows smooth tweening between colors. Motion Canvas interpolates through the color space (often HSLuv for perceptually uniform transitions).
- Similar to `Vector2Signal`, a `ColorSignal` might expose its components (like R, G, B, A or H, S, L, A) as sub-signals, allowing for fine-grained control or animation, though this is less frequently used than tweening the entire color. The documentation or codebase (`packages/core/src/signals/ColorSignal.ts`) would confirm the exact sub-signal API.

**3. `NumberSignal`, `StringSignal`, `BooleanSignal` (Often as `SimpleSignal<T>`)**

**Goal:** Basic signals for primitive types.

**Core Concepts:** These are often the result of `createSignal()` with a primitive type.

**Usage:**
We've already seen these implicitly:

```typescript
const count = createSignal(0); // NumberSignal or SimpleSignal<number>
const label = createSignal("Start"); // StringSignal or SimpleSignal<string>
const isVisible = createSignal(true); // BooleanSignal or SimpleSignal<boolean>

// Animate number
yield * count(10, 2);

// Animate string (diffs and transitions characters)
yield * label("End", 1);

// Animate boolean (switches value over duration, often used for instant changes though)
// A common pattern is to transition another property based on a boolean signal,
// rather than animating the boolean itself over time.
yield * isVisible(false, 0.5); // Will become false after 0.5s
// Then use it: <Rect opacity={() => isVisible() ? 1 : 0} />
// Or, more directly if opacity is a signal:
// yield* myRect().opacity(isVisible() ? 1 : 0, 0.5);
```

For boolean signals, animating them over a duration means the value flips at the _end_ of the duration.

**4. `CompoundSignal` (Conceptual / Advanced)**

**Goal:** Group multiple signals into a single object, where each property of the object is itself a signal.

**Core Concepts:** Object with signal properties, often used as a base for complex node properties.

You generally don't create `CompoundSignal`s directly as a beginner. Instead, many complex properties on built-in nodes _are_ `CompoundSignal`s.
For example, a node's `size` property might be a `CompoundSignal` that internally manages `width` and `height` signals.

- The documentation for `LayoutProps.size` mentions it can be a `SignalValue<PossibleVector2 | number>`. If it resolves to a `Vector2`, the underlying `Vector2Signal` is a type of compound signal.
- `Node.position` is a `Vector2Signal`.
- When you write `myNode().position(new Vector2(10,20), 1)`, you are tweening the entire `Vector2Signal`.
- When you write `myNode().position.x(10, 1)`, you are tweening a sub-signal (`NumberSignal`) of the `Vector2Signal`.

**Why Specialized Signals?**

- **Type Safety:** Ensures you're working with the correct data types.
- **Convenience API:** Provides methods and sub-signals tailored to the data type (e.g., `.x` on `Vector2Signal`).
- **Optimized Tweening:** Motion Canvas can use specific interpolation logic for colors, vectors, etc.

---

### 4.5 Advanced Signal Usage & Patterns

**Goal:** Explore more sophisticated ways to manipulate, combine, and react to signals.

**1. Signal Transformation (`map`):**

Derive a new "view" or "read-only version" of a signal by applying a transformation function. This is useful when you want a signal that always reflects a modified version of another signal, but you don't want to create a full `createComputed` if the dependency is simple and one-way.

```typescript
import { makeScene2D, Txt } from "@motion-canvas/2d";
import { createSignal, createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const valueInMeters = createSignal(1);

  // Create a mapped signal that always shows the value in centimeters
  // The .map() method returns a new read-only signal.
  const valueInCentimeters = valueInMeters.map((m) => m * 100);

  const textRef = createRef<Txt>();
  view.add(
    <Txt
      ref={textRef}
      // text is a function that returns a string; it can use any signal
      text={() =>
        `Meters: ${valueInMeters().toFixed(
          2
        )}, CM: ${valueInCentimeters().toFixed(2)}`
      }
      fill="white"
      fontSize={50}
    />
  );

  yield* waitFor(1);
  yield* valueInMeters(5, 2); // textRef will update to show new M and CM values
  yield* waitFor(1);
  // valueInCentimeters(500) // This would be an error, mapped signals are read-only
});
```

- `mySignal.map(transformFunction)`: The `transformFunction` receives the current value of `mySignal` and returns a new value. The result of `.map()` is a new signal that emits these transformed values.

**2. Listening to Signal Changes (`subscribe`):**

For side effects or integrating with non-Motion-Canvas logic, you can subscribe to a signal to be notified when its value changes.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createSignal, createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const counter = createSignal(0);
  const myRect = createRef<Rect>();
  view.add(
    <Rect
      ref={myRect}
      width={() => counter() * 10 + 50}
      height={50}
      fill="lightgreen"
    />
  );

  // Subscribe to changes in the counter signal
  const disposer = counter.subscribe((newValue) => {
    console.log(`Counter changed to: ${newValue}`);
    // You could trigger external actions here
  });

  yield* counter(5, 2); // Logs 1, 2, 3, 4, 5 (or intermediate values if tweening)
  yield* waitFor(0.5);
  yield* counter(10, 1); // Logs more values

  // It's good practice to dispose of subscriptions when no longer needed,
  // especially if the scene or component is destroyed and recreated.
  // For simple scene scripts, it might auto-clean, but manual disposal is safer for long-lived listeners.
  // disposer(); // This would stop the console.log messages for future changes.
  // In a scene, subscriptions are often automatically disposed when the scene finishes.
});
```

- `mySignal.subscribe(callback)`: The `callback` function is invoked whenever the signal's value changes. It receives the new value as an argument.
- It returns a `Disposer` function. Calling this disposer `disposer()` will unsubscribe the callback.

**3. Joining Signal Animations (`join`):**

Some signal methods might return an animation task (`ThreadGenerator`) directly, especially if they represent a complex internal animation of that signal (beyond a simple value tween). To run such a task, you `yield* join()` it.

Many built-in signal tweens (like `yield* mySignal(newValue, duration)`) are already set up to be directly `yield*`ed. The `join` utility is more for cases where a method on a signal explicitly returns a `ThreadGenerator` for a custom animation involving that signal.

```typescript
import { createSignal, join } from "@motion-canvas/core";

// Hypothetical example: If a signal had a complex built-in animation method
// const myCustomAnimatedSignal = createSignal(0);
// myCustomAnimatedSignal.animateToTen = function*() {
//   yield* this(5, 1);
//   yield* this(10, 1);
// }
// ...
// yield* join(myCustomAnimatedSignal.animateToTen());
```

In most common scenarios with `createSignal` and built-in node property signals, direct `yield* mySignal(value, duration)` is sufficient. `join` is more of an advanced utility for specific signal patterns.

**4. Type Guard: `isSignal`**

To check if a variable holds a signal:

```typescript
import { createSignal, isSignal } from "@motion-canvas/core";

const a = createSignal(10);
const b = 20;

if (isSignal(a)) {
  console.log("Variable 'a' is a signal. Value: ", a());
}
if (!isSignal(b)) {
  console.log("Variable 'b' is NOT a signal. Value: ", b);
}
```

**5. Initial Value vs. Reset Value:**

- `createSignal(initialValue)` sets the initial value.
- When a signal is part of a Node and that node is reset (e.g., during a full scene reset or if a parent node is re-rendered), its signals typically revert to their _initial_ values defined in the TSX or `createSignal`.
- The `signal.reset()` method reverts the signal to its initial value.
- The `signal.save()` method can be used to mark the current state as the new "initial" state for future resets (advanced).

**6. `PossibleSignalValue<T>` (or `SignalValue<T>`) - A Reminder**

Many component properties are typed as `PossibleSignalValue<Color>`, `PossibleSignalValue<number>`, etc. This means the property can accept:

1.  A direct static value (e.g., `fill={'red'}`).
2.  A signal object directly (e.g., `fill={myColorSignal}`).
3.  A getter function that returns the value (e.g., `fill={() => myColorSignal()}`).

Motion Canvas's components are designed to intelligently handle these different ways of providing values, making the system flexible.

---

This deep dive into signals covers their creation, usage, computed forms, specialized types, and some advanced patterns. Understanding signals is key to unlocking the full dynamic and reactive potential of Motion Canvas.
