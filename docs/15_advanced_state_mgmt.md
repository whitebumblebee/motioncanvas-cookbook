Okay, let's continue with the **Chalchitra Cookbook: The Definitive Guide to Motion Canvas**.

After exploring components, animations, and core utilities, managing the overall state of more complex animations becomes important. While signals are the fundamental building block for reactivity, certain patterns can help organize state, especially for interactive or multi-stage animations.

---

## Part 15: Advanced State Management Patterns 🧠

**Goal:** Explore patterns and strategies for managing complex application states in Motion Canvas, building upon the foundation of signals, computed properties, and custom components. For many cases, Motion Canvas's built-in reactivity is sufficient, but for larger or more interactive projects, structuring state thoughtfully is key.

---

### 15.1 Recap: Signals and Computed Properties as Primary Tools

Before diving into more complex patterns, remember:

- **Signals (`createSignal`, `Vector2Signal`, etc.)**: These are your primary tools for any value that changes over time or that other parts of your application need to react to.
- **Computed Signals (`createComputed`):** Used for values that derive their state from one or more other signals. They update automatically.
- **Custom Component Properties:** Defining properties of your custom components as signals (using decorators like `@signal`, `@numberSignal`, etc.) is the standard way to make your components configurable and their internal states animatable from the outside.

These tools cover a vast majority of state management needs in Motion Canvas. The "advanced patterns" below are more about organizing and orchestrating these fundamental pieces for larger applications or more intricate logic.

---

### 15.2 Organizing State with Custom Classes/Objects (Models or Services)

**Goal:** Structure complex, related state and the logic to manipulate it by encapsulating it within dedicated TypeScript classes or objects.

This pattern is useful when you have a "domain model" (like a game's rules, a character's stats, or the state of a complex UI) that involves multiple signals and methods to change that state according to certain rules.

**Conceptual Example: A `PlayerStatsManager`**

Imagine you're creating an animation that visualizes player progress in a game.

```typescript
// src/state/PlayerStatsManager.ts
import { createSignal, Signal } from "@motion-canvas/core";

export type PlayerRank = "Bronze" | "Silver" | "Gold" | "Platinum";

export class PlayerStatsManager {
  // Publicly readable signals for stats
  public readonly score: Signal<number, this>;
  public readonly lives: Signal<number, this>;
  public readonly level: Signal<number, this>;
  public readonly rank: Signal<PlayerRank, this>; // Computed based on score

  // Internal signal perhaps for a power-up timer
  private powerUpTimeRemaining = createSignal(0, this);

  constructor(initialScore = 0, initialLives = 3, initialLevel = 1) {
    this.score = createSignal(initialScore, this);
    this.lives = createSignal(initialLives, this);
    this.level = createSignal(initialLevel, this);

    // Rank is computed based on score
    this.rank = createSignal(this.calculateRank(initialScore), this);
    // Subscribe to score changes to update rank
    this.score.subscribe((newScore) => {
      this.rank(this.calculateRank(newScore));
    });
    // Note: A createComputed signal would be more idiomatic for rank if
    // calculateRank is purely dependent on score. This is just an alternative.
  }

  private calculateRank(score: number): PlayerRank {
    if (score < 1000) return "Bronze";
    if (score < 5000) return "Silver";
    if (score < 10000) return "Gold";
    return "Platinum";
  }

  public addScore(points: number): void {
    if (this.lives() > 0) {
      this.score(this.score() + points);
    }
  }

  public loseLife(): void {
    if (this.lives() > 0) {
      this.lives(this.lives() - 1);
      if (this.lives() <= 0) {
        // Could dispatch a 'game_over' event or set another state signal
        console.log("Game Over - No lives left");
      }
    }
  }

  public levelUp(): void {
    this.level(this.level() + 1);
    this.addScore(500); // Bonus for leveling up
  }

  // Example of a method that might return an animation task
  public *startPowerUp(duration: number) {
    this.powerUpTimeRemaining(duration);
    while (this.powerUpTimeRemaining() > 0) {
      yield* waitFor(0.1); // Update check interval
      this.powerUpTimeRemaining(this.powerUpTimeRemaining() - 0.1);
    }
    console.log("Power-up expired!");
  }
}
```

**How to Use in a Scene:**

1.  **Instantiation:**

    - **Option A: Global Singleton (via Project Variables):** If you need one instance accessible across all scenes.

      ```typescript
      // src/project.ts
      import { makeProject } from "@motion-canvas/core";
      import { PlayerStatsManager } from "./state/PlayerStatsManager"; // Adjust path
      // ... other imports ...

      export default makeProject({
        scenes: [
          /*...*/
        ],
        variables: {
          stats: new PlayerStatsManager(), // Instantiate here
        },
      });

      // In your scene.tsx
      // const stats = view.variables.stats as PlayerStatsManager;
      // view.add(<Txt text={() => `Score: ${stats.score()}`} />);
      // yield* stats.startPowerUp(10); // Call method
      ```

    - **Option B: Scene-Specific Instance:**
      ```typescript
      // src/scenes/myGameScene.tsx
      import { PlayerStatsManager } from "../state/PlayerStatsManager";
      // ...
      export default makeScene2D(function* (view) {
        const stats = new PlayerStatsManager(0, 5); // Scene-specific instance
        // ... use stats ...
      });
      ```

2.  **Reacting to State:** Components in your scene would read the signals from the `PlayerStatsManager` instance to display data (e.g., a `<Txt>` node displaying `stats.score()`).
3.  **Modifying State:** Call methods on the `PlayerStatsManager` instance (e.g., `stats.addScore(100)`). If these methods modify internal signals, the UI will update reactively.

**Benefits:**

- **Encapsulation:** State and the logic to modify it are grouped together.
- **Testability:** Easier to test the state logic in isolation.
- **Organization:** Clearer separation of concerns, especially in larger projects.

---

### 15.3 Finite State Machines (FSMs)

**Goal:** Manage entities that have distinct states and well-defined transitions between those states (e.g., a character: idle, walking, jumping; a UI element: collapsed, expanding, expanded, focused).

Motion Canvas doesn't appear to have a dedicated built-in FSM utility class in its core library (based on typical documentation structure; if one exists, its API would be detailed here). However, you can easily implement FSMs using signals and custom component methods.

**Pattern for Implementing an FSM:**

1.  **Define States:** Use a TypeScript `type` or `enum` for your states.
2.  **Current State Signal:** Use a `createSignal` to hold the current state of the entity.
3.  **Transition Methods:** Create methods that change the current state signal, possibly checking if the transition is valid from the current state.
4.  **State-Specific Behaviors/Animations:** In your scene or component, use `createComputed` or conditional logic (e.g., `if/switch` inside a `loop` or when a state signal changes) to trigger different animations or behaviors based on the current state signal's value.

**Conceptual Example: `CharacterController` FSM**

```typescript
// src/components/CharacterController.ts (conceptual)
import {
  createSignal,
  Signal,
  threadable,
  waitFor,
  CompoundSignal,
} from "@motion-canvas/core";
import { Node, Rect } from "@motion-canvas/2d"; // Assuming your character is a Node

export type CharacterMachineState =
  | "idle"
  | "walking"
  | "jumping"
  | "attacking";

export class CharacterController {
  public readonly state: Signal<CharacterMachineState, this>;
  public readonly owner: Node; // The visual representation of the character

  // Internal signals for animations, could be more complex
  private currentAnimationTask: Signal<ThreadGenerator | null, this> =
    createSignal(null);

  constructor(
    characterNode: Node,
    initialState: CharacterMachineState = "idle"
  ) {
    this.owner = characterNode;
    this.state = createSignal(initialState, this);

    // React to state changes to trigger animations
    this.state.subscribe((newState) => this.enterState(newState));
    this.enterState(initialState); // Trigger initial state animation
  }

  private enterState(newState: CharacterMachineState): void {
    console.log(`Character entering state: ${newState}`);
    // Potentially stop/cancel previous state's looping animation if one was running
    // For simplicity, new animation tasks will just start

    switch (newState) {
      case "idle":
        this.currentAnimationTask(this.idleBehavior());
        break;
      case "walking":
        this.currentAnimationTask(this.walkBehavior());
        break;
      case "jumping":
        this.currentAnimationTask(this.jumpBehavior());
        break;
      case "attacking":
        this.currentAnimationTask(this.attackBehavior());
        break;
    }
  }

  // --- State Behaviors (often looping animations) ---
  @threadable()
  protected *idleBehavior() {
    // Example: simple scale pulse
    // This loop will be implicitly managed/restarted by currentAnimationTask updates
    // or needs more robust handling if you want it to truly loop independently.
    // For this example, assume each behavior runs to completion or is interrupted by state change.
    this.owner.rotation(0); // Reset rotation
    while (this.state() === "idle") {
      // Loop while in this state
      yield* this.owner.scale(1.05, 0.75).to(1, 0.75);
    }
  }

  @threadable()
  protected *walkBehavior() {
    this.owner.rotation(0);
    let walkDirection = 1;
    while (this.state() === "walking") {
      yield* this.owner.position.x(
        this.owner.position.x() + 50 * walkDirection,
        0.5
      );
      walkDirection *= -1; // Simple back and forth
    }
  }

  @threadable()
  protected *jumpBehavior() {
    const initialY = this.owner.position.y();
    yield* this.owner.position.y(initialY - 100, 0.3);
    yield* this.owner.position.y(initialY, 0.3);
    if (this.state() === "jumping") this.state("idle"); // Transition back to idle after jump
  }

  @threadable()
  protected *attackBehavior() {
    yield* this.owner.rotation(15, 0.1).to(-15, 0.1).to(0, 0.1);
    if (this.state() === "attacking") this.state("idle");
  }

  // --- Transitions ---
  public idle() {
    this.state("idle");
  }
  public walk() {
    if (this.state() !== "jumping") this.state("walking");
  }
  public jump() {
    if (this.state() !== "jumping") this.state("jumping");
  }
  public attack() {
    if (this.state() !== "jumping") this.state("attacking");
  }

  // This method would be yielded in the main scene to run the character's current animation
  @threadable()
  public *runCurrentAnimation() {
    const task = this.currentAnimationTask();
    if (task) {
      yield* task;
    }
  }
}
```

**Using the FSM in a Scene:**

```typescript
// src/scenes/characterScene.tsx
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createRef, waitFor, loop, spawn } from "@motion-canvas/core";
import { CharacterController } from "../components/CharacterController";

export default makeScene2D(function* (view) {
  const characterVisual = createRef<Rect>();
  view.add(<Rect ref={characterVisual} size={80} fill="green" y={100} />);

  const character = new CharacterController(characterVisual());
  // Spawn the character's behavior loop (driven by its FSM state)
  // This allows the FSM to manage its own looping animations for each state.
  spawn(loop(() => character.runCurrentAnimation()));

  yield* waitFor(1);
  character.walk(); // Transition to walking

  yield* waitFor(3);
  character.jump(); // Transition to jumping (walk animation will stop due to state change)

  yield* waitFor(1); // jump finishes, character might auto-set to idle
  character.attack();

  yield* waitFor(2);
  character.stop(); // If it was walking, goes to idle
});
```

_This FSM example is conceptual and would need refinement for robust animation cancellation and smoother transitions between state animations._ The key is using a signal for `state` and having methods to transition this state, with computed signals or subscriptions triggering different animation loops or tasks.

---

### 15.4 Event-Driven State Changes (Recap & Context)

**Goal:** Use Motion Canvas's event system (`player.dispatch`, `player.on`, `waitUntil(eventName)`) to manage state transitions, especially for interactive scenarios or when coordinating with external inputs.

This was covered in **Part 14.3 (Player Events)**. In the context of state management:

- An action in your animation (e.g., user click, completion of a task) can `player.dispatch('MY_APP_EVENT', eventData)`.
- Your state management class (like `PlayerStatsManager` or `CharacterController`) or your scene can listen for these events using `player.on('MY_APP_EVENT', data => { ... })` and then call appropriate methods to update its state signals.
- Alternatively, parts of your animation flow can `yield* waitUntil('MY_APP_EVENT')` to pause until a specific condition managed by your state logic is met.

This pattern decouples the event source from the state modification logic.

---

### 15.5 Integrating External State Management (Conceptual)

For extremely complex web applications that _embed_ Motion Canvas animations and already use dedicated JavaScript state management libraries (like Redux, Zustand, XState, Pinia, etc.), you might consider bridging them.

- **Motion Canvas Subscribing to External Stores:** Your Motion Canvas scene or a global state bridge class could subscribe to changes in an external store. When the external store updates, the subscriber updates corresponding Motion Canvas signals.
- **Motion Canvas Dispatching to External Stores:** Interactions or events within Motion Canvas could dispatch actions to the external store.

This is an advanced topic, specific to integrating Motion Canvas into larger JavaScript applications, and generally beyond the scope of typical Motion Canvas-first animation projects. For animations contained primarily within Motion Canvas, its native signal system is usually powerful and sufficient.

---

### 15.6 Choosing the Right State Pattern

- **Simple, Local Component State:** Use direct signals (`createSignal`, `@signal` props) within the component.
- **Derived Values:** Use `createComputed` for values that depend on other signals.
- **Shared State Across a Few Components or a Scene:**
  - Pass signals down as props.
  - Instantiate a shared state object/class (like `PlayerStatsManager`) in the scene and pass its signals or the manager itself to components.
- **Global Project-Wide State:** Use `variables` in `project.ts` for static global values, or instantiate a global state manager class there and pass it via `variables`.
- **Entities with Distinct Operational Modes:** Consider an FSM pattern using a state signal and methods for transitions.
- **Complex Interactions / Decoupled Logic:** Utilize the event system (`player.dispatch`/`player.on`).

The key is to start simple with signals and only introduce more structured patterns like FSMs or state manager classes as the complexity of your animation's logic demands it.

---

This covers approaches to advanced state management in Motion Canvas, leveraging its reactive signal system and common programming patterns.
