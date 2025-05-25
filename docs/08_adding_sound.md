Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

---

## Part 8: Adding Sound with Audio 🔊

Audio is a crucial element in bringing animations to life, whether it's background music, voiceovers, or sound effects. Motion Canvas provides ways to manage audio at both the project level and within individual scenes.

---

### 8.1 Project-Level Audio Track

**Goal:** Learn how to set a main audio track that can play across your entire project or multiple scenes.

**Core Concepts Involved:** `audio` and `audioOffset` properties in `makeProject` (within `src/project.ts`).

**How it Works:**

You can define a single audio file to serve as the main soundtrack for your project. This track will play when the project loads, and its timeline is synchronized with the project's main timeline.

**Steps:**

1.  **Place your audio file:** Put your audio file (e.g., `background_music.mp3`, `voiceover.wav`) into your project's `public/` directory.

2.  **Configure in `src/project.ts`:**
    Edit your main project definition file:

    ```typescript
    // src/project.ts
    import { makeProject } from "@motion-canvas/core";

    // Import your scenes
    import myScene1 from "./scenes/myScene1?scene";
    import myScene2 from "./scenes/myScene2?scene";
    // ... other scenes

    export default makeProject({
      scenes: [myScene1, myScene2], // Add all your scenes here

      // Define the main audio track for the project
      audio: "/background_music.mp3", // Path relative to the 'public/' directory

      // Optional: Offset the start of the audio playback
      // For example, start the music 2.5 seconds into the project's timeline
      audioOffset: 2.5,

      // Other project settings like variables, resolution, etc.
      // variables: {
      //   myGlobalColor: 'red',
      // }
    });
    ```

**Explanation:**

- **`audio: '/path/to/your/audiofile.mp3'`**:
  - This property takes a string path to your audio file.
  - The path should be relative to the `public/` directory at the root of your Motion Canvas project. For instance, if your audio is `public/music/track1.mp3`, you'd use `'/music/track1.mp3'`.
- **`audioOffset: number` (optional, default: `0`):**
  - This specifies a time in seconds at which the project audio should begin playing, relative to the start of the project's timeline.
  - `audioOffset: 0` means the audio starts playing immediately when the project starts.
  - `audioOffset: 5` means the audio will start playing 5 seconds after the project begins.
  - A negative offset (e.g., `audioOffset: -3`) can start the audio _before_ the visual timeline effectively begins (useful if the audio has a lead-in).

**Key Behaviors:**

- **Synchronization:** The project audio is synchronized with the main animation timeline. If you seek in the animation, the audio seeks accordingly.
- **Single Track:** This method is for one primary audio track for the entire project. For multiple sound effects or localized audio within scenes, use the `<Audio />` component (see next recipe).
- **Preloading:** Motion Canvas typically handles the loading of this main audio track. You can also use `Media.preload('/background_music.mp3');` at the top level of your `project.ts` (outside `makeProject`) if you want to ensure it's fetched early, though this is an async operation.

---

### 8.2 The `<Audio />` Component (Scene-Specific Audio)

**Goal:** Learn how to play, control, and synchronize audio clips within individual scenes, ideal for sound effects, dialogue snippets, or music cues tied to specific animations.

**Core Concepts Involved:** `Audio` component from `@motion-canvas/2d`, `src` property, playback signals and methods.

**Basic Usage:**

1.  **Place audio files:** Put your scene-specific audio files (e.g., `sfx_click.wav`, `short_music_cue.ogg`) in your project's `public/` directory.

2.  **Use in a scene file (`.tsx`):**

    ```typescript
    // src/scenes/soundDemo.tsx
    import { makeScene2D, Audio, Rect } from "@motion-canvas/2d";
    import { createRef, waitFor, Media } from "@motion-canvas/core";

    const clickSoundSrc = "/sfx/click.wav"; // Path relative to public/
    const musicCueSrc = "/music/short_cue.mp3";

    export default makeScene2D(async function* (view) {
      // It's highly recommended to preload audio assets used in a scene
      await Media.preload([clickSoundSrc, musicCueSrc]);
      // Or: yield* Media.waitForAssets(async () => {
      //   Media.preload(clickSoundSrc);
      //   Media.preload(musicCueSrc);
      // });

      const clickSfx = createRef<Audio>();
      const musicCue = createRef<Audio>();
      const animatedRect = createRef<Rect>();

      // Add Audio nodes to the scene. They are not visual but exist in the scene graph.
      // It's good practice to add them even if `play` is initially false or you trigger them later.
      view.add(
        <>
          <Audio ref={clickSfx} src={clickSoundSrc} play={false} />
          <Audio ref={musicCue} src={musicCueSrc} loop={false} volume={0.7} />
          <Rect ref={animatedRect} size={100} fill="lightblue" x={-200} />
        </>
      );

      // Play a sound effect when an animation happens
      yield* animatedRect().position.x(0, 0.5);
      yield* clickSfx().play(); // Play the click sound

      yield* waitFor(0.5);

      // Play a music cue and synchronize another animation to its approximate length
      musicCue().play(); // Start music cue (don't yield* if you want next animation immediately)
      yield* animatedRect().fill("lightcoral", musicCue().duration() ?? 2); // Animate rect color over music duration (fallback to 2s)
      // Note: musicCue().duration() gives the total duration.
      // To wait for it to finish if not yielded: yield* waitFor(musicCue().duration() ?? 0);

      yield* waitFor(1);

      // Control volume
      yield* musicCue().volume(0.2, 1); // Fade volume down over 1 second
    });
    ```

**Explanation:**

- `import {Audio} from '@motion-canvas/2d';`: Imports the `Audio` component.
- `await Media.preload(...)`: Preloading audio files using `Media.preload()` is crucial to prevent delays or issues when you try to play them. The scene generator function can be `async` to use `await` for this.
- `<Audio ref={...} src={...} />`: Defines an audio source within your scene.
  - `src`: Path to the audio file (relative to `public/`).
  - It's a node, so it's added to the scene graph (e.g., via `view.add()`), though it's not visual.
- Playback methods like `sfxPing().play()` and properties like `volume` control the audio.

---

### 8.3 Key Properties and Methods for `<Audio />`

The `<Audio />` component offers a comprehensive set of signals and methods for audio control:

- **Source & Basic Setup:**
  - `src: SignalValue<string>`: The path to the audio file. Changing this will load a new audio source.
  - `play: SignalValue<boolean>` (or `playing`): A signal that controls playback. `true` to play, `false` to pause. Often set via methods.
  - `loop: SignalValue<boolean>` (default: `false`): Whether the audio should loop back to the start when it ends.
  - `volume: SignalValue<number>` (default: `1`): The audio volume, from `0` (mute) to `1` (full volume). Can be higher than 1 for gain, but browsers might clamp.
  - `playbackRate: SignalValue<number>` (default: `1`): The speed at which the audio plays. `0.5` is half speed, `2` is double speed.
  - `offset: SignalValue<number>` (default: `0`): The initial time in seconds from which the audio should start playing when `play()` is first called or `src` is set.
- **Time & Duration (Read-Only Signals for getting state):**
  - `time(): number`: The current playback time in seconds (read-only signal, but can be set via `seek()` method or `time` property for seeking).
  - `duration(): number`: The total duration of the loaded audio file in seconds (read-only signal). Returns `0` if audio is not loaded or has no duration.
  - `ended(): boolean`: A boolean signal that becomes `true` when playback has finished (and not looping).
- **Playback Methods:**
  - `play(): ThreadGenerator`: Starts or resumes playback. Returns a task that completes when playback _begins_ or if it's already playing.
    ```typescript
    yield * myAudioRef().play();
    ```
  - `pause(): ThreadGenerator`: Pauses playback. Returns a task that completes when playback is paused or if it's already paused.
    ```typescript
    yield * myAudioRef().pause();
    // Or for instant effect without yielding:
    // myAudioRef().playing(false);
    ```
  - `seek(timeInSeconds: number, durationOfSeek?: number): ThreadGenerator`:
    Changes the current playback time. The `durationOfSeek` allows the _act of seeking_ to be animated (e.g., if you had a visual playhead, it could animate to the new position). For audio, it usually means the audio will jump to `timeInSeconds` after `durationOfSeek`. If `durationOfSeek` is 0 or omitted, it seeks immediately.
    ```typescript
    yield * myAudioRef().seek(10, 0.5); // "Animates" the seek over 0.5s, then audio plays from 10s
    myAudioRef().time(10); // Alternative way to seek instantly by setting the time signal
    ```
  - `reset(defaultTime: number = this.offset())`: Stops playback, resets `time` to `defaultTime` (or its initial `offset`), and clears the `ended` state.
    ```typescript
    myAudioRef().reset(); // Rewinds to start (or its initial offset) and stops
    ```

**Animating `<Audio />` Properties:**

You typically animate `volume` and `playbackRate`. The `time` signal can be animated to create a scrubbing effect if desired.

```typescript
// Assuming myAudio is a createRef<Audio>()

// Fade volume in
myAudio().volume(0); // Set initial volume to 0
yield * myAudio().play();
yield * myAudio().volume(1, 1.5); // Fade in volume over 1.5 seconds

// Animate playback rate for a slowdown effect
yield * myAudio().playbackRate(0.5, 1); // Slow down to half speed over 1 second

// Animate scrubbing (less common for typical playback)
// yield* myAudio().time(myAudio().duration() / 2, 2); // "Scrub" to middle over 2s
```

---

### 8.4 Synchronizing Audio with Animations

**Goal:** Align audio playback precisely with visual events and animations.

**Techniques:**

1.  **Sequential Triggering:**
    Play sounds immediately after or before specific visual animations using the default sequential flow of `yield*`.

    ```typescript
    yield * myRect().scale(2, 0.5); // Visual animation
    yield * sfxPop().play(); // Play sound right after scale
    ```

2.  **Using `all()` for Simultaneous Start:**
    Start an audio clip and a visual animation at the exact same time.

    ```typescript
    yield *
      all(
        myCharacter().jump(1), // Character jump animation (1s duration)
        sfxJump().play() // Play jump sound simultaneously
      );
    ```

    _Note: `sfxJump().play()` might resolve very quickly. If the sound effect has a specific duration you want to account for in the `all` block's total time, you might need a custom task or use its `ended` signal._

3.  **Using `waitFor()` based on Audio Properties:**
    If you know the duration of a sound effect or music cue, you can use `waitFor()` to time subsequent animations.

    ```typescript
    musicCue().play(); // Start background music cue
    // If musicCue().duration() is reliable (audio loaded):
    const cueDuration = musicCue().duration() ?? 3.0; // Fallback if duration not ready
    yield * waitFor(cueDuration); // Wait for the music cue to finish
    yield * nextAnimation();
    ```

4.  **Using `Audio.ended` signal with `waitUntil()` (Advanced):**
    For more robust synchronization, especially with variable-length audio or when you need to ensure audio has truly finished.

    ```typescript
    myLongSfx().play();
    yield * waitUntil(() => myLongSfx().ended()); // Wait until the 'ended' signal is true
    // console.log('Long SFX has finished playing!');
    // yield* followingAnimation();
    ```

    _Note: `waitUntil` with a function polls. For specific events, Motion Canvas might have a more direct event-based `waitUntil`. The `ended` signal is a boolean signal, so this polling approach is common._

5.  **Animating to Audio `time()` (Advanced Sync):**
    You can use the `myAudio().time()` signal as a driver for other animations if you need very tight coupling, for example, making a visualizer react to the current playback position.
    ```typescript
    // In a loop or a tween that reads myAudio().time()
    // yield* loop(() => {
    //   const currentTime = myAudio().time();
    //   visualizerRect().height(calculateHeightFromAudio(currentTime));
    //   return waitFor(1/30); // Update at 30fps
    // });
    ```

---

### 8.5 Working with Multiple Audio Sources

You can add multiple `<Audio />` components to your scene to manage various sound effects, dialogue tracks, and music layers.

```typescript
// ...
const sfxExplosion = createRef<Audio>();
const sfxPowerUp = createRef<Audio>();
const backgroundMusic = createRef<Audio>();

view.add(
  <>
    <Audio ref={sfxExplosion} src="/sfx/explosion.wav" volume={0.8} />
    <Audio ref={sfxPowerUp} src="/sfx/powerup.wav" volume={0.6} />
    <Audio
      ref={backgroundMusic}
      src="/music/level_theme.mp3"
      loop
      volume={0.3}
    />
  </>
);

// Start background music
backgroundMusic().play();

// Later...
yield * myCharacter().shoot();
sfxExplosion().play(); // Play explosion, don't yield* if shoot animation is quick

yield * waitFor(2);
yield * myCharacter().collectItem();
sfxPowerUp().play();
// ...
```

**Considerations:**

- **Volume Balancing:** Adjust the `volume` property of individual `<Audio />` nodes to mix your sounds appropriately.
- **Performance:** While modern browsers handle multiple audio sources well, an excessive number of concurrent, high-bitrate audio streams could potentially impact performance, especially on less powerful devices.
- **Clarity:** Ensure your soundscape isn't too cluttered. Prioritize important sounds.

---

This part covers using project-level audio and the versatile `<Audio />` component for scene-specific sound design and synchronization.
