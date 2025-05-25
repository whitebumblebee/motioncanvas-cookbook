Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

---

## Part 6: Advanced Animation Techniques 🚀

Now that you're comfortable with components, basic animations, and flow control, let's explore more advanced techniques to give you finer control over your animations, manage complex presentations, and even perform custom drawing.

---

### 6.1 Custom Tweening with `tween()`

**Goal:** Understand how to use the `tween()` function for more granular control over animation behavior, including creating animations not tied directly to a single node property, or applying complex logic during each step of an animation.

**Core Concepts Involved:** `tween()` function, callback function receiving progress, `TimingFunction`, custom interpolation logic (conceptual).

While property-based tweens like `yield* myNode().opacity(1, 1);` are convenient for common tasks, the `tween()` function provides a more fundamental way to animate a value over time and react to that changing value frame by frame.

**Basic `tween()` Usage:**

The `tween()` function takes a duration and a callback function. The callback is executed on each frame of the tween. It receives a `value` that progresses from 0 to 1 over the specified duration, shaped by an optional timing function.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import {
  createRef,
  tween,
  linear,
  easeInOutCubic,
  Vector2,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myRect = createRef<Rect>();
  view.add(<Rect ref={myRect} size={100} fill="lightcoral" x={-300} />);

  // Animate the rectangle's x position from -300 to 300 using tween()
  const startX = -300;
  const endX = 300;
  yield* tween(2, (progressValue) => {
    // Duration: 2 seconds
    // progressValue goes from 0 to 1 over 2 seconds (linearly by default)
    const currentX = startX + (endX - startX) * progressValue;
    myRect().position.x(currentX);

    // You can also animate other properties here simultaneously
    myRect().opacity(progressValue); // Fades in as it moves
  });

  // Using a timing function with tween()
  const initialScale = 1;
  const targetScale = 2;
  yield* tween(
    1.5, // Duration
    (value) => {
      // 'value' is now shaped by easeInOutCubic
      const currentScale = initialScale + (targetScale - initialScale) * value;
      myRect().scale(currentScale);
    },
    easeInOutCubic // Timing function applied to 'value'
  );
});
```

**Explanation:**

- `import {tween, linear, easeInOutCubic} from '@motion-canvas/core';`: Imports `tween` and any timing functions.
- `yield* tween(duration, callback, timingFunction?)`:
  - `duration`: The length of the tween in seconds.
  - `callback`: A function that is called on every frame during the tween. It receives one argument:
    - `progressValue`: A number that goes from 0.0 to 1.0 over the `duration`. If a `timingFunction` is provided, `progressValue` will be the _eased_ value.
  - `timingFunction` (optional): An easing function (like `easeInOutCubic`) to apply to the progress. Defaults to `linear`.
- Inside the callback, you use `progressValue` to calculate the current state of whatever you're animating and apply it to your nodes.

**Why use `tween()`?**

- **Animating Multiple Properties with Custom Logic:** Control several properties simultaneously with complex interdependencies that are hard to express with `all()`.
- **Animating Non-Node Values:** Animate arbitrary JavaScript variables or states that then drive node properties.
- **Custom Interpolation:** Implement unique interpolation logic for special data types within the callback.
- **Effects Based on Progress:** Create effects that depend on the normalized progress of an animation (e.g., changing color hue based on `progressValue`).

**Custom Interpolation (Conceptual within `tween` callback):**

While `tween` itself doesn't take a direct `interpolate` function like some lower-level APIs might, you implement custom interpolation _inside_ its callback.

```typescript
// Example: Tweening a Vector2 with custom interpolation logic in the callback
const startPos = new Vector2(-100, -100);
const endPos = new Vector2(100, 100);
const controlPos = new Vector2(0, 50); // For a quadratic-like curve

yield *
  tween(2, (t) => {
    // Simple quadratic bezier interpolation using 't' (progressValue)
    const x =
      (1 - t) * (1 - t) * startPos.x +
      2 * (1 - t) * t * controlPos.x +
      t * t * endPos.x;
    const y =
      (1 - t) * (1 - t) * startPos.y +
      2 * (1 - t) * t * controlPos.y +
      t * t * endPos.y;
    myRect().position(new Vector2(x, y));
  });
```

**Duration-less `tween()` for Reactive Loops (Advanced):**

The primary documented use of `tween` involves a duration. If you need a loop that runs every frame and updates based on signals (without a fixed duration for the `tween` itself), you'd typically use a `loop` with a `yield` or a very short `waitFor`, or directly set properties in a `loop` that reads signals.

The `tween` function itself expects a duration. For continuous updates based on signals, you'd define properties reactively: `<Rect x={() => mySignal() * 10} />`. The `tween` function is specifically for animating over a _defined duration_.

---

### 6.2 Working with Time Events & Slides

**Goal:** Learn to structure animations into logical "slides" similar to a presentation, control transitions between them, and synchronize animations using named time events.

**Core Concepts Involved:** `slideTransition()`, `slide()`, `beginSlide()`, `useDuration()`, `player` object, `waitUntil()`.

Motion Canvas has a robust system for creating presentations where animations are organized into slides.

**1. Defining Slides with `slide()`:**

In a `CustomScene` (a class that extends `Scene2D` or `Scene`), you can use the `slide()` method within its main generator function to define individual slides.

```typescript
import { makeScene2D, Rect, Circle } from "@motion-canvas/2d";
import {
  createRef,
  slideTransition,
  waitFor,
  Direction,
  Origin,
  all,
} from "@motion-canvas/core";

// It's often cleaner to define scenes as classes for slide-based presentations
export default class MyPresentationScene extends makeScene2D {
  private readonly rect = createRef<Rect>();
  private readonly circle = createRef<Circle>();

  public constructor(view: any) {
    // The view is passed here
    super(view); // Call the parent constructor

    view.add(<Rect ref={this.rect} size={150} fill="blueviolet" opacity={0} />);
    view.add(
      <Circle ref={this.circle} size={100} fill="crimson" x={200} opacity={0} />
    );
  }

  protected *Animate() {
    // The main animation logic
    // --- SLIDE 1 ---
    yield* this.slide("Slide 1: Introduce Rectangle");
    yield* this.rect().opacity(1, 0.5);
    yield* this.rect().position.x(-200, 1);
    yield* waitFor(0.5); // Hold slide

    // --- SLIDE 2 (with a transition) ---
    yield* slideTransition(Direction.Right, 0.6); // Transition effect
    yield* this.slide("Slide 2: Introduce Circle & Animate Both");
    // Rectangle is already visible from previous slide.
    // If you want it to reset or change, animate it here.
    // For this example, let's move it back and fade in circle.
    yield* all(
      this.rect().position.x(0, 1),
      this.circle().opacity(1, 0.5),
      this.circle().position.x(0, 1)
    );
    yield* waitFor(1); // Hold slide

    // --- SLIDE 3 (another transition) ---
    yield* slideTransition(Origin.BottomRight, 0.8);
    yield* this.slide("Slide 3: Fade Out");
    yield* all(this.rect().opacity(0, 1), this.circle().opacity(0, 1));
    yield* waitFor(0.5); // Hold slide for a bit after fade
  }
}
```

- To use this class-based scene, your `project.ts` would look like:

  ```typescript
  // project.ts
  import { makeProject } from "@motion-canvas/core";
  import myPresentationScene from "./scenes/myPresentationScene?scene"; // Note the ?scene

  export default makeProject({
    scenes: [myPresentationScene],
  });
  ```

- **`class MyPresentationScene extends makeScene2D`**: You create a class that extends `makeScene2D`.
- **`constructor(view)`**: The constructor receives the `view` and is where you typically add initial elements.
- **`protected* Animate()`**: The main generator function for this scene's animation timeline. The name `Animate` is a convention; it could be different if `makeScene2D` is used differently. When you pass a class to `makeProject`, it looks for a method that is a generator.
- **`yield* this.slide('Optional Slide Name');`**: This command marks the beginning of a new slide.
  - The player (editor or exported presentation) will pause at the end of the animations for this slide.
  - The "Optional Slide Name" is useful for navigation and is displayed in the editor.
  - If a slide contains no animations after its declaration, you might need a `yield* waitFor(duration)` or another `yield` to define its duration.

**2. Slide Transitions (`slideTransition()`):**

To make the change between slides more visually appealing.

```typescript
import {
  slideTransition,
  Direction,
  Origin,
  FadeTransition,
} from "@motion-canvas/core";

// ... inside your Animate() generator ...

// Transition to the next logical slide (defined by subsequent code)
yield * slideTransition(Direction.Left, 1.0); // Content slides in from left over 1s

// Other built-in transitions:
// yield* new FadeTransition({duration: 0.8});
// yield* new SlideTransition({direction: Direction.Top, duration: 0.7});

// Then define the content of the next slide
yield * this.slide("Next Slide Name");
// ... animations for this new slide ...
```

- `slideTransition(direction_or_transition_object, duration?)`:
  - Takes a direction (e.g., `Direction.Right`) and duration for a simple slide effect.
  - Or, you can instantiate transition classes like `FadeTransition`, `SlideTransition` and configure them.
- This command should be placed _before_ the `this.slide()` call for the slide you are transitioning _to_.

**3. Time Events & `useDuration()`:**

Time events allow different parts of your animation to synchronize with each other based on named durations.

- **`beginSlide(name: string)` / `this.slide(name: string)`:** These implicitly mark named points in your timeline.
- **`useDuration(eventName: string): number`:** This function retrieves the duration that was automatically calculated for a named slide or a block of `yield*` statements that form part of a slide's content.
  - **Important:** `useDuration` relies on a two-pass rendering system. Motion Canvas first runs through the scene to calculate durations of all time-event-marked segments (like slides). Then, in the second pass, `useDuration` can return these calculated values. This means the value of `useDuration('mySlide')` is available _after_ 'mySlide' has been defined and its duration calculated.

```typescript
// ... inside your Animate() generator ...
const introCircle = createRef<Circle>();
// ... add introCircle ...

yield * this.slide("Intro");
const introDuration =
  yield *
  all(
    // 'all' itself returns a duration
    introCircle().opacity(1, 1),
    introCircle().scale(2, 1.5)
  );
// At this point, `introDuration` holds 1.5 seconds.
// Or, if 'Intro' slide had a fixed duration or more complex logic,
// you could try to use useDuration('Intro') in a LATER part of the script.

// Example using useDuration for a later animation to match an earlier slide's length
// This is more reliable if 'Intro' was a well-defined slide block.
yield * this.rect().width(500, useDuration("Intro")); // Animate width over same duration as "Intro" slide.
// This assumes 'Intro' has already been fully defined
// and its duration calculated in the first pass.
```

Using `useDuration` effectively often means structuring your animation so that the duration you want to use is determined _before_ the animation that needs it.

**4. `player` Object and `waitUntil()` for Events:**

The `view.player` object (or `this.player` in a class scene) provides access to player controls and an event dispatcher.

```typescript
// ... inside your Animate() generator ...

// Dispatch a custom event
this.player.dispatch("myCustomEvent", { value: 42 });

// In another part of the animation, or a spawned task:
yield * waitUntil("myCustomEvent");
// console.log('myCustomEvent was received!');

// The player also dispatches built-in events like 'seek', 'play', 'pause', 'slide'.
// For example, to wait until the next slide is triggered by player controls (e.g., clicking next):
// yield* waitUntil('slide'); // This might be too generic, often slide name is used.
// For specific slide navigation events, you might use slide names or sequence slides directly.
```

`waitUntil(eventName)` is powerful for synchronizing parts of your animation that aren't directly sequential, or for reacting to player interactions.

**Using `navigation` (from `@motion-canvas/core`):**
The `navigation` object (often accessed via `this.navigation` in a class scene, or potentially `view.navigation`) provides methods for programmatic slide control, which also trigger events.

- `yield* navigation.next()`: Programmatically go to the next slide.
- `yield* navigation.previous()`: Go to the previous slide.
- `yield* navigation.goTo(slideIndexOrName)`: Jump to a specific slide.

**Combining Slides with `loop` or `all`:**

You can combine these. For example, `yield* all(rectSlideTask(), circleSlideTask())` if those tasks internally define their own slides and animations. The exact behavior of nested slides or slides within loops should be tested for desired outcomes, as the "current slide" concept is managed by the player.

---

This section provided an overview of advanced animation control with `tween()`, and the powerful slide and time event system for structuring presentations.

---

Okay, let's continue with **Part 6: Advanced Animation Techniques** in the Chalchitra Cookbook.

---

### 6.3 Custom Drawing with the `<Canvas />` Component

**Goal:** Learn how to perform arbitrary 2D drawing operations using the native HTML5 Canvas API directly within a Motion Canvas node. This is useful for visuals that are too complex or dynamic for standard components, or for integrating custom rendering logic.

**Core Concepts Involved:** `Canvas` component, `CanvasRenderingContext2D` (often abbreviated as `ctx`), `draw` property, reactivity with signals.

**The `<Canvas />` Component:**

Motion Canvas provides a `<Canvas />` component (from `@motion-canvas/2d`) that gives you a direct 2D rendering context. You provide a function that performs the drawing operations.

**Basic Usage:**

```typescript
import { makeScene2D, Canvas, Rect } from "@motion-canvas/2d";
import { createRef, createSignal, Vector2, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myCustomCanvas = createRef<Canvas>();
  const circleRadius = createSignal(30);

  view.add(
    <Canvas
      ref={myCustomCanvas}
      width={400}
      height={300}
      // The 'draw' prop takes a function that receives the 2D context
      draw={(ctx, size, anکرoundSize, pixelRatio) => {
        // ctx: CanvasRenderingContext2D
        // size: Vector2 - the current resolved size of the canvas node
        // anکرoundSize: Vector2 - (deprecated, use size)
        // pixelRatio: number - the pixel ratio for HiDPI displays

        // Clear the canvas (important if redrawing frequently)
        ctx.clearRect(0, 0, size.width, size.height);

        // Draw a red background
        ctx.fillStyle = "rgba(50, 50, 100, 0.3)";
        ctx.fillRect(0, 0, size.width, size.height);

        // Draw a circle using native canvas commands
        ctx.beginPath();
        ctx.arc(
          size.width / 2,
          size.height / 2,
          circleRadius(),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "lightcoral";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        ctx.stroke();

        // Draw some text
        ctx.font = `${30 * pixelRatio}px Arial`; // Adjust font size for pixel ratio
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Custom Canvas!", size.width / 2, size.height / 2 + 80);
      }}
      // List signals that this canvas's draw function depends on.
      // When these signals change, the canvas will repaint.
      dependencies={[circleRadius]}
    />
  );

  yield* waitFor(1);
  yield* circleRadius(80, 1); // Animate the signal, canvas will repaint
  yield* waitFor(0.5);
  yield* myCustomCanvas().scale(1.2, 0.5); // The Canvas node itself can be animated
});
```

**Explanation:**

- `import {Canvas} from '@motion-canvas/2d';`: Imports the `Canvas` component.
- `<Canvas width={400} height={300} ... />`: Defines the canvas area.
  - `width`, `height`: Set the logical dimensions of the canvas drawing surface.
- **`draw` property:**
  - This is the most important property. It takes a function that will be executed to perform the drawing.
  - The `draw` function receives arguments:
    - `ctx: CanvasRenderingContext2D`: The standard HTML5 canvas 2D rendering context. You use this object for all drawing commands.
    - `size: Vector2`: A `Vector2` object representing the current rendered width and height of the canvas element. This is the size you should use for your drawing logic to ensure it scales correctly if the `Canvas` node's `width` or `height` properties are percentages or change.
    - `pixelRatio: number`: The display's pixel ratio (e.g., `2` for Retina displays). You should multiply your drawing coordinates and sizes by this if you want crisp 1:1 pixel rendering, or ensure your canvas context is scaled appropriately (Motion Canvas often handles the context scaling for you, so `size` is in logical pixels). _Check documentation or experiment: Usually, you draw in logical pixels within the `size.width` and `size.height`, and Motion Canvas handles scaling the canvas element itself for high DPI._ The `Canvas` component internally scales the context by `pixelRatio`, so you typically draw using logical coordinates from `0,0` to `size.width, size.height`.
- **`dependencies` property:**
  - `dependencies={[signal1, signal2, ...]}`: An array of signals. If any signal in this array changes, the `draw` function will be re-executed, causing the canvas to repaint. This is crucial for making your custom drawing reactive.

**Common `CanvasRenderingContext2D` (ctx) Operations:**

- **Clearing:**

  - `ctx.clearRect(x, y, width, height)`: Clears the specified rectangular area, making it transparent.

- **Paths:**

  - `ctx.beginPath()`: Starts a new path.
  - `ctx.moveTo(x, y)`: Moves the "pen" to a starting point.
  - `ctx.lineTo(x, y)`: Draws a straight line from the current point to a new point.
  - `ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise?)`: Draws an arc or circle segment.
  - `ctx.quadraticCurveTo(cp1x, cp1y, x, y)`: Draws a quadratic Bézier curve.
  - `ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`: Draws a cubic Bézier curve.
  - `ctx.rect(x, y, width, height)`: Adds a rectangle to the current path.
  - `ctx.closePath()`: Closes the current path by drawing a line from the current point to the starting point.

- **Styling:**

  - `ctx.fillStyle = colorOrGradientOrPattern`: Sets the fill style.
  - `ctx.strokeStyle = colorOrGradientOrPattern`: Sets the stroke (outline) style.
  - `ctx.lineWidth = number`: Sets the width of lines.
  - `ctx.lineCap = 'butt' | 'round' | 'square'`: Style of line endings.
  - `ctx.lineJoin = 'miter' | 'round' | 'bevel'`: Style of line corners.
  - `ctx.font = 'italic bold 30px Arial'`: Sets font properties for text.
  - `ctx.textAlign = 'left' | 'right' | 'center' | 'start' | 'end'`: Horizontal text alignment.
  - `ctx.textBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'`: Vertical text alignment.
  - `ctx.globalAlpha = number (0-1)`: Global transparency for subsequent drawing operations.
  - `ctx.shadowColor`, `ctx.shadowBlur`, `ctx.shadowOffsetX`, `ctx.shadowOffsetY`: For shadows.

- **Drawing Operations:**

  - `ctx.fill()`: Fills the current path with `fillStyle`.
  - `ctx.stroke()`: Strokes (outlines) the current path with `strokeStyle` and `lineWidth`.
  - `ctx.fillRect(x, y, width, height)`: Draws a filled rectangle directly.
  - `ctx.strokeRect(x, y, width, height)`: Draws an outlined rectangle directly.
  - `ctx.fillText(text, x, y, maxWidth?)`: Draws filled text.
  - `ctx.strokeText(text, x, y, maxWidth?)`: Draws outlined text.
  - `ctx.drawImage(image, dx, dy, dWidth?, dHeight?, ...)`: Draws an image, canvas, or video frame.

- **Transformations (affect the entire context state):**
  - `ctx.save()`: Saves the current drawing state (styles, transformations).
  - `ctx.restore()`: Restores the most recently saved drawing state.
  - `ctx.translate(x, y)`: Moves the origin of the coordinate system.
  - `ctx.rotate(angleInRadians)`: Rotates the coordinate system around the current origin.
  - `ctx.scale(xScale, yScale)`: Scales the coordinate system.
  - `ctx.transform(a, b, c, d, e, f)` / `ctx.setTransform(...)`: Directly manipulate the transformation matrix.

**Reactivity and Updates:**

- The `draw` function is re-executed when:
  1.  The `Canvas` node's own animatable properties (like `width`, `height`, or common `Node` properties if they affect layout) change.
  2.  Any signal listed in its `dependencies` array changes.
- If your `draw` function uses external signals not listed in `dependencies`, the canvas might not update when those external signals change.
- `myCanvasRef().requestPaint()`: You can call this method on your canvas reference to manually trigger a repaint if needed (e.g., if the drawing depends on external state not captured by signals in `dependencies`).
- `myCanvasRef().requestLayoutUpdate()`: If the logical size the canvas should occupy changes due to external factors not automatically tracked, you might need this.

**Interaction with Motion Canvas Scene:**

- The `<Canvas />` node itself is a standard Motion Canvas node. You can position it using `x`, `y`, scale it with `scale`, rotate it with `rotation`, and animate its `opacity`.
- The `width` and `height` properties of the `<Canvas />` node define the size of its internal drawing buffer. The drawing operations within the `draw` function are relative to these dimensions.

**Performance Considerations:**

- Custom drawing with `<Canvas />` is extremely flexible but can be less performant than using built-in Motion Canvas components if not managed carefully, especially if the `draw` function is very complex and re-renders frequently.
- Built-in components are often highly optimized (e.g., they might use WebGL rendering for certain shapes).
- For very complex custom drawing that needs high performance, you might eventually look into custom WebGL renderers if Motion Canvas allows such extensions (this is beyond typical `<Canvas />` usage).
- **Tip:** Minimize the amount of work done in the `draw` function, especially if it's called very often. Pre-calculate values outside the `draw` function if possible.

---

This covers custom drawing with the `<Canvas />` component, giving you a powerful escape hatch for highly customized visuals.

We have now covered the main "Advanced Animation Techniques" initially planned for Part 6.
