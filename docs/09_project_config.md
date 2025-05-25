Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

This part focuses on how to configure your overall project and then how to get your beautiful animations out into the world.

---

## Part 9: Project Setup, Configuration, and Exporting ⚙️🎬

We'll first look at how to set up global configurations for your project, define variables, and manage fonts. Then, we'll cover how to render and export your final animations.

---

### 9.1 Configuring Your Project (`project.ts`)

**Goal:** Learn how to set up global project settings like resolution, background color, frame rate, define global variables accessible across scenes, and manage custom fonts using the `makeProject` function in `src/project.ts`.

**Core Concepts Involved:** `makeProject()` function, `ProjectConfig` object, global settings.

The `src/project.ts` file is the heart of your project's configuration. The `makeProject()` function initializes your project with various settings.

**Key `ProjectConfig` Properties in `makeProject()`:**

```typescript
// src/project.ts
import { makeProject, WebGLPlugin } from "@motion-canvas/core";
// Import FFmpeg plugin if you plan to use it for video export
// import {ffmpeg} from '@motion-canvas/ffmpeg';

// Import your scenes
import sceneA from "./scenes/sceneA?scene";
import sceneB from "./scenes/sceneB?scene";

// Example: Define a custom font configuration
const projectFonts = {
  // Font family name you'll use in Txt components
  MyCustomFont: [
    // Array of FontFaceDescriptors
    { src: "/fonts/MyCustomFont-Regular.woff2", weight: 400, style: "normal" },
    { src: "/fonts/MyCustomFont-Bold.woff2", weight: 700, style: "normal" },
    { src: "/fonts/MyCustomFont-Italic.woff2", weight: 400, style: "italic" },
  ],
  AnotherFont: "/fonts/AnotherGenericFont.ttf", // Simpler registration
};

export default makeProject({
  // 1. Scenes (Required)
  // An array of all the scenes that are part of this project.
  // The order here can influence the order in the editor's scene dropdown.
  scenes: [sceneA, sceneB],

  // 2. Background Color (Optional)
  // Sets a default background color for all scenes in the project.
  // This can be overridden by individual scenes if they set their own background.
  background: "lightslategray", // Any valid CSS color string or Color object

  // 3. Audio (Optional, Covered in Part 8)
  // audio: '/audio/main_soundtrack.mp3',
  // audioOffset: 0, // In seconds

  // 4. Global Variables (Optional)
  // Define variables that can be accessed by any scene in the project.
  // Useful for brand colors, common animation durations, API keys (with care), etc.
  variables: {
    brandPrimary: "#E13238", // A specific red
    brandSecondary: "#24C1E0", // A specific teal
    shortWait: 0.5,
    standardDuration: 1.2,
    globalTitle: "My Awesome Project",
  },

  // 5. Resolution Scale (Optional)
  // Affects the internal rendering resolution. Higher values mean crisper output
  // but require more processing power. Scales the scene's defined size.
  // Example: If scene size is 1920x1080 and resolutionScale is 2,
  // internal rendering is at 3840x2160.
  resolutionScale: 1, // Default is 1. Use 2 for sharper results, especially for video.

  // 6. Frame Rate (FPS) - For Rendering (Optional, default usually 30 or 60)
  // While individual scenes run on the display's refresh rate in the editor,
  // this can set a target FPS for rendering/export.
  // Note: `fps` is primarily part of RendererSettings.
  // If not directly in makeProject, it's configured during export.
  // Let's assume for now it's an export-time setting, but good to be aware of.

  // 7. Custom Fonts (Optional)
  // Register custom font files for use in Txt components.
  // Place font files in your `public/fonts/` directory (or any subfolder).
  fonts: projectFonts,

  // 8. Plugins (Optional)
  // Extend Motion Canvas functionality.
  // plugins: [
  //   ffmpeg(), // Example: Enables FFmpeg exporter for video rendering
  //   WebGLPlugin(), // If using advanced WebGL features directly
  // ],

  // 9. Experimental Features (Optional)
  // experimentalFeatures: true,
});
```

**Explanation of Key Configurations:**

1.  **`scenes: Scene[]` (Required):**

    - An array of your imported scene objects. This tells Motion Canvas which animations are part of your project.

2.  **`background: PossibleColor` (Optional):**

    - Sets a global background color for the entire stage. Scenes can still override this by drawing their own backgrounds (e.g., a full-screen `Rect` as the first element).
    - Example: `background: '#2A2A2A'` for a dark gray.

3.  **`variables: Record<string, unknown>` (Optional):**

    - A JavaScript object where keys are variable names and values are their corresponding data.
    - **Accessing Variables in Scenes:** These variables are injected into the `view` object of your scenes.

      ```typescript
      // Inside a scene file: myScene.tsx
      import { makeScene2D, Rect, Txt } from "@motion-canvas/2d";
      import { createRef } from "@motion-canvas/core";

      export default makeScene2D(function* (view) {
        const myRect = createRef<Rect>();
        const myTitle = createRef<Txt>();

        // Accessing variables defined in project.ts
        const primaryColor = view.variables.brandPrimary as string;
        const titleText = view.variables.globalTitle as string;

        view.add(
          <>
            <Rect ref={myRect} fill={primaryColor} size={100} />
            <Txt
              ref={myTitle}
              text={titleText}
              fill={"white"}
              y={-100}
              fontSize={50}
            />
          </>
        );
        yield* myRect().position.x(
          view.variables.defaultDuration * 100,
          view.variables.defaultDuration
        );
      });
      ```

      - It's good practice to cast the type (e.g., `as string`) if you know it, for better TypeScript support within the scene.

4.  **`resolutionScale: number` (Optional, default: `1`):**

    - This multiplies the scene's defined `width` and `height` for internal rendering.
    - A `resolutionScale: 2` for a 1920x1080 scene means it's rendered internally at 3840x2160 and then scaled down for display or final export (if export resolution matches scene size). This results in much sharper lines and text (Supersampling).
    - Higher values increase rendering time and memory usage. `2` is often a good balance for high-quality output.

5.  **`fonts: Record<string, string | FontFace[] | FontFaceOptions>` (Optional):**

    - Allows you to register custom font files (e.g., `.ttf`, `.otf`, `.woff`, `.woff2`) that you include in your project (typically in the `public/fonts/` directory).
    - The `key` of the record is the `font-family` name you will use in your `<Txt>` components.
    - The `value` can be:
      - A simple string path to the font file (relative to `public/`): `'MyFont': '/fonts/MyFont-Regular.ttf'`
      - An array of `FontFace` objects for more control over weights, styles, and multiple font files per family:
        ```typescript
        // FontFace interface (simplified, from @motion-canvas/core/lib/types/FontManager.ts)
        // interface FontFace {
        //   src: string; // URL to the font file
        //   weight?: number | string; // e.g., 400, 700, 'normal', 'bold'
        //   style?: string; // e.g., 'normal', 'italic'
        //   stretch?: string; // e.g., 'condensed', 'expanded'
        //   unicodeRange?: string;
        //   featureSettings?: string;
        //   variationSettings?: string;
        //   display?: string;
        //   ascenderOverride?: string;
        //   descenderOverride?: string;
        //   lineGapOverride?: string;
        // }
        'MyCoolFont': [
          { src: '/fonts/CoolFont-Regular.woff2', weight: 400, style: 'normal' },
          { src: '/fonts/CoolFont-Bold.woff2', weight: 700, style: 'normal' },
          { src: '/fonts/CoolFont-LightItalic.woff2', weight: 300, style: 'italic' },
        ]
        ```
    - **Using Custom Fonts in `<Txt>`:**
      ```typescript
      <Txt fontFamily={'MyCoolFont'} fontWeight={700} text={"Bold Text!"} />
      <Txt fontFamily={'AnotherFont'} text={"Regular Text!"} />
      ```

6.  **`plugins: Plugin[]` (Optional):**
    - An array of Motion Canvas plugins. Plugins can extend functionality, such as adding new exporters or custom components.
    - Example: `import {ffmpeg} from '@motion-canvas/ffmpeg'; makeProject({ plugins: [ffmpeg()] });` enables the FFmpeg exporter for video.
    - (A dedicated section on plugins might come later if they are commonly created by users).

**Scene Size and FPS:**

- **Scene Size (Resolution):** The actual pixel dimensions of your animation (e.g., 1920x1080) are typically defined when you create a scene using `makeScene2D` or in a class extending it, often via its `size` property or by setting the `view.size`. The `resolutionScale` in `project.ts` then multiplies this.
  ```typescript
  // Example in a scene file or a base scene class
  // export default makeScene2D(function* (view) {
  //   view.size([1280, 720]); // Set scene size
  //   ...
  // });
  ```
  The default scene size is often 1920x1080 if not specified.
- **FPS (Frames Per Second):**
  - In the **editor/preview**, Motion Canvas tries to run at your display's refresh rate (e.g., 60Hz).
  - For **exported renders**, you specify the FPS in the export settings (see next section). `ProjectConfig` itself doesn't usually have a global `fps` for rendering directly, but it influences how the timeline is perceived.

By configuring `project.ts` effectively, you establish a consistent foundation for all the scenes within your Motion Canvas animation project.

---

Okay, let's continue with **Part 9: Project Setup, Configuration, and Exporting ⚙️🎬** in the Chalchitra Cookbook.

We've covered project configuration. Now, let's look at how to get your animations rendered into distributable formats.

---

### 9.2 Exporting Your Animation (Rendering)

**Goal:** Learn how to render your Motion Canvas project into final video files or image sequences that you can share or use in other projects.

**Core Concepts Involved:** Rendering process, export formats (video, image sequence), export settings (resolution, FPS, range, quality), Motion Canvas Editor exporter, FFmpeg.

Once your animation is complete, you need to export it. Motion Canvas offers a couple of ways to do this, with the editor providing the most straightforward interface.

---

#### A. Exporting via the Motion Canvas Editor (Recommended for Most Users)

The Motion Canvas editor includes a built-in interface for exporting your projects.

**Steps:**

1.  **Open Your Project:**
    Start the Motion Canvas development server if it's not already running:

    ```bash
    npm start
    ```

    This will open the editor in your browser.

2.  **Navigate to the Export Panel:**
    In the Motion Canvas editor interface, look for an "Export" tab or button. This panel contains all the settings for rendering your animation.

3.  **Configure Export Settings in the Editor:**

    The Export panel typically provides the following options:

    - **Format / Type:**

      - **Video (MP4 / WebM):** Renders your animation as a video file.
        - `MP4 (H.264)`: Most common, good compression, wide compatibility.
        - `WebM (VP9/AV1)`: Open format, excellent for web use, good quality.
        - _Requires FFmpeg to be installed and configured (see section D below)._
      - **Image Sequence (PNG / JPEG):** Renders each frame of your animation as an individual image file.
        - `PNG`: Lossless, supports transparency (alpha channel). Ideal for high quality or if you need to composite the animation later. Can result in many large files.
        - `JPEG`: Lossy compression, smaller file sizes, does not support transparency. Good for previews or when file size is a major concern and transparency isn't needed.

    - **Range:** Determines which part of your project to render.

      - **Current Scene:** Renders only the scene currently selected/active in the editor.
      - **All Scenes:** Renders all scenes listed in your `project.ts` file, one after another, into a single output (if video) or separate folders (if image sequence per scene).
      - **Frame Range:** Allows you to specify a start and end frame number for a partial render (e.g., frames 0 to 300). This is useful for testing sections or re-rendering parts.
        - The total number of frames is determined by your scene durations and the target FPS.

    - **Resolution:**

      - This usually displays the final output resolution (e.g., 1920x1080, 3840x2160).
      - It's determined by the `size` set for your scenes and the `resolutionScale` set in your `project.ts`. For instance, a scene size of 1920x1080 and `resolutionScale: 2` will result in a 3840x2160 output if the export settings don't downscale it.

    - **FPS (Frames Per Second):**

      - The desired frame rate for your output video or image sequence (e.g., 24, 30, 60).
      - Higher FPS means smoother motion but larger file sizes and longer render times.

    - **Quality (for Video/JPEG):**

      - Often a slider or presets (e.g., Low, Medium, High).
      - For video, this influences the bitrate and compression. Higher quality means larger files.
      - For JPEG, it's the JPEG compression level (0-100).

    - **Audio (for Video formats):**

      - An option to include the project audio (defined in `project.ts`) or audio from `<Audio />` components in the final video.
      - You might also have options for audio bitrate or codecs if advanced settings are exposed.

    - **Transparency / Alpha Channel (for PNG sequence):**
      - A checkbox to include the alpha channel, making the background of your PNGs transparent. Essential if you plan to overlay your animation on other footage.

4.  **Start Rendering:**

    - Once you've configured your settings, click the "Render" or "Export" button in the panel.
    - Motion Canvas will begin the rendering process. You can usually see progress in the editor. This process can take time depending on the complexity and length of your animation, the resolution, and your computer's performance.

5.  **Output Location:**
    - Rendered files are typically saved to an `output/` directory within your Motion Canvas project folder.
    - The editor will usually indicate when the render is complete and where to find the files.

---

#### B. Understanding Key Rendering Settings

These settings are crucial whether you're exporting via the editor or programmatically.

- **`resolutionScale` (from `project.ts`):**

  - As mentioned in Part 9.1, this multiplies your scene's base resolution for internal rendering.
  - `resolutionScale: 1` renders at the scene's defined size (e.g., 1920x1080).
  - `resolutionScale: 2` renders at double that (3840x2160) and then, if your final export target is 1920x1080, this supersampled image is scaled down, resulting in much sharper output. This is highly recommended for final quality.
  - The final output dimensions will be `sceneWidth * resolutionScale` by `sceneHeight * resolutionScale`, unless the exporter itself has a separate "output resolution" setting that downscales.

- **`fps` (Frames Per Second):**

  - Determines the smoothness of motion.
  - Common values:
    - `24 fps`: Cinematic look.
    - `30 fps`: Common for web video and some broadcast.
    - `60 fps`: Very smooth, often used for UI animations, games, or high-quality motion graphics.
  - Ensure your animation's timing (`yield* myNode().prop(val, duration)`) is set with your target FPS in mind. If you animate something for 1 second and export at 30 FPS, it will occupy 30 frames.

- **File Format Choices:**

  - **PNG Sequence:**
    - **Pros:** Lossless quality, supports alpha transparency, frame-by-frame control (if a render fails, you have frames up to that point). Best for archiving or passing to professional video editing software.
    - **Cons:** Produces many individual files, very large total file size.
  - **JPEG Sequence:**
    - **Pros:** Smaller file sizes than PNG.
    - **Cons:** Lossy compression (quality degradation), no transparency.
  - **MP4 (H.264/AVC Codec):**
    - **Pros:** Excellent compression for good quality at relatively small file sizes, universally compatible across devices and platforms.
    - **Cons:** Lossy compression. Requires FFmpeg.
  - **WebM (VP9 or AV1 Codec):**
    - **Pros:** Open standard, often better compression than H.264 at similar quality (especially AV1), supports alpha transparency (VP9 with alpha, AV1). Great for web delivery.
    - **Cons:** May not be supported by all older devices/software. Requires FFmpeg. AV1 encoding can be slower.

- **Quality Settings:**

  - For JPEGs, this is a 0-100 scale. Higher is better quality but larger file size.
  - For videos, this is more abstract and controls bitrates or encoding profiles. The editor usually provides simpler presets (Low, Medium, High, Ultra). Higher settings result in clearer video but significantly larger files.

- **Transparency:**
  - If you need your animation to have a transparent background (e.g., to overlay it onto other video footage), export as a PNG sequence with the alpha channel enabled. Some video formats like WebM (VP9/AV1) can also support alpha. MP4 (H.264) generally does not support transparency well.

---

This covers exporting through the editor and understanding the key settings involved. The editor is the most user-friendly way for most export tasks.

Okay, let's continue with **Part 9: Project Setup, Configuration, and Exporting ⚙️🎬** in the Chalchitra Cookbook.

We'll now explore how to export your animations programmatically or via the command line, and then delve into more details about using FFmpeg for video output.

---

#### C. Programmatic Export / Command Line (Advanced)

While the Motion Canvas editor provides a user-friendly way to export, you might need to automate your rendering process (e.g., for CI/CD pipelines, batch rendering, or custom render management).

**Goal:** Learn methods for rendering animations without manual editor interaction.

**1. Using the `Renderer` API (from `@motion-canvas/core`)**

This is the most flexible programmatic approach and is typically done in a Node.js script.

**Steps & Concepts:**

1.  **Setup a Node.js Script:** Create a `.js` or `.ts` file (if using TypeScript with `ts-node` or similar) in your project.
2.  **Import Necessary Classes:**

    ```typescript
    import { Project } from "@motion-canvas/core/lib/app/Project"; // Adjust path if necessary
    import { Renderer } from "@motion-canvas/core/lib/app/Renderer";
    import { ImageExporter } from "@motion-canvas/core/lib/app/exporters/ImageExporter";
    import { FFmpegExporter } from "@motion-canvas/ffmpeg"; // Requires @motion-canvas/ffmpeg package
    import { Vector2 } from "@motion-canvas/core";
    // Import your project configuration (the object you pass to makeProject)
    import projectConfig from "./src/project"; // Assuming project.ts exports the config object directly
    // or exports the result of makeProject
    ```

    _Note: The exact import paths might sometimes need adjustment based on your project setup or if you're working within the Motion Canvas monorepo structure vs. a standalone project._

3.  **Instantiate `Project`:**
    Create an instance of your project. The `projectConfig` should contain your scenes, variables, etc. If `project.ts` exports `makeProject({...})`, you'd use that result.

    ```typescript
    // If project.ts exports the result of makeProject:
    // const project = projectConfig; // Where projectConfig is: import projectConfig from './src/project?project';
    // Or, if project.ts exports the config object:
    const project = new Project(projectConfig);
    ```

    Ensure that scenes within `projectConfig.scenes` are properly loaded. If they are dynamic imports (`import('./scenes/xyz?scene')`), the dynamic import mechanism needs to work in your Node.js script's context.

4.  **Recalculate Project (Important):**
    Before rendering, especially if loading the project fresh or if any settings could have changed, recalculate its properties.

    ```typescript
    await project.recalculate();
    ```

5.  **Instantiate `Renderer`:**

    ```typescript
    const renderer = new Renderer(project);
    ```

6.  **Define `RendererSettings`:**
    This object configures the rendering process.

    ```typescript
    const settings = {
      // Which parts to render (can be a range of frames or specific scene names/indices)
      range: project.framerate.total, // Example: Render all frames of the entire project
      // Or for a specific scene: project.scenes[0].framerate.range,
      // Or frame numbers: [0, 300], // Renders frames 0 through 300

      fps: 30, // Target frames per second for the output
      resolutionScale: 2, // Render at 2x resolution for quality

      // Configure the exporter
      exporter: new ImageExporter({
        // ImageExporter specific options
        fileType: "image/png", // 'image/jpeg'
        quality: 0.9, // For JPEG (0 to 1)
        outputGlob: "output/image-sequence/frame-%06d.png", // Output pattern
        groupByScene: true, // If true, creates subfolders for each scene
      }),
      // OR for video:
      // exporter: new FFmpegExporter({
      //   fileName: 'output/my_animation.mp4', // Output video file
      //   ffmpegPath: 'ffmpeg', // Path to ffmpeg executable (if not in system PATH)
      //   audio: project.audio, // Use project audio if defined
      //   audioOffset: project.audioOffset,
      //   outputPixelFormat: 'yuv420p', // Good for compatibility
      //   crf: 23, // Constant Rate Factor for H.264 (lower is better quality, 18-28 is common)
      //   preset: 'medium', // FFmpeg preset
      // }),
    };
    ```

7.  **Start Rendering:**
    ```typescript
    console.log("Starting programmatic render...");
    await renderer.render(settings);
    console.log("Render complete!");
    ```

**Conceptual Node.js Script (`render.js`):**

```javascript
// render.js - (You might use ts-node to run if it were TypeScript)
// This is a simplified conceptual outline.
// Actual implementation requires careful handling of imports and project setup.

// Placeholder for actual imports - these would need to be valid in your Node env
// const { Project } = require('@motion-canvas/core/lib/app');
// const { Renderer, ImageExporter } = require('@motion-canvas/core/lib/app');
// const projectConfig = require('./src/project').default; // How you get your project config

async function doRender() {
  try {
    // This instantiation might be more complex depending on how scenes are loaded
    // const project = new Project(projectConfig);
    // await project.recalculate(); // May not always be needed if config is static

    // For a real script, you'd need to correctly bootstrap a Motion Canvas project instance.
    // The `project` instance passed to the Renderer needs to be fully resolved.
    // This often means using the same mechanisms the editor or Vite plugin uses
    // to load and prepare the project, which can be non-trivial in a standalone script.

    // The Motion Canvas CLI / Vite build process is often a more reliable way
    // to trigger renders if you're not deeply integrating with MC's internal APIs.

    console.log("Programmatic rendering is complex to set up from scratch.");
    console.log(
      "Consider using `vite build` with configured exporters for automation."
    );
  } catch (e) {
    console.error("Render failed:", e);
  }
}

doRender();
```

- **Challenge:** Setting up a fully functional `Project` instance programmatically that correctly loads all scenes (especially with dynamic `?scene` imports) and plugins can be complex outside the context of the Vite dev server or build process. The `Renderer` API is powerful if you can provide it with a correctly bootstrapped `Project` object.

**2. Using `vite build` (Leveraging the Vite Plugin)**

This is often the more practical approach for CI/CD or automated batch rendering, as it uses Motion Canvas's existing build and export pipeline.

- **How it Works:** When you run `npm run build` (which typically executes `vite build --mode production`), the Motion Canvas Vite plugin (`@motion-canvas/vite-plugin`) can be configured to automatically render your project.
- **Configuration:**
  - This usually involves adding an exporter plugin (like `@motion-canvas/ffmpeg`) to your `project.ts` and potentially to your `vite.config.ts`.
  - The settings for the export (format, range, quality, etc.) are often configured within the options passed to these plugins in `project.ts` or sometimes via environment variables or specific Vite plugin options in `vite.config.ts`.

**Example (Conceptual, based on `@motion-canvas/ffmpeg` documentation):**

In `src/project.ts`:

```typescript
import { makeProject } from "@motion-canvas/core";
import { ffmpeg } from "@motion-canvas/ffmpeg"; // Import the ffmpeg plugin
import myScene from "./scenes/myScene?scene";

export default makeProject({
  scenes: [myScene],
  plugins: [
    ffmpeg({
      // Configure the ffmpeg exporter
      // These settings apply when `vite build` is run
      outputPixelFormat: "yuv420p",
      fastStart: true,
      crf: 23,
      preset: "medium",
      // By default, it might render all scenes to separate files
      // or a single file if only one scene.
      // Check plugin docs for controlling output file names and ranges.
    }),
  ],
});
```

- Then, running `npm run build` in your terminal would trigger Vite to build your project, and the `ffmpeg` plugin would handle rendering the scenes to video files in the `output/` directory (or as configured).
- The `@motion-canvas/ffmpeg` plugin's documentation will have the most up-to-date information on how it configures output for `vite build`.

---

#### D. FFmpeg for Video Export (In Detail)

FFmpeg is a powerful open-source command-line tool for processing video and audio. Motion Canvas leverages it for creating MP4 and WebM video files.

- **Requirement:**

  - FFmpeg must be **installed on your system**.
  - It needs to be accessible in your system's **PATH environment variable**, or you must provide the full path to the `ffmpeg` executable in the Motion Canvas settings.

- **`@motion-canvas/ffmpeg` Package:**

  - **Role:** This official Motion Canvas package provides the `FFmpegExporter` (for programmatic use) and a Vite plugin to integrate FFmpeg into the `vite build` process.
  - **Installation:**
    ```bash
    npm install @motion-canvas/ffmpeg
    ```
  - **Configuration in `project.ts` (for `vite build` integration):**
    As shown in the `vite build` section above, you import `ffmpeg` and add it to the `plugins` array in `makeProject`, passing configuration options.

- **Key `FFmpegExporterOptions` / Plugin Options:**
  (These can be used when instantiating `FFmpegExporter` programmatically or passed to the `ffmpeg()` plugin in `project.ts`.)

  - `fileName: string`: The output file name pattern (e.g., `output/video.mp4` or `output/scene-%s.mp4` where `%s` is scene name).
  - `ffmpegPath: string` (default: `'ffmpeg'`): Full path to your FFmpeg executable if it's not in your system PATH.
  - `audio?: string`: Path to an external audio file to be muxed with the video. If your project has global audio set (`project.audio`), this is often picked up automatically.
  - `audioOffset?: number`: Offset for the provided audio file.
  - `fastStart?: boolean` (default: `true` for MP4): Moves metadata (moov atom) to the beginning of MP4 files, allowing them to start playing before being fully downloaded (good for web).
  - `outputPixelFormat?: string` (default: `'yuv420p'`): The pixel format for the output video. `yuv420p` is widely compatible.
  - `codec?: string`: Specify video codec (e.g., `'libx264'`, `'libvpx-vp9'`, `'libaom-av1'`). Defaults are usually H.264 for MP4.
  - `crf?: number`: **Constant Rate Factor**. A quality setting for codecs like H.264, H.265, VP9. Lower values mean higher quality and larger files.
    - For H.264 (libx264): `0` (lossless) to `51` (worst). Good range: `18` (visually lossless) to `28` (decent quality). Default might be around `23`.
  - `preset?: string`: FFmpeg encoding preset (e.g., `'ultrafast'`, `'fast'`, `'medium'`, `'slow'`, `'slower'`, `'veryslow'`). Slower presets give better compression/quality for a given bitrate but take longer to encode. Default is usually `'medium'`.
  - `videoBitrate?: string`: Target video bitrate (e.g., `'5M'` for 5 Mbps). Using `crf` is often preferred over setting a fixed bitrate for variable bitrate encoding.
  - `audioBitrate?: string`: Target audio bitrate (e.g., `'192k'`).
  - `audioCodec?: string`: Specify audio codec (e.g., `'aac'`, `'libopus'`).
  - `frameRange?: [number, number]`: Specific frame range to export (overrides scene/project range for this exporter instance).
  - `customWriters?: FFmpegWriter[]`: For extremely advanced users to provide custom FFmpeg pipe setups.

- **Troubleshooting FFmpeg:**
  - **"FFmpeg not found":** Ensure FFmpeg is installed and its directory is in your system's PATH, or specify `ffmpegPath`.
  - **Codec errors:** Ensure your FFmpeg build supports the codecs you're trying to use.
  - **Slow exports:** Video encoding is CPU-intensive. Using faster `presets`, accepting slightly lower quality (higher `crf`), or reducing `resolutionScale` can speed things up.

**Choosing between Programmatic `Renderer` and `vite build`:**

- **`vite build` with exporter plugins (like `@motion-canvas/ffmpeg`):**
  - Easier to set up for standard export scenarios.
  - Integrates well with the existing project build process.
  - Good for CI/CD where you just run a build command.
- **Programmatic `Renderer` API:**
  - Offers maximum flexibility and control.
  - Useful if you're building a custom application around Motion Canvas that needs to trigger and manage renders dynamically from within a Node.js environment.
  - Can be more complex to set up correctly, especially regarding project and scene loading.

---

This concludes Part 9 on project configuration and the various ways to export your animations. You now have a good understanding of how to finalize and share your work!
