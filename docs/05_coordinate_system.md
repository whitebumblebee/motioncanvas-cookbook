Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

---

## Part 5: Essential Data Types & Coordinate Systems 📐🎨

Understanding how Motion Canvas handles fundamental data like colors, vectors, and its coordinate system is key to precisely controlling your animations and visual elements.

---

### 5.1 Working with Colors (`Color`)

**Goal:** Understand how to define, use, and manipulate colors for fills, strokes, and other color properties.

**Core Concepts Involved:** `Color` class, color string formats (hex, RGB, HSL, named), `PossibleColor` type, color interpolation.

**The `Color` Class:**

While you can often use simple string representations for colors (e.g., `'red'`, `'#FF0000'`), Motion Canvas has a `Color` class (from `@motion-canvas/core`) that provides more capabilities. Many color properties on nodes are, or can accept, `Color` objects or `ColorSignal`s.

**Creating `Color` Objects:**

```typescript
import { Color } from "@motion-canvas/core";

// From named colors (CSS Level 1 named colors)
const redColor = new Color("red");

// From HEX strings
const blueHex = new Color("#0000FF");
const greenHexShort = new Color("#0F0"); // Short hex
const transparentRedHex = new Color("#FF000080"); // Hex with alpha

// From RGB/RGBA functional notation
const rgbColor = new Color("rgb(0, 255, 0)");
const rgbaColor = new Color("rgba(0, 0, 255, 0.5)");

// From HSL/HSLA functional notation
const hslColor = new Color("hsl(120, 100%, 50%)"); // Green
const hslaColor = new Color("hsla(240, 100%, 50%, 0.7)"); // Semi-transparent blue

// From an object (useful for programmatic construction)
const customColor = new Color({ r: 255, g: 100, b: 50, a: 1 });

// From another Color object (creates a clone)
const anotherRed = new Color(redColor);
```

**The `PossibleColor` Type:**

Many component properties that accept colors (like `fill`, `stroke`, `textColor`) are typed as `PossibleColor`. This means they can accept:

- A `Color` object instance.
- A color string (hex, rgb, hsl, named).
- A number (can sometimes be interpreted as a grayscale value or hex, depending on context, though string or `Color` object is safer).
- A `Gradient` object (covered in section 2.1 with `Rect`).
- A `Pattern` object (more advanced, for image/canvas patterns).
- `null` (often means no color or transparent).

When you provide a string or number, Motion Canvas usually converts it internally to a `Color` object.

**Using Colors with Components:**

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Color } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myRect = createRef<Rect>();

  view.add(
    <Rect
      ref={myRect}
      width={200}
      height={100}
      // fill can be a string or a Color object
      fill={new Color("purple")}
      stroke={"#FFD700"} // Gold color string
      lineWidth={8}
    />
  );
  yield;

  // Animating to a new Color object or string
  yield* myRect().fill(new Color("rgb(50, 200, 50)"), 1); // Animate to a green
  yield* myRect().stroke("magenta", 1); // Animate stroke to magenta
});
```

**Manipulating `Color` Objects & Accessing Components:**

`Color` objects have methods to get or set their components or convert them to different formats. If a `Color` object is wrapped in a `ColorSignal`, its components (r, g, b, a, h, s, l) might also be signals.

```typescript
const myColor = new Color("rgba(255, 0, 128, 0.8)");

// Get components (values are typically 0-255 for r,g,b and 0-1 for a)
console.log(myColor.r()); // Read red component
console.log(myColor.g());
console.log(myColor.b());
console.log(myColor.alpha()); // Read alpha component

// Set components (returns a new Color object or mutates if it's a signal setter)
// If myColor is a simple Color instance (not a ColorSignal):
const newColor1 = myColor.alpha(1); // Returns a new Color with alpha=1
const newColor2 = myColor.red(100).green(150); // Chain modifications

// If it were a ColorSignal, usage would be:
// myColorSignal().alpha(1); // If alpha is a sub-signal setter
// Or directly modify the ColorSignal if its components are sub-signals
// yield* myColorSignal.r(100,1); // If .r is an animatable sub-signal

// Convert to string formats
console.log(myColor.css()); // e.g., "rgba(255,0,128,0.8)"
console.log(myColor.hex()); // e.g., "#ff0080" (alpha might be ignored or handled differently)
console.log(myColor.rgb()); // e.g., "rgb(255,0,128)"
console.log(myColor.hsl()); // e.g., "hsl(someHue, someSat, someLight)"

// Other manipulations
const lighterColor = myColor.lighten(0.2); // Increase lightness by 20%
const desaturatedColor = myColor.desaturate(0.5); // Desaturate by 50%
```

_The exact methods for setting components on a `Color` instance versus a `ColorSignal`'s sub-signals can differ. For `ColorSignal`s on nodes, you typically tween the entire color property: `myNode().fill(newColor, duration)`._

**Color Interpolation:**

When you animate a color property (e.g., `yield* myRect().fill('blue', 1);`), Motion Canvas smoothly interpolates between the start and end colors.

- By default, it often uses the **HSLuv color space** for interpolation. HSLuv is designed to be perceptually uniform, meaning changes in color values correspond more closely to how humans perceive color changes, resulting in smoother and more natural-looking gradients and transitions than simple RGB interpolation.

---

### 5.2 Working with 2D Vectors (`Vector2`)

**Goal:** Understand how to define, use, and perform operations on 2D vectors, which are essential for positions, sizes, directions, and many other 2D calculations.

**Core Concepts Involved:** `Vector2` class, `x` and `y` components, vector arithmetic, static helper methods.

**The `Vector2` Class:**

A `Vector2` object (from `@motion-canvas/core`) represents a pair of `x` and `y` coordinates or a 2D direction.

**Creating `Vector2` Objects:**

```typescript
import { Vector2 } from "@motion-canvas/core";

const vec1 = new Vector2(100, 50); // x = 100, y = 50
const vec2 = new Vector2(10); // x = 10, y = 10 (if one arg, often used for both)
const vec3 = new Vector2([20, 30]); // From an array [x, y]
const vec4 = new Vector2({ x: 5, y: 15 }); // From an object {x, y}
const vec5 = new Vector2(vec1); // Clone from another Vector2

// Static presets
const zeroVector = Vector2.zero; // (0, 0) - new Vector2(0,0)
const oneVector = Vector2.one; // (1, 1) - new Vector2(1,1)
const upVector = Vector2.up; // (0, -1) - new Vector2(0,-1)
const downVector = Vector2.down; // (0, 1)  - new Vector2(0,1)
const leftVector = Vector2.left; // (-1, 0) - new Vector2(-1,0)
const rightVector = Vector2.right; // (1, 0)  - new Vector2(1,0)

// Create from angle (in degrees)
const fromAngle = Vector2.fromDegrees(45); // Vector pointing at 45 degrees, magnitude 1
// const fromAngle = Vector2.fromRadians(Math.PI / 4);
```

**The `PossibleVector2` Type:**

Node properties like `position`, `size` (for some nodes), or `scale` are often typed as `PossibleVector2`. This means they can accept:

- A `Vector2` object instance.
- A tuple `[number, number]` representing `[x, y]`.
- A single `number` (often meaning `x` and `y` will both be that number, e.g., for uniform scale or size).
- An object `{x: number, y: number}`.

Motion Canvas will convert these into `Vector2` objects internally.

**Accessing Components:**

A `Vector2` object has `x` and `y` properties.

```typescript
const myPos = new Vector2(10, 20);
console.log(myPos.x); // 10
console.log(myPos.y); // 20

// You can set them if the Vector2 instance is mutable,
// but many Vector2 methods return new instances (immutable operations).
// myPos.x = 30; // This is possible for a direct Vector2 instance.
// However, if myPos came from a node's signal like node.position(),
// you'd use node.position.x(30) to set its x-component signal.
```

**Vector Operations:**

`Vector2` methods typically perform immutable operations, returning a _new_ `Vector2` object with the result. This is good for reactive programming.

- **Arithmetic:**

  - `vec1.add(vec2)` or `vec1.add([x,y])` or `vec1.add(scalar)`: Adds vectors or a scalar.
  - `vec1.sub(vec2)`: Subtracts.
  - `vec1.mul(scalar)` or `vec1.mul(vec2)` (component-wise multiplication): Multiplies.
  - `vec1.div(scalar)` or `vec1.div(vec2)` (component-wise division): Divides.
  - `vec1.neg()`: Negates both components (`new Vector2(-vec1.x, -vec1.y)`).

  ```typescript
  const vA = new Vector2(10, 20);
  const vB = new Vector2(5, 5);
  const sum = vA.add(vB); // Vector2(15, 25)
  const scaled = vA.mul(2); // Vector2(20, 40)
  ```

- **Magnitude & Normalization:**

  - `vec.magnitude`: The length of the vector.
  - `vec.magnitudeSquared`: Length squared (cheaper to compute).
  - `vec.normalized`: A new vector with the same direction but magnitude 1 (unit vector).

- **Dot & Cross Product:**

  - `vec1.dot(vec2)`: Returns a scalar (number).
  - `vec1.cross(vec2)`: For 2D vectors, this typically returns the Z-component of the 3D cross product (a scalar), useful for determining orientation/winding.

- **Angle & Distance:**

  - `vec.degrees`: The angle of the vector in degrees (from the positive X-axis).
  - `vec.radians`: The angle in radians.
  - `vec1.angleBetween(vec2)`: Angle in radians between two vectors.
  - `vec1.distance(vec2)`: Euclidean distance between the points represented by `vec1` and `vec2`.
  - `vec1.distanceSquared(vec2)`: Squared distance.

- **Interpolation:**

  - `vec1.lerp(vec2, alpha)`: Linear interpolation between `vec1` and `vec2`. `alpha=0` is `vec1`, `alpha=1` is `vec2`.

- **Other Utilities:**
  - `vec.perpendicular`: A vector perpendicular to `vec`.
  - `vec.project(ontoVec)`: Projects `vec` onto `ontoVec`.
  - `vec.reflect(normal)`: Reflects `vec` across a surface with the given `normal`.
  - `vec.transformAsPoint(matrix)`: Transforms the vector as a point by a `Matrix`.
  - `vec.transformAsVector(matrix)`: Transforms the vector as a direction by a `Matrix` (ignores translation).
  - `vec.clone()`: Creates a copy.
  - `vec.equals(otherVec)`: Checks for equality.

**Using `Vector2` with Node Properties:**

Node properties like `position`, `size`, and `scale` are often `Vector2Signal`s.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myRect = createRef<Rect>();
  view.add(<Rect ref={myRect} size={[100, 50]} fill="skyblue" />);

  // Animate position using a new Vector2
  yield* myRect().position(new Vector2(200, 100), 1);

  // Animate scale component-wise
  yield* myRect().scale.x(2, 0.5); // Animate only horizontal scale
  yield* myRect().scale(new Vector2(1, 1), 0.5); // Reset scale

  // Get current position and calculate a new one
  const currentPos = myRect().position(); // This is a Vector2Signal, call it to get Vector2
  const offset = new Vector2(50, -30);
  const newPos = currentPos.add(offset); // Vector math
  yield* myRect().position(newPos, 1);
});
```

---

### 5.3 Understanding Coordinate Systems

**Goal:** Clarify how coordinates work in Motion Canvas scenes to accurately position and transform your nodes.

**Core Concepts Involved:** Scene/Global coordinates, Local Node coordinates, Node Origin/Pivot (`offset` property).

**1. Scene Coordinates (View Space / Global Space):**

- **Origin `(0,0)`:** By default, the origin of your scene is at the **center** of the `view` (the stage).
- **X-axis:** Positive values go to the **right**. Negative values go to the **left**.
- **Y-axis:** Positive values go **downwards**. Negative values go **upwards**. (This is common in many 2D graphics systems).
- **Boundaries:**
  - Left edge: `x = -view.width() / 2`
  - Right edge: `x = view.width() / 2`
  - Top edge: `y = -view.height() / 2`
  - Bottom edge: `y = view.height() / 2`

**2. Local Node Coordinates:**

- Each node has its own local coordinate system.
- A node's `position` property (`x`, `y`) defines the location of its **local origin** relative to its **parent node's** local coordinate system.
- Children of a node are positioned and transformed relative to their parent node's local origin and coordinate system.

**Example:**

```typescript
view.add(
  <Rect
    name="ParentRect"
    x={100}
    y={50}
    width={300}
    height={200}
    fill="lightgray"
  >
    {/* This child's (0,0) is at the ParentRect's (100,50) in view coordinates */}
    <Circle name="ChildCircle" x={0} y={0} size={40} fill="red" />
    {/* ChildCircle is centered within ParentRect if ParentRect has no offset */}
    {/* Its absolute position in view coordinates would be (100,50) */}

    <Rect name="ChildRect" x={20} y={-30} size={40} fill="blue" />
    {/* ChildRect's absolute position in view coordinates would be (100+20, 50-30) = (120,20) */}
  </Rect>
);
```

**3. Node Origin / Pivot Point (The `offset` Property):**

The `offset` property of a `Layout` based node (which includes `Rect`, `Circle`, `Txt`, `Img`, `Layout` itself, etc.) determines the node's "pivot point" or local origin for its transformations (`scale`, `rotation`) and also for how its `width` and `height` are laid out relative to its `position`.

- `offset: Vector2` (default usually `Vector2.zero` meaning center, but can vary per component type)
- The `offset` is a multiplier of the node's size.

  - `offset={[0, 0]}` (or `Vector2.zero`): The origin is at the **center** of the node. Transformations happen around the center. This is often the default for shapes like `Circle` and `Rect`.
  - `offset={[-1, -1]}`: The origin is at the **top-left** corner. (Using -1 for top/left might be if the range is -1 to 1. More commonly, an offset of `[-0.5, -0.5]` with a size would make the top-left the anchor if size is known. The exact interpretation of `offset` values (e.g., as fractions of size, or in [-1,1] space) should be checked in the documentation or by experimentation. _Correction based on typical layout systems: `offset` values are typically multipliers of the node's size, so `[0,0]` is top-left if no size is considered, `[0.5, 0.5]` is center, `[1,1]` is bottom-right. However, Motion Canvas often defaults to center origin for many nodes, meaning their internal offset might be effectively `[0.5, 0.5]` or `[0,0]` depending on how `position` is defined to interact with it. The documentation for `Layout.offset` says "Offset of the pivot point specified as a percentage of the layout size." So, `offset={[0,0]}` means pivot is top-left, `offset={[0.5,0.5]}` means pivot is center, `offset={[1,1]}` means pivot is bottom-right._ Let's assume `[0,0]` is top-left for the offset definition. Many Motion Canvas nodes like `Rect` default their drawing origin to their center, which means their effective pivot for `x` and `y` positioning is the center. The `offset` property on `Layout` derived nodes shifts this pivot.

  From docs: For `Layout`, `offset` defines the origin of the node, specified as a fraction of its size. `[0, 0]` is the top-left corner, `[0.5, 0.5]` is the center, and `[1, 1]` is the bottom-right.

```typescript
import { makeScene2D, Rect, Layout } from "@motion-canvas/2d";
import { createRef, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const rect1 = createRef<Rect>(); // Default offset (usually center for drawing)
  const rect2 = createRef<Layout>(); // Using Layout to demonstrate offset clearly

  view.add(
    <>
      {/* Rect's default drawing origin is its center for x,y. */}
      <Rect ref={rect1} x={-100} y={-100} size={80} fill="red" />

      {/* Layout node. Position x,y refers to the point defined by its offset */}
      <Layout
        ref={rect2}
        x={100}
        y={100} // This x,y refers to the top-left because of offset={[0,0]}
        width={80}
        height={80}
        offset={[0, 0]} // Pivot is top-left corner
        fill="blue"
      />
    </>
  );
  yield;

  // Rotation happens around the node's origin (defined by its offset)
  yield* rect1().rotation(360, 2); // Will rotate around its center
  yield* rect2().rotation(360, 2); // Will rotate around its top-left corner
});
```

**4. Converting Between Coordinate Spaces:**

Nodes in Motion Canvas have methods to convert coordinates between their local space, their parent's space, and the global (world/view) space. These are useful for advanced scenarios like custom hit-testing, aligning nodes based on points in other nodes, or drawing custom connections.

- `node.localToWorld(): Matrix`: Gets the transformation matrix from this node's local space to world (view) space.
- `node.worldToLocal(): Matrix`: Gets the transformation matrix from world space to this node's local space.
- `node.localToParent(): Matrix`: Matrix from local to parent.
- `node.parentToLocal(): Matrix`: Matrix from parent to local.
- `node.transformPoint(point: Vector2, fromSpace?: Node, toSpace?: Node)`: Transforms a point from one node's space to another's.
- `node.transformPointLocal(point: Vector2)`: Transforms a point from the node's local space to its parent's space.
- `node.transformPointWorld(point: Vector2)`: Transforms a point from the node's local space to world space.
- `node.inverseTransformPointWorld(point: Vector2)`: Transforms a point from world space to the node's local space.

```typescript
// Example: Get center of rect1 in world coordinates
// const rect1CenterLocal = Vector2.zero; // Center in its own local space if offset is [0,0]
// const rect1CenterWorld = rect1().transformPointWorld(rect1CenterLocal);
// console.log(rect1CenterWorld);

// This might be simpler if rect1.absolutePosition() exists and returns center
// console.log(rect1().absolutePosition()); // This gives the position of the node's origin in world space.
// To get the visual center in world space, you might need to account for its internal drawing origin or offset.
```

The `absolutePosition` signal on a node gives the position of its origin in world space. `absoluteRotation` and `absoluteScale` also exist.

---

This part covered `Color`, `Vector2`, and Coordinate Systems. These are crucial for precise control over your animations.

---

Okay, let's continue with **Part 5: Essential DataTypes & Visual Effects** in the Chalchitra Cookbook.

We'll now delve into Gradients and Patterns, which allow for more sophisticated styling of your shapes, and then briefly touch upon the underlying Matrix transformations.

---

### 5.4 Working with Gradients (`Gradient`)

**Goal:** Understand how to define and use linear, radial, and conic gradients to create rich color transitions for fills and strokes.

**Core Concepts Involved:** `Gradient` class, `GradientType` (`linear`, `radial`, `conic`), `GradientStop` objects, coordinate modes.

**The `Gradient` Class:**

Instead of a single color, `fill` and `stroke` properties can accept a `Gradient` object (from `@motion-canvas/core`).

**Creating Gradients:**

You create a `Gradient` by providing a configuration object. The most important properties are `type` and `stops`.

- **`stops: GradientStop[]`**: An array defining the colors and their positions in the gradient.
  - Each `GradientStop` is an object: `{offset: number, color: PossibleColor}`.
  - `offset`: A number between `0` (start of the gradient) and `1` (end of the gradient).
  - `color`: The color at that offset.

**1. Linear Gradients (`type: 'linear'`)**

Creates a gradient along a line.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Gradient, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const linearGradRect = createRef<Rect>();

  view.add(
    <Rect
      ref={linearGradRect}
      width={400}
      height={200}
      fill={
        new Gradient({
          type: "linear",
          // 'from' and 'to' define the gradient line.
          // These can be absolute pixel values relative to the node's top-left,
          // or fractional if given as objects {x: fraction, y: fraction}
          // from: {x: 0, y: 0.5}, // From left-middle (0% width, 50% height)
          // to: {x: 1, y: 0.5},   // To right-middle (100% width, 50% height)
          // Or, using Vector2 for absolute points (less common for general gradients)
          from: new Vector2(0, 100), // Starts at x=0, y=100 (relative to rect's origin)
          to: new Vector2(400, 100), // Ends at x=400, y=100
          stops: [
            { offset: 0, color: "red" },
            { offset: 0.5, color: "yellow" },
            { offset: 1, color: "blue" },
          ],
        })
      }
    />
  );
  yield;
});
```

- **Key `LinearGradient` properties (within the `Gradient` constructor object):**
  - `type: 'linear'`
  - `from: PossibleVector2`: Start point of the gradient line. Coordinates can be:
    - `Vector2` or `[number, number]`: Absolute pixel values from the node's origin.
    - `{x: number, y: number}`: Fractional values (0 to 1) relative to the node's size. `from: {x:0, y:0}` is top-left, `from: {x:1, y:1}` is bottom-right.
  - `to: PossibleVector2`: End point of the gradient line (same coordinate options as `from`).

**2. Radial Gradients (`type: 'radial'`)**

Creates a gradient that radiates outwards from a central point.

```typescript
import { makeScene2D, Circle } from "@motion-canvas/2d";
import { createRef, Gradient, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const radialGradCircle = createRef<Circle>();

  view.add(
    <Circle
      ref={radialGradCircle}
      size={300}
      fill={
        new Gradient({
          type: "radial",
          // 'from' is the center of the inner circle (start of gradient)
          // 'to' is the center of the outer circle (end of gradient)
          // 'fromRadius' and 'toRadius' define the circles' sizes.
          // Using fractional coordinates for centers:
          from: { x: 0.5, y: 0.5 }, // Center of the node
          to: { x: 0.5, y: 0.5 }, // Same center for a standard radial gradient
          fromRadius: 0, // Start radius (in pixels)
          toRadius: 150, // End radius (half the circle's size)
          stops: [
            { offset: 0, color: "rgba(255, 255, 0, 1)" }, // Yellow center
            { offset: 0.7, color: "rgba(255, 100, 0, 0.8)" },
            { offset: 1, color: "rgba(255, 0, 0, 0)" }, // Fades to transparent red at edge
          ],
        })
      }
    />
  );
  yield;
});
```

- **Key `RadialGradient` properties:**
  - `type: 'radial'`
  - `from: PossibleVector2`: Center of the inner (start) circle. Fractional or absolute.
  - `to: PossibleVector2`: Center of the outer (end) circle. For a simple radial gradient, `from` and `to` are often the same.
  - `fromRadius: number`: Radius of the inner circle in pixels.
  - `toRadius: number`: Radius of the outer circle in pixels.

**3. Conic Gradients (`type: 'conic'`)**

Creates a gradient that sweeps around a central point, like a color wheel or a radar sweep.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Gradient, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const conicGradRect = createRef<Rect>();

  view.add(
    <Rect
      ref={conicGradRect}
      width={300}
      height={300}
      fill={
        new Gradient({
          type: "conic",
          from: { x: 0.5, y: 0.5 }, // Center of the gradient (fractional)
          angle: 0, // Start angle in degrees (0 is to the right)
          stops: [
            { offset: 0, color: "red" },
            { offset: 0.25, color: "yellow" },
            { offset: 0.5, color: "green" },
            { offset: 0.75, color: "blue" },
            { offset: 1, color: "red" }, // Loop back to red for a smooth cycle
          ],
        })
      }
    />
  );
  yield;

  // Animate the angle of the conic gradient to make it spin
  // This requires the 'angle' property of the Gradient object to be a signal,
  // or tweening the fill to new Gradient objects with different angles.
  // For simplicity, let's assume we can animate a signal passed to the gradient's angle.
  // If 'angle' isn't directly animatable on an existing Gradient instance,
  // you would create a signal for the angle and a computed signal for the gradient:
  /*
  const spinAngle = createSignal(0);
  const spinningGradient = createComputed(() => new Gradient({
    type: 'conic', from: {x:0.5, y:0.5}, angle: spinAngle(), stops: [...]
  }));
  // ... fill={() => spinningGradient()} ...
  yield* spinAngle(360, 2); // Then animate the angle signal
  */
});
```

- **Key `ConicGradient` properties:**
  - `type: 'conic'`
  - `from: PossibleVector2`: The center point of the gradient. Fractional or absolute.
  - `angle: number`: The starting angle of the gradient in degrees. `0` degrees is to the right.
  - `stops` are distributed around the circle from the `angle`.

**Animating Gradients:**

Animating the properties _within_ a `Gradient` object after it's created can be complex. The typical way to "animate a gradient" is:

1.  Create a new `Gradient` object with the desired end-state properties.
2.  Animate the node's `fill` or `stroke` property from its current gradient (or color) to this new `Gradient` object.
    ```typescript
    const initialGradient = new Gradient({...});
    const finalGradient = new Gradient({...}); // Different stops, from/to points, etc.
    // ...
    // yield* myNode().fill(initialGradient);
    // yield* waitFor(1);
    // yield* myNode().fill(finalGradient, 2); // Tween to the new gradient configuration
    ```
3.  Alternatively, if the properties _inside_ the `Gradient` object (like `from`, `to`, `stops`, `angle`) are themselves signals, then animating those signals will make the gradient change reactively. This is a more advanced pattern. The `Gradient.stops` property is a signal, so you _can_ animate it.

---

### 5.5 Using Image Patterns (`<Pattern />`)

**Goal:** Learn how to fill or stroke shapes with a repeating image.

**Core Concepts Involved:** `Pattern` class, image source (`src`), repetition modes.

**The `Pattern` Class:**

Similar to `Gradient`, the `fill` and `stroke` properties can accept a `Pattern` object (from `@motion-canvas/core`).

**Basic Usage:**

Ensure your image (e.g., `texture.png`) is in the `public/` directory.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Pattern, Media } from "@motion-canvas/core";

const patternSrc = "/texture.png";

export default makeScene2D(async function* (view) {
  // Scene can be async for preload
  await Media.preload(patternSrc); // Preload the pattern image

  const patternedRect = createRef<Rect>();

  view.add(
    <Rect
      ref={patternedRect}
      width={500}
      height={300}
      fill={
        new Pattern({
          src: patternSrc,
          repetition: "repeat", // 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
          // offset: [0,0],    // Offset the pattern's origin
          // scale: 1,         // Scale the pattern image
        })
      }
      stroke={"white"}
      lineWidth={5}
    />
  );
  yield;

  // Animate pattern properties (requires them to be signals or re-assigning new Pattern)
  // If using signals within the Pattern object:
  // const patternOffset = createSignal(Vector2.zero);
  // const myPattern = new Pattern({ src: patternSrc, offset: () => patternOffset() });
  // ... fill={myPattern} ...
  // yield* patternOffset(new Vector2(50, 50), 2); // Scroll the pattern
});
```

**Key `Pattern` Properties:**

- `src: string`: Path or URL to the image to be used as the pattern.
- `repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'` (default: `'repeat'`): How the image should repeat to fill the area.
- `offset: PossibleVector2`: Offset of the pattern's origin within the shape. Can be animated for a scrolling texture effect.
- `scale: SignalValue<PossibleVector2 | number>`: Scales the pattern image before tiling.
- `rotation: SignalValue<number>`: Rotates the pattern image before tiling.

**Animating Patterns:**

Similar to gradients, to animate a pattern robustly, you typically:

1.  Create a `Pattern` object where its mutable properties (`offset`, `scale`, `rotation`) are driven by signals.
2.  Assign this reactive `Pattern` object to the `fill` or `stroke`.
3.  Animate the signals that control the pattern's properties.

```typescript
// ... imports ...
import { createSignal, Vector2 } from "@motion-canvas/core";

// ...
// const patternImageSrc = '/myPattern.png';
// await Media.preload(patternImageSrc);

const patOffset = createSignal(Vector2.zero);
const patScale = createSignal(1);

const reactivePattern = new Pattern({
  src: patternImageSrc,
  repetition: "repeat",
  offset: () => patOffset(), // Use signal getter
  scale: () => patScale(), // Use signal getter
});

// ... inside makeScene2D ...
// view.add(<Rect fill={reactivePattern} ... />);
// ...
// yield* patOffset(new Vector2(100, 0), 2); // Scrolls pattern horizontally
// yield* patScale(0.5, 1);                 // Scales pattern down
```

---

### 5.6 Understanding Transformation Matrices (`Matrix`) - A Glimpse

**Goal:** Introduce the concept that all node transformations (position, rotation, scale, skew) are internally represented and computed using 2D transformation matrices.

**Core Concepts Involved:** `Matrix` class (from `@motion-canvas/core`), affine transformations.

**What are Transformation Matrices?**

In 2D (and 3D) graphics, a matrix is a grid of numbers used to compactly represent and perform geometric transformations like translation (moving), rotation, scaling, and skewing (shearing).

- Motion Canvas uses a `Matrix` class (typically a 3x2 matrix for 2D affine transformations) to manage the spatial properties of nodes.
- When you set `node.position(new Vector2(10, 20))`, `node.rotation(45)`, or `node.scale(2)`, Motion Canvas updates the node's internal transformation matrix.
- This matrix is then used to calculate the final position of the node and its children on the screen.

**Mostly Internal for Users:**

For most common animation tasks in Motion Canvas, **you do not need to directly create or manipulate `Matrix` objects.** You interact with the more intuitive properties like `position`, `rotation`, `scale`, and `skew`.

**Accessing Node Matrices (for Advanced Users):**

Nodes expose their transformation matrices as signals, which can be useful for advanced calculations, custom components, or integrating with other systems:

- `node.localToParentMatrix(): Matrix`: A signal representing the matrix that transforms points from the node's local space to its parent's space.
- `node.localToWorldMatrix(): Matrix`: A signal representing the matrix that transforms points from the node's local space to the global world (view) space.
- `node.worldToLocalMatrix(): Matrix`: The inverse of `localToWorldMatrix`.

```typescript
// Example: (Conceptual - for advanced use)
// const myRect = createRef<Rect>();
// ... add rect ...
// yield; // ensure rect is processed

// const worldMatrix = myRect().localToWorldMatrix(); // Get the current world matrix
// console.log(worldMatrix.translation); // Access translation part
// console.log(worldMatrix.scaling);     // Access scaling part
// console.log(worldMatrix.rotation);    // Access rotation part (in degrees)
```

**Skew Transformation:**

Nodes also have `skew` (or `skewX`, `skewY`) properties, which are another type of affine transformation directly represented in the matrix.

```typescript
// yield* myRect().skewX(15, 1); // Skew horizontally by 15 degrees
// yield* myRect().skewY(-10, 1); // Skew vertically
```

**When Might You Think About Matrices?**

- Understanding how parent transformations affect children.
- Performing custom coordinate conversions not directly covered by `transformPointWorld`.
- When debugging complex layout or transformation issues.
- If you're building highly custom graphical components that need to directly manipulate transformation stacks.

For `chalchitra.py`, knowing that these matrices exist internally is good, but your Python API will primarily focus on generating code that sets the standard node properties (`position`, `rotation`, `scale`, `skew`, `fill`, `stroke`, etc.).

---

This completes our look at Gradients, Patterns, and a brief overview of Matrices. These provide a rich palette for styling and understanding the underlying mechanics of your visuals.
