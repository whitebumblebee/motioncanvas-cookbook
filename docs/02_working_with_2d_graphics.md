Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

---

## Part 2: Working with 2D Graphics 🎨

This section dives into the various 2D components Motion Canvas offers, allowing you to draw shapes, display text, lay out elements, and more. Each component is a type of `Node` and inherits common properties like `x`, `y`, `scale`, `rotation`, `opacity`, etc., which we discussed in Part 1. Here, we'll focus on their unique characteristics and properties.

---

### 2.1 Rectangles (`<Rect />`)

**Goal:** Learn to create and customize rectangles, including rounded corners and gradients.

**Core Concepts Involved:** `Rect` component, `width`, `height`, `radius`, `smoothCorners`, `fill`, `stroke`, `lineWidth`, `gradient`.

**Basic Usage:**

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myRect = createRef<Rect>();

  view.add(
    <Rect
      ref={myRect}
      width={300}
      height={150}
      fill={"#24C1E0"} // A nice teal color
      x={0}
      y={0}
    />
  );

  yield; // Display the initial state
});
```

**Explanation:**

- `import {Rect} from '@motion-canvas/2d';`: Imports the `Rect` component.
- `<Rect ... />`: Defines a rectangle.
  - `width` and `height`: Set the dimensions of the rectangle in pixels.
  - `fill`: Sets the fill color.

**Key Properties for `<Rect />`:**

- **Dimensions & Shape:**
  - `width: number`: The width of the rectangle.
  - `height: number`: The height of the rectangle.
  - `size: Vector2 | number`: Sets both width and height. If a number, it's a square. If `Vector2(w, h)`.
  - `radius: number | Vector2`: Radius for rounded corners.
    - A single number applies the same radius to all corners.
    - A `Vector2(horizontalRadius, verticalRadius)` can create elliptical corners.
    - You can also provide an array for individual corner radii: `radius={[topLeft, topRight, bottomRight, bottomLeft]}`.
  - `smoothCorners: boolean` (default: `false`): If `true`, uses a continuous curvature for rounded corners (squircle-like). Set to `false` for standard circular corners.
- **Appearance:**
  - `fill: PossibleColor`: The fill color or gradient. (More on `PossibleColor` and `Gradient` below).
  - `stroke: PossibleColor`: The color of the outline.
  - `lineWidth: number`: The width of the outline.
  - `strokeFirst: boolean` (default: `false`): If `true`, the stroke is drawn _before_ the fill. This means the fill will overlap half of the stroke. If `false`, the stroke is drawn on top of the fill, making the shape appear slightly larger by `lineWidth`.
- **Layout (inherited from `Layout` node, which `Rect` extends):**
  - `layout: boolean` (default: `false` if `Rect` is used primarily as a shape, can be `true` to use its layout capabilities for children).
  - If `layout={true}`, you can use properties like `gap`, `direction`, `alignItems`, `justifyContent`, `padding` to arrange children within the `Rect`. (More on `Layout` component later).

**Animating `<Rect />` Properties:**

```typescript
// Assuming myRect is a createRef<Rect>() and added to view

// Animate width and height
yield * myRect().width(400, 1); // Animate width to 400 over 1 second
yield * myRect().height(200, 1);

// Animate rounded corners
yield * myRect().radius(30, 0.5); // All corners to 30px radius
yield * myRect().radius([0, 20, 0, 20], 0.5); // Specific corner radii

// Animate fill color
yield * myRect().fill("lightcoral", 1);

// Animate stroke properties
yield * myRect().stroke("white", 0.5);
yield * myRect().lineWidth(10, 0.5);
```

**Advanced Usage: Gradients**

The `fill` (and `stroke`) property can accept `Gradient` objects.

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Gradient } from "@motion-canvas/core"; // Import Gradient

export default makeScene2D(function* (view) {
  const gradientRect = createRef<Rect>();

  view.add(
    <Rect
      ref={gradientRect}
      width={400}
      height={200}
      // Define a linear gradient
      fill={
        new Gradient({
          type: "linear", // 'radial' is also an option
          from: [0, -100], // Start point relative to rect's top-left (or use fractions)
          to: [0, 100], // End point relative to rect's top-left
          // fromX, fromY, toX, toY can also be used as fractions (0 to 1) of the node's size
          // from: {x: 0, y: 0}, to: {x:0, y:1} // Top to bottom gradient
          stops: [
            { offset: 0, color: "blue" }, // Start color
            { offset: 1, color: "green" }, // End color
          ],
        })
      }
    />
  );
  yield;

  // You can animate gradient properties too (more complex)
  // For example, changing stops (requires creating a new Gradient or manipulating signal props within it)
  // yield* gradientRect().fill( new Gradient({...}), 1);
});
```

**Key `Gradient` Properties:**

- `type: 'linear' | 'radial' | 'conic'`: Type of gradient.
- **For Linear:**
  - `from: Vector2 | {x: number, y: number}`: Start point. Can be pixel values or fractions (0-1 relative to node size).
  - `to: Vector2 | {x: number, y: number}`: End point.
- **For Radial:**
  - `from: Vector2 | {x: number, y: number}`: Center of the inner circle.
  - `to: Vector2 | {x: number, y: number}`: Center of the outer circle.
  - `fromRadius: number`: Radius of the inner circle.
  - `toRadius: number`: Radius of the outer circle.
- `stops: GradientStop[]`: An array of color stops.
  - `GradientStop: {offset: number, color: string}`: `offset` is from 0 (start) to 1 (end).

---

### 2.2 Circles (`<Circle />`)

**Goal:** Learn to create and customize circles and circular segments (arcs/pie charts).

**Core Concepts Involved:** `Circle` component, `size`, `startAngle`, `endAngle`, `closed`.

**Basic Usage:**

```typescript
import { makeScene2D, Circle } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myCircle = createRef<Circle>();

  view.add(
    <Circle
      ref={myCircle}
      size={200} // Diameter of the circle
      fill={"magenta"}
    />
  );
  yield;
});
```

**Explanation:**

- `size`: Defines the diameter of the circle.

**Key Properties for `<Circle />`:**

- `size: number`: The diameter of the circle. (Note: `width` and `height` properties also exist and will be equal to `size`. Setting `width` or `height` will also update `size`).
- **Arc / Segment Properties:**
  - `startAngle: number` (default: `0`): The start angle of the arc in degrees. `0` degrees is to the right (positive X-axis).
  - `endAngle: number` (default: `360`): The end angle of the arc in degrees.
  - `closed: boolean` (default: `false` when `startAngle` or `endAngle` make it an arc, otherwise `true` for a full circle): If `true` and it's an arc, lines are drawn from the ends of the arc to the circle's center, creating a pie segment.
- **Appearance:**
  - `fill: PossibleColor`
  - `stroke: PossibleColor`
  - `lineWidth: number`
  - `strokeFirst: boolean`

**Animating `<Circle />` Properties:**

```typescript
// Assuming myCircle is a createRef<Circle>() and added to view

// Animate size
yield * myCircle().size(300, 1);

// Animate to create a "pac-man" or loading animation
yield * myCircle().startAngle(45, 1);
yield * myCircle().endAngle(315, 1);
// To make it a pie segment while an arc:
// myCircle().closed(true); // Set instantly, or animate if 'closed' becomes a signal prop

// Animate fill color
yield * myCircle().fill("gold", 1);
```

**Advanced Usage: Creating Arcs and Segments**

```typescript
import { makeScene2D, Circle } from "@motion-canvas/2d";
import { createRef, all } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const pieSegment = createRef<Circle>();
  const arc = createRef<Circle>();

  view.add(
    <>
      <Circle
        ref={pieSegment}
        x={-150}
        size={200}
        fill="orange"
        startAngle={0}
        endAngle={90} // A 90-degree segment
        closed={true} // Make it a pie piece
      />
      <Circle
        ref={arc}
        x={150}
        size={200}
        stroke="cyan"
        lineWidth={10}
        startAngle={-90}
        endAngle={90} // A 180-degree arc
        // 'closed' is false by default for an arc
      />
    </>
  );
  yield;

  // Animate the pie segment opening up
  yield* pieSegment().endAngle(270, 2);

  // Animate the arc to a full circle outline
  yield* all(arc().startAngle(0, 1), arc().endAngle(360, 1));
});
```

---

### 2.3 Lines (`<Line />`)

**Goal:** Learn to draw lines and polylines, with optional arrows.

**Core Concepts Involved:** `Line` component, `points` array, `stroke`, `lineWidth`, `arrows`.

**Basic Usage:**

```typescript
import { makeScene2D, Line } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myLine = createRef<Line>();

  view.add(
    <Line
      ref={myLine}
      // Points are relative to the Line node's own x,y position
      points={[
        [-100, -50], // Start point
        [100, 50], // End point
      ]}
      stroke={"white"}
      lineWidth={8}
      // x={100} y={50} // This would shift the whole line shape
    />
  );
  yield;
});
```

**Explanation:**

- `points: Vector2[] | number[][]`: An array of points that define the line segments.
  - Each point can be a `Vector2` or a `[number, number]` array.
  - Coordinates are relative to the `Line` node's own origin (`x`, `y`).
- `stroke`: Color of the line.
- `lineWidth`: Thickness of the line.

**Key Properties for `<Line />`:**

- `points: SignalValue<PossibleVector2[]> | SignalValue<number[][]>`: The array of points defining the line segments. This is a signal, so you can animate the points themselves (e.g., for morphing lines).
- **Appearance:**
  - `stroke: PossibleColor`
  - `lineWidth: number`
  - `lineCap: CanvasLineCap` (default: `'butt'`): Style of the ends of the line (`'butt'`, `'round'`, `'square'`).
  - `lineJoin: CanvasLineJoin` (default: `'miter'`): Style of the corners where line segments meet (`'round'`, `'bevel'`, `'miter'`).
  - `lineDash: number[]`: Array describing the pattern of dashes and gaps (e.g., `[10, 5]` for 10px dash, 5px gap).
  - `lineDashOffset: number`: Offset for the start of the line dash pattern.
- **Arrows:**
  - `startArrow: boolean` (default: `false`): Whether to draw an arrow at the start of the line.
  - `endArrow: boolean` (default: `false`): Whether to draw an arrow at the end of the line.
  - `arrowSize: number` (default: `24`): The length of the arrowheads.
- `closed: boolean` (default: `false`): If `true`, a line segment is drawn from the last point back to the first point, closing the shape. If `closed={true}` and a `fill` is provided, the shape will be filled.

**Animating `<Line />` Properties:**

```typescript
// Assuming myLine is a createRef<Line>() and added to view with initial points

// Animate lineWidth
yield * myLine().lineWidth(20, 1);

// Animate line color
yield * myLine().stroke("yellow", 1);

// Animate points (morphing the line)
// Note: The number of points should ideally remain the same for smooth morphing.
yield *
  myLine().points(
    [
      [-150, 50],
      [150, -50],
    ],
    1
  );

// Toggle arrows (usually set instantly, but can be animated if part of a more complex effect)
// myLine().endArrow(true);
// yield* myLine().arrowSize(30, 0.5);
```

**Advanced Usage: Dashed Lines and Closed Shapes**

```typescript
import { makeScene2D, Line } from "@motion-canvas/2d";
import { createRef, Vector2 } from "@motion-canvas/core"; // Import Vector2

export default makeScene2D(function* (view) {
  const dashedLine = createRef<Line>();
  const triangle = createRef<Line>();

  view.add(
    <>
      <Line
        ref={dashedLine}
        points={[
          new Vector2(-200, -100), // Using Vector2 objects
          new Vector2(0, -100),
          new Vector2(0, 0),
        ]}
        stroke={"lightgreen"}
        lineWidth={6}
        lineDash={[20, 10]} // 20px dash, 10px gap
        endArrow={true}
        arrowSize={30}
      />
      <Line
        ref={triangle}
        x={150} // Position the whole triangle
        points={[
          [0, -50],
          [50, 50],
          [-50, 50],
        ]}
        closed={true} // Close the path to form a triangle
        fill={"rgba(255, 165, 0, 0.5)"} // Orange fill, semi-transparent
        stroke={"orange"}
        lineWidth={4}
      />
    </>
  );
  yield;

  // Animate the lineDashOffset to make dashes appear to move
  yield* dashedLine().lineDashOffset(100, 2).to(0, 2); // Loop this for continuous movement

  // Animate triangle fill
  yield* triangle().fill("red", 1);
});
```

---

This covers `Rect`, `Circle`, and `Line`. The amount of detail for each component means we're making good progress but also covering a lot of ground.

Would you like to **"continue"** to the next set of 2D components, which would likely include `Txt`, `Img`, and `Layout`?

---

Okay, let's continue with **Part 2: Working with 2D Graphics** in the Chalchitra Cookbook.

---

### 2.4 Text (`<Txt />`)

**Goal:** Learn how to display and style text, and animate its properties.

**Core Concepts Involved:** `Txt` component, font properties, text content, fill/stroke for text.

**Basic Usage:**

```typescript
import { makeScene2D, Txt } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myMessage = createRef<Txt>();

  view.add(
    <Txt
      ref={myMessage}
      text={"Hello, Chalchitra!"} // The string to display
      fontSize={80}
      fill={"white"}
      y={-100} // Position it
    />
  );
  yield;
});
```

**Explanation:**

- `import {Txt} from '@motion-canvas/2d';`: Imports the `Txt` component.
- `<Txt ... />`: Defines a text element.
  - `text`: The actual text content you want to show. This is a signal, so it can be updated and animated.
  - `fontSize`: The size of the font in pixels.
  - `fill`: The color of the text.

**Key Properties for `<Txt />`:**

- **Content:**
  - `text: string | SignalValue<string>`: The text to display.
  - `children`: Alternatively, you can provide text content as children: `<Txt>Some text</Txt>`. This is useful for embedding signal-driven text or `TxtSpan` components for partial styling.
- **Font Styling:**
  - `fontFamily: string`: The font family (e.g., `'Arial'`, `'Helvetica, Arial, sans-serif'`).
  - `fontSize: number`: Size of the font.
  - `fontStyle: 'normal' | 'italic' | 'oblique'`: Font style.
  - `fontWeight: number | string`: Font weight (e.g., `400` for normal, `700` for bold, or string values like `'bold'`).
  - `letterSpacing: number`: Space between characters.
  - `wordSpacing: number`: Space between words (browser support may vary).
  - `lineHeight: number | string`: The height of a line of text. Can be a unitless multiplier of `fontSize` (e.g., `1.2`), or a pixel value.
- **Appearance:**
  - `fill: PossibleColor`: The fill color of the text.
  - `stroke: PossibleColor`: The outline color of the text.
  - `lineWidth: number`: The width of the text outline.
  - `opacity: number`: Overall opacity of the text.
- **Layout & Alignment (within the Txt node's own box):**
  - `textAlign: CanvasTextAlign` (default `'left'`): Horizontal alignment (`'left'`, `'right'`, `'center'`, `'start'`, `'end'`).
  - `verticalAlign: string` (More related to `Layout` children, but for text lines, `lineHeight` and padding have more effect).
  - `textWrap: boolean | 'pre' | 'char' | 'word'` (default `true`): How text should wrap. `true` wraps by word.
  - `maxLines: number`: Maximum number of lines to display.
- **Advanced Text Layout (when Txt is a Layout):**
  - `Txt` nodes are also `Layout` nodes. If `layout={true}` is set (or if it has children like `TxtSpan`), it can use layout properties like `justifyContent`, `alignItems`, `direction`, `gap` to arrange its internal lines or `TxtSpan` children.
- **Text Selection (programmatic, for effects):**
  - `selection: SignalValue<[number, number] | TextRange[]>`: Highlights a range of text. `[ startIndex, endIndex ]`.
  - `selectionColor: PossibleColor`: The background color of the selection.
- **Clipping:**
  - `clip: boolean` (default: `false`): If true, text that extends beyond the node's `width` and `height` is clipped.

**Animating `<Txt />` Properties:**

```typescript
// Assuming myMessage is a createRef<Txt>() and added to view

// Animate the text content (letters will try to morph)
yield * myMessage().text("New Message Appears!", 1);

// Animate font size
yield * myMessage().fontSize(120, 0.5);

// Animate fill color
yield * myMessage().fill("cyan", 1);

// Animate letter spacing
yield * myMessage().letterSpacing(10, 0.75);

// Animate text selection (creates a highlight effect)
yield * myMessage().selection([0, myMessage().text().length], 1).to(0, 1); // Highlight all, then unhighlight
```

**Advanced Usage: `TxtSpan` for Partial Styling & Inline Elements**

If you need to style parts of a text string differently (e.g., one word bold, another a different color), you can use the `TxtSpan` component as a child of `Txt`. The parent `Txt` should usually have `layout` enabled (which it does by default if it has `TxtSpan` children).

```typescript
import { makeScene2D, Txt, TxtSpan } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const styledText = createRef<Txt>();

  view.add(
    <Txt ref={styledText} fontSize={60} y={50} textAlign={"center"}>
      This is {/* Note the space */}
      <TxtSpan fontWeight={700} fill={"orange"}>
        IMPORTANT
      </TxtSpan> and this is {/* Note the space */}
      <TxtSpan fontStyle={"italic"} fill={"lightblue"}>
        italic.
      </TxtSpan>
    </Txt>
  );
  yield;
});
```

- Each `TxtSpan` can have its own font properties, `fill`, `stroke`, etc.
- Spaces between `TxtSpan` elements or between text and `TxtSpan` need to be added explicitly as string literals like `{' '}` if they are direct children of `Txt`.

---

### 2.5 Images (`<Img />`)

**Goal:** Learn to display raster images (PNG, JPEG, GIF) in your animations.

**Core Concepts Involved:** `Img` component, `src` property, `width`, `height`, aspect ratio.

**Basic Usage:**

Place an image (e.g., `myImage.png`) in your project's `public/` directory. If the `public/` directory doesn't exist at the root of your `mc_runner_project` (or your main Motion Canvas project), create it. Files in `public/` are served directly.

```typescript
import { makeScene2D, Img } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

// Assuming 'logo.png' is in the 'public/' directory of your project
const imageUrl = "/logo.png"; // Path relative to the public directory

export default makeScene2D(function* (view) {
  const myImage = createRef<Img>();

  view.add(
    <Img
      ref={myImage}
      src={imageUrl}
      width={250} // You can set width, height, or both
      // height={200} // If only one is set, aspect ratio is usually maintained
      x={0}
      y={0}
    />
  );
  yield;
});
```

**Explanation:**

- `import {Img} from '@motion-canvas/2d';`: Imports the `Img` component.
- `src={imageUrl}`: Specifies the path to the image.
  - Paths starting with `/` are typically relative to the `public` directory.
  - You can also use full URLs: `src={'https://example.com/image.jpg'}`.
- `width` / `height`: You can specify `width`, `height`, or both.
  - If only one is specified, Motion Canvas usually scales the image to fit that dimension while maintaining its original aspect ratio.
  - If both are specified, the image will be stretched or squashed to fit those dimensions.

**Key Properties for `<Img />`:**

- `src: string | SignalValue<string>`: Path or URL to the image file.
- `width: number`: Desired width.
- `height: number`: Desired height.
- `size: Vector2 | number`: Sets both width and height.
- `alpha: number` (default `1`): Alpha multiplier for the image (separate from `opacity` which affects the whole node).
- `smoothing: boolean` (default `true`): Whether to apply image smoothing when scaling. Set to `false` for a pixelated look on scaled pixel art.
- `color: PossibleColor | null` (default: `null`): Tints the image with the specified color. If `null`, the image is drawn normally. This can be used for colorization effects.
- `compositeOperation: GlobalCompositeOperation`: Sets the global composite operation for drawing this image.

**Animating `<Img />` Properties:**

Standard node properties like `opacity`, `scale`, `position`, `rotation` are commonly animated.

```typescript
// Assuming myImage is a createRef<Img>() and added to view

// Fade in the image
// myImage().opacity(0); // Set initial opacity to 0
// yield* myImage().opacity(1, 1);

// Animate scale
yield * myImage().scale(1.5, 0.75);

// Animate color tint (if initially set, or if 'color' is a signal)
// To animate the tint, you'd typically animate a color signal that's passed to the 'color' prop.
// For a simple fade to a tint:
// yield* myImage().color('rgba(255,0,0,0.5)', 1); // Tint to semi-transparent red
// yield* myImage().color(null, 1); // Remove tint

// Animate src (can create a slideshow effect, though ensure images are preloaded)
// yield* myImage().src('/otherImage.png', 0.5); // Duration here might not always have visual tweening for src
```

**Important Notes on Image Loading:**

- Motion Canvas attempts to load images as they are needed.
- If you animate an image immediately upon scene load or change its `src` dynamically, there might be a brief moment where the image isn't visible if it hasn't finished loading.
- For critical images, especially in sequences, you might need to implement preloading strategies if you encounter issues. The documentation mentions `Media` class and `lazy` property which might be relevant for more control, but for basic usage, direct `src` setting is common. The `Media.preload()` method can be used to preload assets.

```typescript
import { Media } from "@motion-canvas/core";

// At the top of your scene file, or in project.ts for global assets
// await Media.preload('/important_image.png');

// Then use it in your Img node
// <Img src={'/important_image.png'} ... />
```

---

### 2.6 Layout (`<Layout />`)

**Goal:** Learn how to use the `Layout` component to arrange child nodes using a Flexbox-like system. This is one of the most powerful components for creating structured UIs and arrangements.

**Core Concepts Involved:** `Layout` component, Flexbox properties (`direction`, `alignItems`, `justifyContent`, `gap`), child layout properties (`grow`, `shrink`, `basis`).

**Basic Usage:**

The `Layout` node itself is often invisible; its purpose is to control the position and size of its children.

```typescript
import { makeScene2D, Layout, Rect, Circle } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myLayout = createRef<Layout>();

  view.add(
    <Layout
      ref={myLayout}
      // layout // This is true by default for Layout, enabling flexbox-like behavior
      direction={"row"} // Arrange children horizontally
      gap={20} // Space between children
      padding={30} // Padding inside the layout container
      width={600}
      height={200}
      fill={"rgba(50,50,50,0.3)"} // Optional: give layout a fill to see its bounds
      stroke={"white"}
      lineWidth={2}
      radius={10}
    >
      <Rect fill={"lightcoral"} width={100} height={100} />
      <Circle fill={"skyblue"} size={80} />
      <Rect fill={"lightgreen"} width={120} height={80} grow={1} />{" "}
      {/* This rect will grow */}
    </Layout>
  );
  yield;
});
```

**Explanation:**

- `import {Layout} from '@motion-canvas/2d';`: Imports the `Layout` component.
- `<Layout ... > ...children... </Layout>`: Defines a layout container.
  - `direction={'row'}`: Arranges children from left to right. Other options: `'column'`, `'row-reverse'`, `'column-reverse'`.
  - `gap={20}`: Adds a 20px space between each child.
  - `padding={30}`: Adds 30px padding on all sides inside the `Layout` container. Can also be `padding={[top, right, bottom, left]}` or `padding.top={10}` etc.
  - The children (`<Rect>`, `<Circle>`) are automatically positioned by the `Layout` component.
  - `grow={1}` on the last `Rect`: This is a child layout property. It means this rectangle will take up any available extra space along the main axis (`row` in this case).

**Key Properties for `<Layout />` (Container Properties):**

- **Enabling Layout:**
  - `layout: boolean` (default: `true` for `Layout` component, `false` for `Rect`, `Circle` etc. unless they have children or `layout` is set to true). You must set this to `true` on a generic `Node` if you want it to act as a layout container.
- **Direction & Wrapping:**
  - `direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'` (default: `'column'` for a generic `Node` with `layout={true}`, but usually you'd specify it for `Layout`).
  - `wrap: 'nowrap' | 'wrap' | 'wrap-reverse'` (default: `'nowrap'`): Whether children should wrap to the next line if they don't fit.
- **Spacing:**
  - `gap: number`: Space between all children.
  - `rowGap: number`: Space between rows (if wrapping or in a column layout).
  - `columnGap: number`: Space between columns (if wrapping or in a row layout).
- **Alignment (Main Axis - along `direction`):**
  - `justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'` (default: `'flex-start'`): How children are distributed along the main axis.
- **Alignment (Cross Axis - perpendicular to `direction`):**
  - `alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'` (default: `'stretch'`): How children are aligned along the cross axis.
  - `alignContent: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around'` (default: `'stretch'`): Aligns lines of items when there's wrapping and extra space on the cross axis.
- **Padding:**
  - `padding: number | number[]`: Padding inside the container.
  - `padding.top`, `padding.right`, `padding.bottom`, `padding.left`: Individual side padding.
- **Sizing (for the Layout node itself):**
  - `width`, `height`, `size`: As with other nodes. Can be fixed, or `'auto'`, `'min-content'`, `'max-content'`, or a percentage string like `'50%'`.

**Key Properties for Children of a `<Layout />` Container:**

These properties are set _on the child nodes_ themselves, not on the `Layout` parent.

- `grow: number` (default: `0`): How much the item should grow if there's extra space along the main axis.
- `shrink: number` (default: `1`): How much the item should shrink if there's not enough space.
- `basis: number | string | 'auto'` (default: `'auto'`): The default size of an item along the main axis before remaining space is distributed.
- `alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'` (default: `'auto'`): Overrides the parent `Layout`'s `alignItems` for this specific child.
- `margin: number | number[]`: Margin outside the child.
- `margin.top`, `margin.right`, `margin.bottom`, `margin.left`: Individual side margins.

**Animating `<Layout />` Properties (and its children's layout properties):**

Properties like `gap`, `padding`, `width`, `height` of the `Layout` node itself can be animated. Animating properties like `justifyContent` or `direction` is also possible (they'd switch to the new value over the duration).

Child layout properties like `grow` or `basis` can also be animated on the children.

```typescript
// Assuming myLayout is a createRef<Layout>() and added to view
// Assuming childRect1, childRect2 are refs to Rects inside myLayout

// Animate layout's gap
yield * myLayout().gap(50, 1);

// Animate layout's padding
yield * myLayout().padding(50, 0.5);
yield * myLayout().padding.left(10, 0.5); // Animate individual padding

// Animate a child's grow factor
// This requires 'grow' to be a signal on the child, or you re-render.
// If grow is a signal: yield* childRect1().grow(2, 1);

// If you need to animate properties that affect layout fundamentally (like a child's text changing its size),
// Motion Canvas's layout system will typically re-calculate and animate the transition.
```

**Example: Centering an Item**

A common use case is centering a single item within a `Layout` container that fills the screen or a parent.

```typescript
import { makeScene2D, Layout, Rect } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  // Make the view itself a layout container that centers its children
  view.width("100%").height("100%"); // Ensure view takes full space
  view.justifyContent("center");
  view.alignItems("center");

  const centeredRect = createRef<Rect>();

  // This Rect will be centered in the view
  view.add(<Rect ref={centeredRect} width={150} height={150} fill="crimson" />);

  yield;
});
```

_Note: The `view` object itself is a `Layout` node, so you can apply layout properties directly to it to arrange its direct children._

---

This covers `Txt`, `Img`, and the very important `Layout` component. These are fundamental for building almost any kind of scene.

Would you like to **"continue"** to explore more 2D components like `Grid`, `Path`, `Spline`, `SVG`, `Video`, and `Latex`?

---

Okay, let's continue with **Part 2: Working with 2D Graphics** in the Chalchitra Cookbook. We'll explore more specialized 2D components.

---

### 2.7 Grid (`<Grid />`)

**Goal:** Learn to draw a grid, useful for alignment, debugging layouts, or as a background element.

**Core Concepts Involved:** `Grid` component, `spacing`, `stroke`, `lineWidth`.

**Basic Usage:**

```typescript
import { makeScene2D, Grid } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myGrid = createRef<Grid>();

  view.add(
    <Grid
      ref={myGrid}
      width={"100%"} // Make grid cover the full view width
      height={"100%"} // Make grid cover the full view height
      spacing={50} // Spacing between grid lines (can be a single number or Vector2)
      stroke={"rgba(255, 255, 255, 0.2)"} // Light gray, semi-transparent lines
      lineWidth={1}
      zIndex={-1} // Send it to the background
    />
  );
  yield;
});
```

**Explanation:**

- `import {Grid} from '@motion-canvas/2d';`: Imports the `Grid` component.
- `<Grid ... />`: Defines a grid.
  - `width`, `height`: Define the overall size of the grid area. Using `'100%'` makes it fill its parent (in this case, the `view`).
  - `spacing`: The distance between grid lines. If a single number, it applies to both X and Y axes. You can use `Vector2(spacingX, spacingY)` for different spacing on each axis.
  - `stroke`: The color of the grid lines.
  - `lineWidth`: The thickness of the grid lines.
  - `zIndex={-1}`: This is a general `Node` property that positions the grid behind other elements.

**Key Properties for `<Grid />`:**

- `width: Length`
- `height: Length`
- `spacing: SignalValue<PossibleSpacing>`: The spacing between major grid lines. Can be a number (uniform), `Vector2` (for `[spacingX, spacingY]`), or a `Spacing` object.
- `stroke: SignalValue<PossibleColor>`: Color of the major grid lines.
- `lineWidth: SignalValue<number>`: Line width of the major grid lines.
- **Subdivisions (Minor Grid Lines):**
  - `subdivisions: SignalValue<PossibleSpacing>`: Number of subdivisions between major grid lines. For example, `spacing={100}` and `subdivisions={4}` would mean minor lines every 25 units.
  - `subStroke: SignalValue<PossibleColor>`: Color of the minor grid lines.
  - `subLineWidth: SignalValue<number>`: Line width of the minor grid lines.
- **Start and End:**
  - `start: SignalValue<PossibleVector2>`: The starting offset of the grid lines from the top-left corner of the grid node.
  - `end: SignalValue<PossibleVector2>`: The ending offset. Values between 0 and 1 are treated as percentages of the spacing.
- `startFromCenter: SignalValue<boolean>` (default: `false`): If `true`, the grid lines originate from the center of the `Grid` node.

**Animating `<Grid />` Properties:**

```typescript
// Assuming myGrid is a createRef<Grid>() and added to view

// Animate the spacing of the grid lines
yield * myGrid().spacing(100, 1); // Animate to 100px spacing over 1 second
yield * myGrid().spacing(new Vector2(50, 75), 1); // Animate to different X and Y spacing

// Animate the color of the grid lines
yield * myGrid().stroke("rgba(0, 255, 0, 0.5)", 1); // Animate to semi-transparent green

// Animate the lineWidth
yield * myGrid().lineWidth(3, 0.5);

// Animate the start offset to create a scrolling effect
yield * myGrid().start([0, myGrid().spacing().y], 1); // Scrolls one grid cell vertically
```

---

### 2.8 Paths (`<Path />`)

**Goal:** Learn to create complex vector shapes using SVG-like path data or programmatic commands. Paths are fundamental for custom drawings.

**Core Concepts Involved:** `Path` component, SVG path `data` string, path drawing commands (`moveTo`, `lineTo`, `curveTo`, etc.), `fill`, `stroke`.

**Basic Usage (SVG Path Data):**

You can define a path using an SVG path data string.

```typescript
import { makeScene2D, Path } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myShape = createRef<Path>();

  view.add(
    <Path
      ref={myShape}
      // SVG path data for a simple triangle
      data="M 0 -50 L 50 50 L -50 50 Z"
      fill="crimson"
      stroke="white"
      lineWidth={4}
      x={0}
      y={0}
    />
  );
  yield;
});
```

**Explanation:**

- `import {Path} from '@motion-canvas/2d';`: Imports the `Path` component.
- `data="M 0 -50 L 50 50 L -50 50 Z"`: This string contains SVG path commands:
  - `M 0 -50`: **M**ove to absolute coordinates (0, -50).
  - `L 50 50`: Draw a **L**ine to absolute coordinates (50, 50).
  - `L -50 50`: Draw another **L**ine to (-50, 50).
  - `Z`: Close the path (draw a line from the current point back to the starting point).
- The coordinates in the `data` string are relative to the `Path` node's own `x` and `y` position.

**Key Properties for `<Path />`:**

- `data: SignalValue<string>`: The SVG path data string. This is a signal, so it can be animated to morph shapes.
- `fill: SignalValue<PossibleColor>`: The fill color.
- `stroke: SignalValue<PossibleColor>`: The outline color.
- `lineWidth: SignalValue<number>`: The width of the outline.
- `lineJoin: SignalValue<CanvasLineJoin>` (default: `'miter'`): How corners where segments meet are rendered (`'round'`, `'bevel'`, `'miter'`).
- `lineCap: SignalValue<CanvasLineCap>` (default: `'butt'`): How the ends of open subpaths are rendered (`'butt'`, `'round'`, `'square'`).
- `lineDash: SignalValue<number[]>`: For creating dashed lines.
- `lineDashOffset: SignalValue<number>`: Offset for the dash pattern.
- `arrowSize`, `startArrow`, `endArrow`: For adding arrows to the path (especially if it's an open path).
- `clipPath: SignalValue<Path | Rect | Circle | null>`: Uses another shape to clip this path. (Advanced)

**Animating `<Path />` Properties:**

```typescript
// Assuming myShape is a createRef<Path>() and added to view

// Animate fill and stroke
yield * myShape().fill("blue", 1);
yield * myShape().lineWidth(8, 0.5);

// Animate the path data (shape morphing)
// For smooth morphing, the new path data should ideally have a
// compatible structure (e.g., same number and type of commands).
// Motion Canvas will attempt to interpolate between the paths.
const newPathData = "M 0 -70 L 70 70 L -70 70 Z"; // A slightly different triangle
yield * myShape().data(newPathData, 1.5);
```

**Programmatic Path Construction:**

Instead of just using an SVG `data` string, you can build paths programmatically using methods on a `Path` instance. This is often done when creating paths dynamically or from calculated points.

```typescript
import { makeScene2D, Path } from "@motion-canvas/2d";
import { createRef, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const programmaticPath = createRef<Path>();

  // Create a new Path node instance
  const pathNode = new Path({
    // Initial properties can be set here
    stroke: "cyan",
    lineWidth: 6,
  });

  // Use methods to draw
  pathNode.moveTo(new Vector2(-100, 0)); // Start point
  pathNode.lineTo(new Vector2(0, -100)); // Line to next point
  pathNode.quadraticCurveTo(new Vector2(50, -50), new Vector2(100, 0)); // Quadratic curve
  pathNode.cubicCurveTo(
    new Vector2(150, 50),
    new Vector2(50, 150),
    new Vector2(0, 100)
  ); // Cubic curve
  pathNode.arcTo(new Vector2(-100, 0), new Vector2(50, 50), false, true); // Arc
  // pathNode.close(); // Optionally close the path

  view.add(pathNode.ref(programmaticPath)); // Add to view and assign ref

  yield;

  // You can still animate its properties
  yield* programmaticPath().stroke("magenta", 1);

  // Animating a programmatically built path's structure after initial creation
  // typically involves recalculating its segments and updating the 'data' signal
  // or using specialized curve/segment animation capabilities if available.
  // For simple changes, re-running the drawing commands on a signal update or
  // directly tweening the 'data' signal generated by pathNode.data() might work.
});
```

**Path Commands (Methods on `Path` instance):**
(These methods modify the internal path data of the `Path` object)

- `moveTo(point: Vector2)`: Moves the current drawing position.
- `lineTo(point: Vector2)`: Draws a straight line to the point.
- `quadraticCurveTo(controlPoint: Vector2, to: Vector2)` or `quadTo`: Draws a quadratic Bézier curve.
- `cubicCurveTo(controlPoint1: Vector2, controlPoint2: Vector2, to: Vector2)` or `curveTo`: Draws a cubic Bézier curve.
- `arc(center: Vector2, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean = false)`: Draws an arc centered at `center`.
- `arcTo(through: Vector2, to: Vector2, radius: number | Vector2, counterclockwise: boolean = false, largeArc: boolean = false)`: Draws an arc using two points and a radius.
- `rect(position: Vector2, size: Vector2, counterclockwise: boolean = false)`: Adds a rectangle subpath.
- `circle(center: Vector2, radius: Vector2, counterclockwise: boolean = false)`: Adds a circle subpath.
- `ellipse(center: Vector2, radius: Vector2, rotation: number, startAngle: number, endAngle: number, counterclockwise: boolean = false)`: Adds an ellipse subpath.
- `close()`: Closes the current subpath by drawing a line to its start point.

Motion Canvas also provides static helper functions on the `Path` class like `Path.fromSVG`, `Path.transformPoints` etc.

---

### 2.9 Splines (`<Spline />`)

**Goal:** Learn to create smooth, curved lines that pass through a series of specified points, often using Catmull-Rom splines.

**Core Concepts Involved:** `Spline` component, `points` array (control points), `tension`, `closed`.

**Basic Usage:**

```typescript
import { makeScene2D, Spline } from "@motion-canvas/2d";
import { createRef, Vector2 } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const mySpline = createRef<Spline>();

  view.add(
    <Spline
      ref={mySpline}
      lineWidth={8}
      stroke={"lightseagreen"}
      points={[
        // The spline will pass through or near these points
        new Vector2(-300, 0),
        new Vector2(-100, -100),
        new Vector2(100, 100),
        new Vector2(300, 0),
      ]}
      // tension={0.5} // Adjusts the "tightness" of the curve (default 0.5 for Catmull-Rom)
      // closed={false} // Whether the spline should loop back to the start
    />
  );
  yield;
});
```

**Explanation:**

- `import {Spline} from '@motion-canvas/2d';`: Imports the `Spline` component.
- `points`: An array of `Vector2` points that the spline will interpolate through or near.
- Internally, `Spline` often generates a `Path` data string using algorithms like Catmull-Rom to create the smooth curve.

**Key Properties for `<Spline />`:**

- `points: SignalValue<PossibleVector2[]>`: The array of points that define the spline's path.
- `stroke: SignalValue<PossibleColor>`: Color of the spline.
- `lineWidth: SignalValue<number>`: Thickness of the spline.
- `lineCap`, `lineJoin`, `lineDash`, `lineDashOffset`: Same as for `Line` and `Path`.
- **Spline Specifics (often for Catmull-Rom type splines):**
  - `tension: SignalValue<number>` (default often `0.5`): Controls the tightness of the curve. `0` usually results in straight lines between points. `1` can create more pronounced loops.
  - `closed: SignalValue<boolean>` (default `false`): If `true`, the spline forms a closed loop.
  - `arcLength: SignalValue<boolean>` (default `false`): Enables arc length parameterization. This can be useful for effects like drawing the spline progressively or placing objects evenly along its length.
- `start`, `end`, `offset`: Properties to control how much of the spline is drawn (from 0 to 1, representing the fraction of the total length). `start=0, end=1` draws the full spline.
- `startArrow`, `endArrow`, `arrowSize`: For adding arrows.

**Animating `<Spline />` Properties:**

```typescript
// Assuming mySpline is a createRef<Spline>() and added to view

// Animate the points of the spline
yield *
  mySpline().points(
    [
      new Vector2(-300, 50),
      new Vector2(0, -150),
      new Vector2(0, 150),
      new Vector2(300, -50),
    ],
    2 // Duration
  );

// Animate the tension
yield * mySpline().tension(1, 1).to(0.2, 1); // Make it loopy, then tighter

// Animate drawing the spline (if arcLength is true, or by animating 'end')
// mySpline().arcLength(true); // Enable for smooth "draw-on" effect
yield * mySpline().end(0, 0); // Set end to 0 instantly (invisible)
yield * mySpline().end(1, 3); // Animate 'end' to 1 over 3 seconds to "draw" the spline
```

**Knots (`<Knot />`):**

Knots are often used implicitly by components like `Spline` or when you define complex `Path` segments (like Bézier curves which have control points). While you might not always instantiate `<Knot />` directly as a visible child in basic scenarios, they represent the control points that define curves.

If you were building a custom curve component or an editor for paths, you might use `Knot` nodes to represent draggable handles.
A `Knot` typically has:

- `position: SignalValue<PossibleVector2>`: Its own position.
- `startHandle: SignalValue<PossibleVector2>`: Position of its incoming Bézier handle (relative to the knot's position).
- `endHandle: SignalValue<PossibleVector2>`: Position of its outgoing Bézier handle (relative to the knot's position).

When working with `Spline` and its `points` property, each `Vector2` in the `points` array conceptually acts as a knot or a point the curve passes through. The `Spline` component handles the calculation of control points for the underlying Bézier curves based on these points and the `tension`.

---

### 2.10 SVG Images (`<SVG />`)

**Goal:** Learn to display Scalable Vector Graphics (SVG) files or inline SVG code.

**Core Concepts Involved:** `SVG` component, `src` property (for files), `svg` property (for inline code).

**Basic Usage (External File):**

Place an SVG file (e.g., `icon.svg`) in your project's `public/` directory.

```typescript
import { makeScene2D, SVG } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

const svgUrl = "/icon.svg"; // Path relative to the public directory

export default makeScene2D(function* (view) {
  const myIcon = createRef<SVG>();

  view.add(
    <SVG
      ref={myIcon}
      src={svgUrl}
      width={150}
      // height={150} // Optional, maintains aspect ratio if one is set
    />
  );
  yield;
});
```

**Basic Usage (Inline SVG Code):**

```typescript
import { makeScene2D, SVG } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

const inlineSvgCode = `
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
  </svg>
`;

export default makeScene2D(function* (view) {
  const myInlineSvg = createRef<SVG>();

  view.add(<SVG ref={myInlineSvg} svg={inlineSvgCode} width={200} />);
  yield;
});
```

**Explanation:**

- `src={svgUrl}`: Loads an SVG from an external file.
- `svg={inlineSvgCode}`: Renders SVG code provided as a string.
- `width`, `height`: Define the display size of the SVG. Motion Canvas will scale the SVG to fit these dimensions, usually respecting its `viewBox` attribute for aspect ratio.

**Key Properties for `<SVG />`:**

- `src: SignalValue<string>`: Path or URL to an external `.svg` file.
- `svg: SignalValue<string>`: A string containing the SVG code.
- `width: SignalValue<Length>`
- `height: SignalValue<Length>`
- `size: SignalValue<PossibleVector2 | number>`
- `smoothing: boolean` (default `true`): Image smoothing for the rendered SVG.
- `color: SignalValue<PossibleColor | null>` (default `null`): Tints the entire SVG. This works by replacing the `currentColor` value within the SVG. If your SVG paths use `fill="currentColor"` or `stroke="currentColor"`, they will adopt this color.
- `options: SVGProps['options']`: Advanced options for rendering.

**Animating `<SVG />` Properties:**

Standard node properties (`opacity`, `scale`, `position`, `rotation`) are animatable.

```typescript
// Assuming myIcon is a createRef<SVG>() and added to view

yield * myIcon().scale(2, 1);
yield * myIcon().opacity(0, 0.5).to(1, 0.5); // Fade out then in

// Animating the 'svg' or 'src' property will cause it to re-render the new SVG.
// This can be used for replacing the SVG content.
const newSvgData =
  '<svg viewBox="0 0 50 50"><rect width="50" height="50" fill="blue"/></svg>';
yield * myIcon().svg(newSvgData, 0.2); // Duration might affect fade between SVGs if supported
```

**Interaction with SVG Content:**

- **Single Path SVGs:** If an SVG file or string contains only a single `<path>` element, the `<SVG>` node behaves much like a `<Path>` node. You might be able to animate its `fill`, `stroke` directly if these are not hardcoded in the SVG path itself but set to `currentColor` or inherited.
- **Multi-Element SVGs:** If the SVG contains multiple shapes, the `<SVG>` node acts more like a `Layout` or `Img` node. The internal structure of the SVG is generally preserved. Animating individual elements _within_ the SVG from Motion Canvas usually requires more advanced techniques (like modifying the `svg` string itself or breaking the SVG into multiple Motion Canvas nodes).
- **Using `currentColor`:** For best results when trying to control colors of an SVG via the `color` prop or `fill`/`stroke` (if it's a single path), ensure your SVG elements use `fill="currentColor"` and `stroke="currentColor"`.

---

This covers `Grid`, `Path`, `Spline`, and `SVG`. These are powerful tools for creating detailed vector graphics.

Would you like to **"continue"** to cover `Video` and `Latex` components, and then move into more about animation principles like Timing Functions and advanced Flow Control?

---

Okay, let's continue with **Part 2: Working with 2D Graphics** in the Chalchitra Cookbook.

---

### 2.11 Video (`<Video />`)

**Goal:** Learn how to embed and control video playback within your animations.

**Core Concepts Involved:** `Video` component, `src` property, playback control methods (`play`, `pause`, `seek`), playback signals (`time`, `playing`, `duration`).

**Basic Usage:**

Place a video file (e.g., `myMovie.mp4`) in your project's `public/` directory.

```typescript
import { makeScene2D, Video } from "@motion-canvas/2d";
import { createRef, waitFor, Media } from "@motion-canvas/core";

// It's good practice to preload video assets
const videoSrc = "/myMovie.mp4"; // Path relative to the public directory
// Preload the video at the module level or in an async bootstrapping function
// For this example, we'll assume it's preloaded or loading is handled.
// You can await Media.preload(videoSrc); before the scene starts if needed.

export default makeScene2D(function* (view) {
  const myVideo = createRef<Video>();

  // Preload within the scene if not done globally
  // yield Media.waitForAssets(); // Use if you have Media.preload calls earlier

  view.add(
    <Video
      ref={myVideo}
      src={videoSrc}
      width={640} // Set desired display width
      // height={360} // Optionally set height; aspect ratio is usually kept
      play={false} // Start paused
      loop={true} // Loop the video
    />
  );

  yield* waitFor(1); // Wait a second

  // Start playing the video
  yield* myVideo().play();

  yield* waitFor(5); // Let it play for 5 seconds

  // Pause the video
  myVideo().pause(); // Pause instantly

  yield* waitFor(1);

  // Seek to a specific time (in seconds) and then play
  yield* myVideo().seek(10, 0.5); // Seek to 10s over 0.5s (seek itself can be animated)
  myVideo().play(); // Resume play

  yield* waitFor(5);
});
```

**Explanation:**

- `import {Video} from '@motion-canvas/2d';`: Imports the `Video` component.
- `src={videoSrc}`: Specifies the path to the video file.
- `play={false}`: The `play` property is a signal. Setting it to `true` starts playback, `false` pauses it.
- `myVideo().play()`: A method to start playback. This is equivalent to `myVideo().playing(true)`.
- `myVideo().pause()`: A method to pause playback. This is equivalent to `myVideo().playing(false)`.
- `myVideo().seek(10, 0.5)`: A method to jump to a specific time in the video (10 seconds here). The second argument is the duration of the seek animation itself.

**Key Properties and Methods for `<Video />`:**

- **Source & Dimensions:**
  - `src: SignalValue<string>`: Path or URL to the video file.
  - `width: SignalValue<Length>`
  - `height: SignalValue<Length>`
  - `size: SignalValue<PossibleVector2 | number>`
  - `smoothing: SignalValue<boolean>` (default `true`): Image smoothing for video scaling.
  - `alpha: SignalValue<number>` (default `1`): Alpha multiplier for the video content.
- **Playback Control (as Props/Signals):**
  - `playing: SignalValue<boolean>` (default `false`): Whether the video is currently playing. Setting this signal controls playback.
  - `loop: SignalValue<boolean>` (default `false`): Whether the video should loop.
  - `time: SignalValue<number>` (default `0`): The current playback time in seconds. Can be set to seek, or read to get current time. Animating this directly results in scrubbing.
  - `playbackRate: SignalValue<number>` (default `1`): The playback speed (e.g., `0.5` for half speed, `2` for double speed).
  - `volume: SignalValue<number>` (default `1`): Volume from `0` (mute) to `1` (full volume).
- **Read-only Playback Information (as Signals):**
  - `duration(): number`: The total duration of the video in seconds (read-only signal).
  - `ended(): boolean`: True if the video has reached its end (read-only signal).
  - `buffered(): TimeRanges`: The time ranges of the video that have been buffered.
  - `isSeekable(): boolean`: Whether the video is seekable.
- **Playback Control (as Methods):**
  - `play(): Promise<void>`: Starts playback. Returns a promise that resolves when playback begins.
  - `pause(): Promise<void>`: Pauses playback. Returns a promise that resolves when playback is paused.
  - `seek(time: number, duration?: number): ThreadGenerator`: Jumps to a specific time. Can be animated over a `duration`.
  - `reset(defaultTime: number = 0)`: Resets the video state, including time.

**Animating `<Video />` Properties & Controlling Playback:**

Standard node properties (`opacity`, `scale`, `position`, `rotation`) are animatable.

```typescript
// Assuming myVideo is a createRef<Video>() and added to view and preloaded

// Fade in video
myVideo().opacity(0);
yield * myVideo().opacity(1, 0.5);

// Start playing
yield * myVideo().play();

// Wait for 3 seconds of playback
yield * waitFor(3);

// Animate volume down to mute while it's playing
yield * myVideo().volume(0, 1);

yield * waitFor(2);

// Animate playback rate to slow motion
yield * myVideo().playbackRate(0.25, 0.5);

yield * waitFor(3); // Watch in slow-mo

// Reset and play again from beginning at normal speed
myVideo().reset();
myVideo().playbackRate(1);
myVideo().volume(1);
yield * myVideo().play();
```

**Preloading Video:**

For smoother playback, especially at the beginning of scenes, preload your video files.

```typescript
import { Media } from "@motion-canvas/core";

const videoSrc = "/myImportantVideo.mp4";

// Option 1: Preload at the module level (before any scene starts)
// This is an async operation, so it needs to be handled appropriately,
// often in a bootstrap file or by ensuring your main render awaits it.
// await Media.preload(videoSrc);

export default makeScene2D(async function* (view) {
  // Scene can be async for preloading
  // Option 2: Preload at the start of the scene
  yield* Media.waitForAssets(async () => {
    // Or simply: await Media.preload(videoSrc);
    Media.preload(videoSrc);
  });
  // OR if using the player's loading screen:
  // view.player.debug(). અહીં લોડરને દૃશ્યમાન કરો.
  // yield view.player.waitFor όλες સંપત્તિઓ;

  const myVideo = createRef<Video>();
  view.add(<Video ref={myVideo} src={videoSrc} width={720} />);
  // ... rest of your scene
  yield* myVideo().play();
  yield* waitFor(5);
});
```

The `Media.waitForAssets()` helper can be used to pause execution until assets are ready. The documentation also hints at player-level progress tracking.

---

### 2.12 LaTeX (`<Latex />`)

**Goal:** Learn to render and animate mathematical expressions written in LaTeX.

**Core Concepts Involved:** `Latex` component, `tex` property, KaTeX rendering.

**Basic Usage:**

Motion Canvas uses a version of KaTeX to render LaTeX.

```typescript
import { makeScene2D, Latex } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myFormula = createRef<Latex>();

  view.add(
    <Latex
      ref={myFormula}
      // The LaTeX code string
      tex={String.raw`\mathcal{L} = \int_{t_1}^{t_2} L(q, \dot{q}, t) dt`}
      // Desired height for the rendered LaTeX (width will scale proportionally)
      height={100} // Or use 'width'
      // You can also use 'scale' to control the rendering quality/size more directly
      // scale={1} // Default. Higher values = better quality but slower render.
      // fill={'white'} // Default text color is white, can be changed
    />
  );
  yield;
});
```

**Explanation:**

- `import {Latex} from '@motion-canvas/2d';`: Imports the `Latex` component.
- `tex={String.raw\`...\`}`: The `tex`property takes a string of LaTeX code.`String.raw` is useful to avoid issues with backslashes in JavaScript strings.
- `height={100}`: You typically set either `width` or `height` for the rendered LaTeX. The other dimension will scale to maintain the aspect ratio of the rendered expression.
- The `fill` property (inherited from `Shape`) can be used to set the color of the LaTeX text, though it's often white by default.

**Key Properties for `<Latex />`:**

- `tex: SignalValue<string>`: The LaTeX source string.
- `renderProps: SignalValue<Partial<TextConfig>>`: Provides advanced control over how the text is rendered to an intermediate canvas before being displayed (e.g., `scale` for resolution, `text`, `font`).
- `options: SignalValue<katex.KatexOptions>`: Allows passing KaTeX-specific options directly to the KaTeX renderer. This is powerful for advanced customization like defining custom macros or setting error handling.
  - Example: `options={{macros: {'\\RR': '\\mathbb{R}'}}}`
- `width: SignalValue<Length>`: Desired display width.
- `height: SignalValue<Length>`: Desired display height.
- `size: SignalValue<PossibleVector2 | number>`
- `textColor: SignalValue<PossibleColor>`: An explicit property to set the color of the rendered LaTeX. This often overrides the `fill` property for the text color itself.
- `scale: number` (within `renderProps` or as a direct prop affecting render quality): This is distinct from the node's transform `scale`. It controls the resolution at which the LaTeX is rendered to an internal texture. Higher values give crisper text, especially when scaled up, but can impact performance.

**Animating `<Latex />` Properties:**

The most common animation is changing the `tex` property, which Motion Canvas will try to diff and animate smoothly.

```typescript
// Assuming myFormula is a createRef<Latex>() and added to view

// Animate the LaTeX expression
yield * myFormula().tex(String.raw`E = mc^2`, 1.5); // Morph to new formula over 1.5s
yield * waitFor(1);
yield *
  myFormula().tex(
    String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`,
    2
  );

// Animate textColor (if textColor is a signal or if fill works for text color)
yield * myFormula().textColor("cyan", 1);

// Animate overall scale and position as with any node
yield * myFormula().scale(1.5, 1);
yield * myFormula().position.y(-50, 1);
```

**How it Works (KaTeX):**

- Motion Canvas uses KaTeX (or a similar library) under the hood to parse your LaTeX string and render it into a drawable format (likely an image or vector paths internally).
- This means the LaTeX support is generally limited to what KaTeX supports. Most common math symbols, structures, and environments should work. For very complex packages or custom LaTeX setups, it might have limitations.

**Using `options` for KaTeX:**

```typescript
import { makeScene2D, Latex } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const customMacroFormula = createRef<Latex>();

  view.add(
    <Latex
      ref={customMacroFormula}
      tex={String.raw`\myvec{v} = \begin{pmatrix} x \\ y \end{pmatrix}`}
      height={120}
      options={{
        // Pass KaTeX options
        macros: {
          "\\myvec": "\\mathbf{#1}", // Define a custom macro \myvec{arg}
        },
        // displayMode: true, // Render in display style (like $$...$$)
        // throwOnError: false, // Don't throw error, render error message instead
      }}
      textColor={"lightgreen"}
    />
  );
  yield;
});
```

- Consult the KaTeX documentation for available options that can be passed via the `options` prop.

---

This concludes our exploration of `Video` and `Latex`. We've now covered a significant range of the 2D components available in Motion Canvas.
