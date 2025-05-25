Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

This part focuses on how you can programmatically interact with and control the Motion Canvas player from within your scenes.

---

## Part 14: Programmatic Control of the Player ▶️

**Goal:** Learn how to access the Motion Canvas `Player` object within your scenes to control playback (play, pause, seek), read its state (current time, duration, playing status), listen to player events, and dispatch custom events.

**Core Concepts Involved:** `Player` object, player state signals, playback methods, player events.

**Accessing the Player Object:**

Within your scene's generator function or methods of a class-based scene, you can access the `Player` instance:

- In `makeScene2D(function* (view) { ... })`: Use `view.player`.
- In a class extending `Scene` (or `Node`): Use `this.player`.

```ts
import { makeScene2D } from "@motion-canvas/2d";
import { Player } from "@motion-canvas/core"; // For type annotation

export default makeScene2D(function* (view) {
  const player: Player = view.player; // Access the player

  // Now you can use player.play(), player.time(), etc.
  console.log(`Current scene time via player: ${player.time()}`);
  yield;
});
```

---

### 14.1 Reading Player State (Properties & Signals)

The `Player` object exposes many of its properties as signals, allowing you to reactively read its current state.

- **`player.state: Signal<PlayerState>`**:

  - A signal representing the current playback state.
  - `PlayerState` can be: `'playing'`, `'paused'`, `'seeking'`, `'ended'`, `'stalled'`.
  - Example: `console.log(player.state());`

- **`player.time: Signal<number>`**:

  - The current playback time of the project in seconds. This is animatable (for seeking) and readable.
  - Example: `const currentTime = player.time();`

- **`player.duration: Signal<number>`**:

  - The total duration of the currently loaded "presentation" in seconds. This might be the duration of the current scene or the total duration of all scenes if playing through the entire project.
  - Example: `const totalDuration = player.duration();`

- **`player.fps: Signal<number>`**:

  - The current frames per second at which the player is attempting to render or is configured for export.
  - Example: `console.log(`Target FPS: ${player.fps()}`);`

- **`player.playbackRate: Signal<number>`**:

  - The current playback speed multiplier (e.g., `1` for normal, `0.5` for half-speed, `2` for double-speed).
  - Example: `player.playbackRate(1.5); // Sets to 1.5x speed`

- **`player.loop: Signal<boolean>`**:

  - Whether the playback should loop.
  - Example: `player.loop(true);`

- **`player.volume: Signal<number>`**:

  - The global volume of the player (from 0 to 1). This affects project audio and potentially `<Audio/>` components if they don't override it.
  - Example: `player.volume(0.5);`

- **`player.currentScene: Signal<Scene | null>`**:

  - A signal holding the currently active `Scene` object.
  - Example: `const sceneName = player.currentScene()?.name;`

- **Slides (if your project uses the slide system):**

  - `player.slides: Signal<Slide[] | null>`: An array of all discovered slides in the presentation.
  - `player.currentSlide: Signal<Slide | null>`: The currently active slide object.
  - `player.currentSlideIndex: Signal<number>`: The index of the current slide.

- **`player.variables`**:
  - Access to the global variables defined in `project.ts`.
  - Example: `const themeColor = player.variables.brandPrimary;`

**Using Player State Reactively:**

```ts
import { makeScene2D, Txt } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const timeText = createRef<Txt>();
  view.add(
    <Txt
      ref={timeText}
      fill="white"
      fontSize={40}
      fontFamily="monospace"
      // Reactively display the player's current time
      text={() =>
        `Time: ${view.player.time().toFixed(2)}s / ${view.player
          .duration()
          .toFixed(2)}s`
      }
      x={-view.width() / 2 + 100}
      y={-view.height() / 2 + 50}
    />
  );
  yield* view.player.waitFor(5); // Let time pass for 5 seconds
});
```

---

### 14.2 Controlling Playback (Player Methods)

The `Player` object provides methods to control the playback flow. Most of these methods are asynchronous and return a `Promise<void>` or are `ThreadGenerator`s that should be `yield*`ed.

- **`player.play(): Promise<void>` or `yield* player.play()`**:

  - Starts or resumes playback.
  - The promise resolves when playback has actually started.

- **`player.pause(): Promise<void>` or `yield* player.pause()`**:

  - Pauses playback.
  - The promise resolves when playback has paused.

- **`player.togglePlayback(): Promise<void>` or `yield* player.togglePlayback()`**:

  - Toggles between play and pause states.

- **`player.seek(timeInSeconds: number): Promise<void>` or `yield* player.seek(timeInSeconds: number)`**:

  - Jumps the main project timeline to `timeInSeconds`.
  - This is an "instant" seek for the player's timeline.
  - _Note: This is different from an animatable seek on an individual `<Audio/>` or `<Video/>` component. This controls the entire project's time._

- **Slide Navigation (if using slides):**

  - `player.next(): Promise<void>` or `yield* player.next()`: Moves to the next slide.
  - `player.previous(): Promise<void>` or `yield* player.previous()`: Moves to the previous slide.
  - `player.goTo(slideIdOrIndex: string | number): Promise<void>` or `yield* player.goTo(slideIdOrIndex)`: Jumps to a specific slide by its name (defined in `this.slide('My Slide Name')`) or index.

- **Frame-by-Frame Navigation (often for editor or debug control):**

  - `player.requestSeek(timeInSeconds: number)`: Requests a seek, might be queued.
  - `player.requestPreviousFrame()`: Moves one frame back.
  - `player.requestNextFrame()`: Moves one frame forward.

- **`player.present(sceneNameOrIndex?: string | number, speed?: number): Promise<void>`**:
  - Starts a "presentation," usually from the beginning or a specified scene.
  - `speed` can control the initial playback rate for the presentation.

**Example: Custom Play/Pause Control**

```ts
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const player = view.player;
  const myAnimRect = createRef<Rect>();
  view.add(<Rect ref={myAnimRect} size={100} fill="orange" x={-300} />);

  // Start an animation
  const animationTask = myAnimRect().position.x(300, 5); // 5-second animation

  yield* waitFor(1);
  yield* player.pause(); // Pause the whole project timeline after 1s
  console.log("Player paused by script.");

  yield* waitFor(2); // This waitFor will effectively be "paused time" until player resumes

  yield* player.play(); // Resume the whole project timeline
  console.log("Player resumed by script.");

  // Wait for the original animationTask to naturally complete
  yield* animationTask;
});
```

---

### 14.3 Player Events

The `Player` emits various events that you can listen to for reacting to changes in its state or lifecycle.

- **Subscribing to Events: `player.on(eventName, callback)`**

  - Returns a `dispose` function to unsubscribe the listener.

  ```ts
  const playListenerDispose = player.on("play", () => {
    console.log("Event: Player started playing!");
  });

  const timeUpdateListenerDispose = player.on("timeupdate", (newTime) => {
    // newTime is a number representing the current time
    console.log(`Event: Time updated to ${newTime.toFixed(2)}`);
  });

  // Later, to stop listening:
  // playListenerDispose();
  // timeUpdateListenerDispose();
  // (Often, subscriptions are auto-disposed when the scene ends)
  ```

- **Common Player Events (`PlayerEvents`):**

  - `'load'`: Fired when the project and initial assets are loaded.
  - `'play'`: Fired when playback starts or resumes.
  - `'pause'`: Fired when playback pauses.
  - `'seek'`: Fired after a seek operation completes. Payload: `{to: number, DURATIONNanos: bigint}`.
  - `'timeupdate'`: Fired frequently as the playback time changes. Payload: `number` (new time).
  - `'durationchange'`: Fired when the total duration of the presentation changes. Payload: `number` (new duration).
  - `'fpschange'`: Fired when the FPS changes. Payload: `number` (new FPS).
  - `'scenechanged'`: Fired when the active scene changes. Payload: `{previous: Scene | null, current: Scene | null}`.
  - `'slidechanged'`: Fired when the active slide changes. Payload: `{previous: Slide | null, current: Slide | null, DURATIONNanos: bigint}`.
  - `'slideevent'`: Fired for events within a slide.
  - `'presenterTimeupdate'`: If using presenter mode.
  - `'variableschanged'`: Fired when project variables are updated. Payload: `Record<string, unknown>` (new variables).
  - `'resize'`: Fired when the player viewport resizes.
  - `'framemetadatachanged'`: When frame metadata is updated.
  - `'frameadvanced'`: When a frame is advanced.
  - `'ended'`: Fired when playback of the entire presentation (all scenes/slides) naturally concludes (and not looping).
  - `'reset'`: Fired when the player is reset.

- **Dispatching Custom Events: `player.dispatch(eventName: string, data?: any)`**
  You can dispatch your own custom events through the player, which can then be caught by `waitUntil(eventName)` or other `player.on(eventName)` listeners.

  ```ts
  // In one part of your animation
  yield * waitFor(1);
  player.dispatch("myCustomMilestone", { achieved: true, value: 100 });

  // In another part, or a spawned task
  yield * waitUntil("myCustomMilestone");
  console.log("My custom milestone reached!");
  // You can access data if the listener for 'myCustomMilestone' receives it.
  // player.on('myCustomMilestone', data => console.log(data.value));
  ```

---

### 14.4 Other Player Utilities

- **`player.logger: Logger`**:
  Access the player's instance of the `Logger` for consistent logging.

  ```ts
  player.logger.info("This message comes from the player logger.");
  ```

- **`player.debug` Tools:**
  The player might have debugging flags or methods. For example, the documentation shows patterns like:
  ```ts
  // Toggling debug information display (if available)
  // player.debugFlags.showOrigins = !player.debugFlags.showOrigins();
  // The exact API for debug flags might be internal or evolve.
  // More commonly, you use the editor's visual debugging tools.
  ```
  The `debug` namespace in `@motion-canvas/core` offers functions to draw debug visuals (points, vectors, rects) usually within a `<Canvas/>` component, which the player would then render.

By interacting with the `Player` object, you gain significant control over the animation lifecycle, can react to state changes, and build more interactive and dynamic presentations.

---

This covers programmatic control of the Player.

Next, as per your request: **Part 15: Advanced State Management Patterns**. This section will depend heavily on what patterns or utilities Motion Canvas's documentation explicitly recommends beyond the already powerful signal system. If the docs are light on specific "advanced state management" tools beyond signals, this section will focus on how to architect complex state using the existing features (signals, computed properties, custom components, classes, and events).

Would you like to **"continue"** to "Advanced State Management Patterns"?
