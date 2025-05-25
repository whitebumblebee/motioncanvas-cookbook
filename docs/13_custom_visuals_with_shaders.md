Okay, let's dive into the visually powerful world of shaders with **Part 13** of the Chalchitra Cookbook.

---

## Part 13: Custom Visuals with Shaders 🌌

Shaders allow you to go beyond standard component properties and create highly custom visual effects, procedural textures, and advanced graphical manipulations directly on the GPU. This section introduces how to use GLSL shaders with your 2D nodes in Motion Canvas.

---

### 13.1 What are Shaders? (A Brief Introduction)

**Goal:** Understand the basic concept of shaders and their role in graphics rendering.

**What are Shaders?**

- **Small Programs for the GPU:** Shaders are small programs that run directly on your graphics processing unit (GPU). Because the GPU is designed for massively parallel computations, shaders are incredibly fast at processing pixels and vertices.
- **GLSL (OpenGL Shading Language):** Shaders in Motion Canvas (and generally in WebGL contexts) are written in GLSL, a C-like language.
- **Two Main Types for 2D:**
  1.  **Vertex Shader:** This program runs for each vertex (corner point) of a shape. Its primary job is to calculate the final screen position of each vertex. For most 2D work in Motion Canvas, the default vertex shader is often sufficient.
  2.  **Fragment Shader (or Pixel Shader):** This program runs for each pixel that a shape covers on the screen. Its primary job is to determine the final color of that pixel. This is where most custom 2D visual effects are created.
- **How Motion Canvas Uses Them:** You can apply custom shaders to standard 2D nodes (`Rect`, `Img`, `Circle`, `Path`, `Video`) to override or modify how they are drawn.

---

### 13.2 Applying Shaders to 2D Nodes

**Goal:** Learn how to attach a custom shader (primarily a fragment shader) to a Motion Canvas 2D node.

**Core Concepts Involved:** `shaders` property on nodes, `ShaderConfig` object, GLSL code as strings.

**The `shaders` Property:**

Many 2D nodes in Motion Canvas have a `shaders` property. This property can accept:

- A single `ShaderConfig` object.
- An array of `ShaderConfig` objects for multi-pass shader effects (more advanced).

A `ShaderConfig` object typically specifies the GLSL code for the fragment shader and optionally the vertex shader, along with any uniforms (data passed from your scene to the shader).

**Basic Example: Applying a Simple Fragment Shader to a Rectangle**

```typescript
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, Vector2 } from "@motion-canvas/core";

// GLSL code for our fragment shader (as a string)
const simpleColorShiftFragmentShader = `
  precision mediump float; // Standard precision declaration

  uniform vec2 u_resolution; // Will be provided by Motion Canvas (size of the Rect)
  uniform float u_time;      // Will be provided if WebGLPlugin is active or by passing a signal

  void main() {
    // Calculate normalized coordinates (from 0.0 to 1.0)
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Create a color based on normalized coordinates and time
    float r = st.x;
    float g = st.y;
    float b = abs(sin(u_time * 0.5)); // Time-varying blue component

    gl_FragColor = vec4(r, g, b, 1.0); // Output color: RGBA
  }
`;

export default makeScene2D(function* (view) {
  const shaderRect = createRef<Rect>();

  // Make sure WebGLPlugin is enabled in project.ts for u_time to be consistently available
  // or pass time as a custom uniform.
  // For this example, assume u_time is available or will be passed.

  view.add(
    <Rect
      ref={shaderRect}
      width={400}
      height={300}
      // Instead of a 'fill', the shader will determine the color.
      // You might still want a fill if your shader is semi-transparent or blends.
      shaders={{
        fragment: simpleColorShiftFragmentShader,
        // vertex: customVertexShader, // Optional: custom vertex shader
        uniforms: {
          // We'll explicitly pass time for this example
          u_time: () => view.time(),
        },
      }}
    />
  );

  // The rectangle will now be filled by the output of the fragment shader.
  yield; // Hold for initial display

  // If you want to see the u_time effect, you need the scene to progress.
  // For example, in a loop or with a long waitFor.
  // yield* waitFor(10); // Let time progress
});
```

**Explanation:**

- `simpleColorShiftFragmentShader`: A string containing the GLSL code for the fragment shader.
- `shaders={{ ... }}`: The `shaders` property on the `<Rect />` component is assigned a `ShaderConfig` object.
  - `fragment: simpleColorShiftFragmentShader`: Specifies the fragment shader code.
  - `uniforms: { u_time: () => view.time() }`: This is how you pass data from your Motion Canvas scene to the shader (more on this in section 13.4). Here, we're making the shader's `u_time` uniform track the scene's current time.

**Default Vertex Shader:**
If you don't provide a `vertex` shader in the `ShaderConfig`, Motion Canvas typically uses a default one that handles basic 2D transformations and passes texture coordinates (UVs) to the fragment shader. This is usually sufficient for most 2D effects.

---

### 13.3 Writing GLSL Shaders (Basics for Fragment Shaders)

**Goal:** Understand the fundamental syntax and built-in variables used in GLSL fragment shaders for 2D effects in Motion Canvas.

**Fragment Shader Structure:**

```glsl
// 1. Precision (standard boilerplate)
precision mediump float; // Or highp for more precision, lowp for less

// 2. Uniforms (data passed from your Motion Canvas scene)
// uniform vec2 u_resolution; // Example: size of the element
// uniform float u_time;       // Example: current time
// uniform sampler2D u_sprite; // Example: original texture of the node

// 3. Varyings (data passed from vertex shader to fragment shader - less common to define custom ones for simple 2D effects)
// varying vec2 v_uv; // Example: texture coordinates

// 4. Main function (executed for every pixel)
void main() {
  // Your calculations go here

  // Output the final color for the current pixel
  gl_FragColor = vec4(red, green, blue, alpha); // RGBA values between 0.0 and 1.0
}
```

**Key GLSL Concepts & Built-in Variables (Fragment Shader):**

- **`precision mediump float;`**: Sets the default precision for floating-point numbers. `mediump` is common.
- **`void main() { ... }`**: The entry point of the shader. This code runs for every pixel the shape covers.
- **`gl_FragCoord` (`vec4`)**: A built-in input variable containing the window-relative coordinates of the current pixel. `gl_FragCoord.xy` gives the (x, y) pixel coordinates. The origin `(0,0)` is typically the bottom-left of the canvas/element being rendered.
- **`gl_FragColor` (`vec4`)**: The built-in output variable. You must assign a `vec4` (Red, Green, Blue, Alpha) to it, where each component is typically between `0.0` and `1.0`.
- **Data Types:**
  - `float`: A single floating-point number (e.g., `1.0`, `0.5`).
  - `int`: A single integer.
  - `bool`: `true` or `false`.
  - `vec2`: A 2D vector (e.g., `vec2(1.0, 0.5)`). Has `.x`, `.y` (or `.s`, `.t` for texture coordinates).
  - `vec3`: A 3D vector (e.g., `vec3(r, g, b)`). Has `.x, .y, .z` or `.r, .g, .b`.
  - `vec4`: A 4D vector (e.g., `vec4(r, g, b, a)`). Has `.x, .y, .z, .w` or `.r, .g, .b, .a`.
  - `mat2, mat3, mat4`: Matrices for transformations.
  - `sampler2D`: Represents a 2D texture/image.
- **Functions:** GLSL has many built-in math functions like `sin()`, `cos()`, `abs()`, `mod()`, `mix()` (for linear interpolation), `clamp()`, `length()`, `normalize()`, `texture2D()`, etc.
- **Coordinate Systems & Normalization:**
  It's very common to normalize pixel coordinates to a `0.0` to `1.0` range:
  ```glsl
  uniform vec2 u_resolution; // Provided by Motion Canvas: width & height of the node
  // ... in main() ...
  vec2 st = gl_FragCoord.xy / u_resolution.xy; // st.x and st.y now go from 0.0 to 1.0
  ```
  This `st` variable (screen texture coordinates) is then used for many procedural patterns.

---

### 13.4 Uniforms: Passing Data to Shaders

**Goal:** Learn how to send dynamic data (like time, colors, positions, or textures) from your Motion Canvas TypeScript scene to your GLSL shaders.

**Core Concepts Involved:** `uniform` keyword in GLSL, `uniforms` object in `ShaderConfig`, mapping TypeScript values/signals to GLSL uniforms.

**1. Declaring Uniforms in GLSL:**

In your shader code, you declare uniforms with the `uniform` keyword followed by their type and name. These are global variables whose values are passed in from your Motion Canvas application.

```glsl
// In your fragment shader
uniform float u_time;        // A float for time
uniform vec2 u_mouse_pos;    // A vec2 for mouse position (if you pass it)
uniform vec4 u_custom_color; // A vec4 for a color
uniform sampler2D u_my_texture; // A sampler for a texture
```

The `u_` prefix is a common convention for uniform names but not strictly required.

**2. Passing Uniforms from Motion Canvas (`ShaderConfig`):**

In the `ShaderConfig` object that you assign to a node's `shaders` property, you use the `uniforms` field. This field is an object where keys are the uniform names (matching those in your GLSL code) and values are the data you want to pass.

```typescript
// In your scene.tsx file
import { makeScene2D, Rect, Img } from "@motion-canvas/2d";
import {
  createRef,
  createSignal,
  Color,
  Vector2,
  Media,
} from "@motion-canvas/core";

const myTexturePath = "/my_image.png"; // In public/

// GLSL Shader code (example)
const myEffectShader = `
  precision mediump float;
  uniform float u_time;
  uniform vec4 u_highlightColor;
  uniform vec2 u_centerPos;
  uniform sampler2D u_bgTexture;

  varying vec2 v_uv; // Texture coordinates from default vertex shader

  void main() {
    float distanceToCenter = length(v_uv - u_centerPos); // v_uv is 0-1
    vec4 bgColor = texture2D(u_bgTexture, v_uv);
    float pulse = abs(sin(u_time * 2.0 + distanceToCenter * 10.0));
    gl_FragColor = mix(bgColor, u_highlightColor, pulse * 0.5);
  }
`;

export default makeScene2D(async function* (view) {
  await Media.preload(myTexturePath); // Preload texture

  const shaderRect = createRef<Rect>();
  const highlightColorSignal = createSignal(new Color("yellow").alpha(0.7));
  const centerPosSignal = createSignal(new Vector2(0.5, 0.5)); // Center of the rect (0-1 range for UV)

  view.add(
    <Rect
      ref={shaderRect}
      width={500}
      height={400}
      shaders={{
        fragment: myEffectShader,
        // Default vertex shader passes 'v_uv' (normalized texture/node coordinates)
        uniforms: {
          // Pass scene time (Motion Canvas usually provides this if WebGLPlugin is active,
          // but explicit passing is clearer)
          u_time: () => view.time(),

          // Pass a ColorSignal, Motion Canvas converts Color objects to vec4 (r,g,b,a) normalized to 0-1
          u_highlightColor: highlightColorSignal,

          // Pass a Vector2Signal, Motion Canvas converts Vector2 to vec2
          u_centerPos: centerPosSignal,

          // Pass an image path or Img node for sampler2D
          u_bgTexture: myTexturePath,
          // Or: u_bgTexture: myImageNodeRef, (if myImageNodeRef is a ref to an Img node)
        },
      }}
    />
  );

  yield* highlightColorSignal(new Color("cyan").alpha(0.8), 2); // Animate the uniform color
  yield* centerPosSignal(new Vector2(0.2, 0.8), 3); // Animate the uniform position
});
```

**How Motion Canvas Handles Uniform Values:**

- **Numbers (`float`, `int`):** Pass directly.
- **`Vector2`, `Vector3`, `Vector4` (`vec2`, `vec3`, `vec4`):** Motion Canvas `Vector` objects are converted. Arrays like `[0.1, 0.2]` also work.
- **`Color` (`vec3` or `vec4`):** `Color` objects are converted. The shader receives RGBA values normalized to `0.0-1.0`.
- **`Matrix` (`mat2`, `mat3`, `mat4`):** Motion Canvas `Matrix` objects are converted.
- **Images/Textures (`sampler2D`):**
  - Provide a string path (relative to `public/`) to an image file.
  - Or, pass a reference to an `<Img />` or `<Video />` node (`myImageNodeRef`). Motion Canvas will use its texture.
- **Signals:** If you pass a Motion Canvas signal as a uniform value, the shader will automatically receive the updated value whenever the signal changes. This makes uniforms reactive.
- **Functions:** If you pass a function `() => value`, it will be called each frame to get the current value for the uniform.

---

This covers the basics of applying shaders and passing data to them via uniforms. This is a very powerful way to create unique visuals.

---

You're right to ask – "exhaustive" is a big goal, and Motion Canvas has a lot of depth! We've covered a tremendous amount, from the very basics to custom components and introductory shaders.

Think of it like a comprehensive culinary school course: we've gone through knife skills, basic ingredients, different cooking methods, and even how to plate some complex dishes. There are still some specialized techniques and advanced pantry items to explore to truly say we've "covered everything" for someone wanting to build `chalchitra.py` with full understanding.

For this "continue," let's finish our deep dive into **Part 13: Custom Visuals with Shaders 🌌**. We were just getting into the data you can send _to_ shaders (uniforms). Now let's see what Motion Canvas often provides _by default_ and explore textures more.

---

### 13.5 Built-in Uniforms & Variables (in Shaders)

**Goal:** Be aware of common uniforms and varying variables that Motion Canvas (often via its default shaders or the `WebGLPlugin`) makes available to your custom GLSL shaders.

While you define most uniforms yourself, Motion Canvas often provides some standard ones, especially when you _don't_ supply your own vertex shader.

**Common Built-in Uniforms (available in Fragment Shader if not overridden):**

- **`uniform vec2 u_resolution;`**:
  - The width and height of the node being rendered, in pixels.
  - Essential for normalizing coordinates (e.g., `vec2 st = gl_FragCoord.xy / u_resolution;`).
- **`uniform float u_time;`**:
  - The current scene time in seconds. This is incredibly useful for animations driven directly within the shader.
  - Its availability and continuous update often depend on the `WebGLPlugin` being active in your project or specific configurations. If you pass `u_time: () => view.time()` in your `ShaderConfig`, you ensure it's there.
- **`uniform sampler2D u_sprite;`**:
  - This is crucial. It represents the **original rendered texture** of the node _before_ your custom shader is applied.
  - For an `<Img />` or `<Video />` node, this is the image/video frame.
  - For a `<Rect />` or `<Circle />`, this is the rasterized shape with its `fill`, `stroke`, etc.
  - Your fragment shader can sample from `u_sprite` to read the node's original pixels and then modify them. This allows you to create effects that enhance or distort the node's default appearance rather than completely replacing it.
- **`uniform float u_pixel_ratio;`**:
  - The display's pixel ratio (e.g., `1.0`, `2.0` for Retina). Useful if you need to do pixel-perfect calculations that account for display density.

**Common Varying Variables (passed from Vertex to Fragment Shader):**

When you use the default vertex shader provided by Motion Canvas (i.e., you only specify a `fragment` shader in your `ShaderConfig`), these "varying" variables are typically calculated by the vertex shader and interpolated for each pixel for your fragment shader to use:

- **`varying vec2 v_uv;`**:
  - These are the **normalized texture coordinates** for the current pixel, ranging from `(0,0)` (often bottom-left or top-left depending on convention) to `(1,1)` (opposite corner) across the surface of the node.
  - Use `v_uv` to sample from textures like `u_sprite`: `vec4 originalColor = texture2D(u_sprite, v_uv);`
- **`varying vec4 v_color_overlay;`**:
  - This might carry a color overlay or tint that the vertex shader calculated, which you can then incorporate. (Less common for simple fragment shaders that fully define color).
- **`varying vec2 v_world_space_normal;`** (More relevant for 3D, but might appear)
- **`varying vec3 v_world_space_position;`** (More relevant for 3D)

**Example using `u_sprite` and `v_uv`:**

```glsl
// Fragment Shader to desaturate the original node texture
precision mediump float;

uniform sampler2D u_sprite; // Original texture of the node
varying vec2 v_uv;          // Texture coordinates (0-1 range)
uniform float u_desaturation_amount; // A custom uniform (0 to 1)

void main() {
  vec4 originalColor = texture2D(u_sprite, v_uv);
  float gray = dot(originalColor.rgb, vec3(0.299, 0.587, 0.114)); // Calculate grayscale
  vec3 desaturatedColor = mix(originalColor.rgb, vec3(gray), u_desaturation_amount);
  gl_FragColor = vec4(desaturatedColor, originalColor.a);
}
```

In your `ShaderConfig`:

```typescript
// ...
shaders={{
  fragment: desaturationShaderCode,
  uniforms: {
    u_desaturation_amount: myDesaturationSignal, // A signal from 0 to 1
    // u_sprite is automatically passed if you apply this to a node like Img/Rect
  }
}}
// ...
```

---

### 13.6 Texture Mapping (`sampler2D`) in Detail

**Goal:** Understand how to use images as textures within your shaders for effects, mapping, or procedural generation.

**Core Concepts Involved:** `sampler2D` uniform type, `texture2D()` GLSL function, UV coordinates (`v_uv`).

**1. Passing Textures to Shaders:**

As seen in the `uniforms` section (13.4), you can pass textures to your shader:

- **From an image file path:**
  ```typescript
  // ShaderConfig uniforms
  uniforms: {
    u_myTexture: '/path/to/my_image.png', // In public/
    u_anotherTexture: '/other_texture.jpg',
  }
  ```
- **From an `<Img />` or `<Video />` node reference:**
  ```typescript
  // const imageNode = createRef<Img>();
  // view.add(<Img ref={imageNode} src={'/my_image.png'}/>);
  // ...
  // ShaderConfig uniforms
  uniforms: {
    u_myTexture: imageNode, // Pass the ref
  }
  ```
  Motion Canvas will load the image and make it available to the shader as a `sampler2D`. Remember to `await Media.preload()` for image paths.

**2. Sampling Textures in GLSL:**

The `texture2D(sampler, uv_coordinates)` function is used to read a color value (texel) from a texture at a given UV coordinate.

```glsl
precision mediump float;

uniform sampler2D u_myTexture;
uniform sampler2D u_displacementMap; // Another texture for displacement
uniform float u_time;

varying vec2 v_uv; // Normalized UV coords (0-1) from vertex shader

void main() {
  // Simple texture lookup
  vec4 texColor = texture2D(u_myTexture, v_uv);

  // UV manipulation for effects:
  // 1. Tiling:
  vec2 tiled_uv = fract(v_uv * 4.0); // Repeats the texture 4x4 times

  // 2. Scrolling:
  vec2 scrolled_uv = vec2(v_uv.x + u_time * 0.1, v_uv.y);

  // 3. Displacement mapping:
  // Read a value from displacementMap (e.g., its red channel)
  float displacementStrength = texture2D(u_displacementMap, v_uv).r * 0.1;
  vec2 displaced_uv = v_uv + vec2(displacementStrength);

  // Sample the main texture with modified UVs
  vec4 finalColor = texture2D(u_myTexture, displaced_uv);

  gl_FragColor = finalColor;
  // gl_FragColor = texColor; // Or just the original sample
}
```

**Explanation of UV Manipulation:**

- **`v_uv`**: These are your primary tool for deciding _which part_ of the texture to read for the current pixel. They usually range from (0,0) at one corner to (1,1) at the opposite.
- **Tiling (`fract(v_uv * scale)`):** `fract()` gives the fractional part. Multiplying `v_uv` by a number greater than 1 causes the texture coordinates to go beyond 1, and `fract()` brings them back into the 0-1 range, effectively tiling the texture.
- **Scrolling (`v_uv.x + offset`):** Adding an offset (often time-dependent) to one or both components of `v_uv` makes the texture appear to scroll.
- **Distortion/Displacement:** Using values from another texture (a displacement map) or a mathematical function to offset `v_uv` before sampling the main texture can create warping, heat haze, or water ripple effects.

---

### 13.7 Multi-Pass Shading (Conceptual Overview)

**Goal:** Understand the concept of applying multiple shaders sequentially to achieve more complex effects that require intermediate processing steps.

Sometimes, a single shader pass isn't enough. For example, to apply a blur and then a color grading effect, you might use two passes:

1.  **Pass 1:** Render the original node (or a previous pass's output) with a blur shader to an offscreen texture (framebuffer).
2.  **Pass 2:** Render the result of Pass 1 (the blurred texture) with a color grading shader to the screen or another framebuffer.

**How it Works in Motion Canvas (Conceptual):**

The `shaders` property on a node can accept an **array** of `ShaderConfig` objects.

```typescript
// In a scene
// const myNode = createRef<Rect>();
// view.add(
//   <Rect
//     ref={myNode}
//     width={300} height={200} fill="white" // Initial fill might be input to first shader
//     shaders={[
//       { // Pass 1: Example - Horizontal Blur
//         fragment: horizontalBlurShader,
//         uniforms: { u_blurAmount: 0.01 }
//       },
//       { // Pass 2: Example - Vertical Blur (takes output of Pass 1 as its u_sprite)
//         fragment: verticalBlurShader,
//         uniforms: { u_blurAmount: 0.01 }
//       },
//       { // Pass 3: Example - Apply a tint to the blurred result
//         fragment: tintShader,
//         uniforms: { u_tintColor: new Color('red').alpha(0.5) }
//       }
//     ]}
//   />
// );
```

- **Order Matters:** The shaders in the array are applied sequentially.
- **Input/Output:** The output of one shader pass (typically rendered to an internal framebuffer) becomes the input (usually via the `u_sprite` uniform) for the next shader in the array.
- **Framebuffers:** Motion Canvas manages these intermediate textures (framebuffers) for you when you provide an array of shaders.

This is an advanced technique used for effects like bloom, depth of field (in 3D), complex blurs, and other multi-stage image processing effects.

---

### 13.8 The Role of `WebGLPlugin`

**Goal:** Understand when and why the `WebGLPlugin` might be needed.

The `@motion-canvas/core` package provides a `WebGLPlugin`.

**Purpose:**

- **Initialize WebGL Context:** It's responsible for setting up and managing the global WebGL rendering context that Motion Canvas uses when shaders (or other WebGL-accelerated features) are employed.
- **Global Uniforms:** It can provide global uniforms that are accessible to all shaders, such as a consistently updated `u_time` or `u_frame`.
- **WebGL State Management:** Helps manage global WebGL state.

**Usage:**

You typically add it to your `project.ts` if you are using shaders extensively or other features that rely on a persistent WebGL context. Many basic shader uses might work without explicitly adding it if the default setup initializes WebGL sufficiently, but for consistent behavior, especially with time-based shaders, it's good practice.

```typescript
// src/project.ts
import { makeProject, WebGLPlugin } from "@motion-canvas/core";
// ... other imports

export default makeProject({
  scenes: [
    /* ... */
  ],
  plugins: [
    WebGLPlugin({
      // Options for the WebGLPlugin, e.g.:
      // powerPreference: 'high-performance',
    }),
    // ... other plugins like ffmpeg ...
  ],
});
```

If you're using shaders and find that uniforms like `u_time` aren't updating as expected, or if you encounter WebGL context issues, adding `WebGLPlugin` is often a solution.

---

This concludes our deep dive into shaders! You now have a foundational understanding of how to write GLSL, apply shaders to nodes, pass data using uniforms, work with textures, and the concept of multi-pass shading.

We have covered a vast majority of Motion Canvas's features.
