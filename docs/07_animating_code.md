You are absolutely correct to call that out! The `<Code />` component is a cornerstone of Motion Canvas, especially for creating technical presentations and tutorials. My apologies for not including it in the sequence earlier.

Let's dedicate this part of the **Chalchitra Cookbook** to a deep dive into the `<Code />` component.

---

## Part 7: Animating Code with the `<Code />` Component 💻

Motion Canvas provides a powerful `<Code />` component that allows you to display, animate, and transform code snippets with syntax highlighting. This is invaluable for creating tutorials, technical explanations, or any animation involving code.

---

### 7.1 Displaying Static Code Blocks

**Goal:** Learn how to display a static block of code with appropriate syntax highlighting and theming.

**Core Concepts Involved:** `Code` component, `code` prop, `language` prop, themes.

**Basic Usage:**

```typescript
import { makeScene2D, Code } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";
// Themes are often imported from @motion-canvas/core/lib/themes
// For example, to use the default dark theme (Monokai if it's the default, or similar):
// import {OneDark} from '@motion-canvas/core/lib/themes'; // Or your chosen theme

export default makeScene2D(function* (view) {
  const myCodeBlock = createRef<Code>();

  const javascriptSnippet = `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('Motion Canvas');`;

  view.add(
    <Code
      ref={myCodeBlock}
      code={javascriptSnippet}
      language="javascript" // Specify the language for highlighting
      // theme={OneDark} // Apply a theme object if needed
      // By default, CodeBlock uses a pre-configured theme.
      // You can customize this globally or per instance.
      fontSize={28} // Optional: set font size
    />
  );
  yield;
});
```

**Explanation:**

- `import {Code} from '@motion-canvas/2d';`: Imports the `Code` component.
- `<Code ... />`: Defines a code block.
  - `code={javascriptSnippet}`: The `code` prop takes the string of code you want to display.
  - `language="javascript"`: Specifies the programming language. This is crucial for correct syntax highlighting. Motion Canvas uses Lezer-based highlighters, supporting many common languages.
  - `theme={OneDark}`: (Optional) You can apply a specific theme object. Themes define the colors for different code tokens. If not provided, a default theme is used. Themes are typically imported.
  - `fontSize`: Controls the font size for the code.

**Syntax Highlighting:**

- Motion Canvas uses the Lezer parsing system with language-specific grammars for robust syntax highlighting.
- Supported languages are determined by the available Lezer parsers bundled or configured with Motion Canvas. Common languages like JavaScript, TypeScript, Python, Java, C++, HTML, CSS, JSON, etc., are usually supported.

---

### 7.2 Key Properties for `<Code />`

The `<Code />` component has many properties to customize its appearance and behavior:

- **Content & Language:**
  - `code: SignalValue<string>`: The code string to display. This is a signal, so it can be animated.
  - `language: SignalValue<string>`: The language identifier (e.g., `'typescript'`, `'python'`, `'html'`).
- **Theming & Font:**
  - `theme: SignalValue<CodeTheme>`: A theme object that defines syntax highlighting colors and styles. (e.g., from `@motion-canvas/core/lib/themes`).
  - `fontFamily: SignalValue<string>`: The font family for the code.
  - `fontSize: SignalValue<number>`: The font size in pixels.
  - `lineHeight: SignalValue<number | string>`: Line height for the code.
  - `fontWeight: SignalValue<number>`: Font weight.
- **Layout & Appearance:**
  - `indentSize: SignalValue<number>` (default usually `2` or `4`): Number of spaces per indent level.
  - `wordWrap: SignalValue<boolean>` (default `false`): Whether lines should wrap if they exceed the component's width.
  - `drawSalt: SignalValue<boolean>` (default `true`): Adds a "salt" to the code block which can influence how diffing animations appear, making them more visually interesting.
- **Selection & Highlighting:**
  - `selection: SignalValue<CodeSelection>`: Controls which parts of the code are selected/highlighted. This is powerful for drawing attention to specific code sections. Values can be:
    - A `CodeRange` (e.g., `lines(0)` for the first line, `word(0, 2, 5)` for the 3rd word on the 1st line up to 5 characters into it).
    - An array of `CodeRange`s.
    - Special selectors like `CodeSelection.Word`, `CodeSelection.Line`, `CodeSelection.Block`.
  - `selectionColor: SignalValue<PossibleColor>`: The background color for selected text. (Might be part of the theme).
- **Diffing Options (when animating `code` prop):**
  - `diffControlsAlignment: SignalValue<'top' | 'bottom'>`: Where controls for diffing might appear (if any visual cues are added by default, usually it's seamless).
  - `currentLineNumber: SignalValue<number>`: The line number to which the view should be scrolled (if the code block is scrollable).

---

### 7.3 Animating Code Content (Diffing)

One of the most powerful features of the `<Code />` component is its ability to animate changes between different code states. Motion Canvas intelligently "diffs" the old and new code and creates smooth transitions.

**Goal:** Learn how to animate from one code snippet to another.

**Core Concepts:** `code()` signal animation, code diffing algorithm.

**Example:**

```typescript
import { makeScene2D, Code } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const codeBlock = createRef<Code>();

  const initialCode = `function greet() {
  // TODO: Implement greeting
}`;

  const nextCode = `function greet(name) {
  console.log(\`Hello, \${name}!\`); // Added a parameter and log
}`;

  const finalCode = `// A more advanced greeting
async function greet(name) {
  await loadSalutation();
  console.log(\`Greetings, \${name}!\`);
}`;

  view.add(
    <Code
      ref={codeBlock}
      language="javascript"
      code={initialCode}
      fontSize={24}
    />
  );

  yield* waitFor(1);

  // Animate from initialCode to nextCode
  // Motion Canvas will animate the changes (additions, deletions, modifications)
  yield* codeBlock().code(nextCode, 1.5); // Duration 1.5 seconds

  yield* waitFor(1);

  // Animate from nextCode to finalCode
  yield* codeBlock().code(finalCode, 2); // Duration 2 seconds
});
```

**Explanation:**

- `yield* codeBlock().code(newCodeString, duration);`: This command animates the content of the `Code` node from its current state to `newCodeString` over the specified `duration`.
- **Diffing Algorithm:** Motion Canvas analyzes the differences between the two code versions and tries to create a visually meaningful transition. This often involves:
  - Lines fading in or out.
  - Lines shifting position.
  - Characters being added or removed within lines.
  - Colors changing as tokens are modified.

---

### 7.4 Advanced Code Animations & Manipulations

Beyond animating the entire code block, Motion Canvas offers methods for more granular, "live coding" style animations.

**Goal:** Explore methods like `edit()`, `insert()`, `remove()`, and `replace()` for fine-grained code transformations.

**1. The `edit()` Method (Tagged Template Literal Syntax):**

The `edit()` method provides a powerful way to describe changes using a special syntax within a JavaScript tagged template literal.

```typescript
import { makeScene2D, Code } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const editor = createRef<Code>();
  view.add(
    <Code
      ref={editor}
      language="python"
      fontSize={28}
      code={`def my_function():\n    pass`}
    />
  );
  yield* waitFor(0.5);

  // Edit the code using tagged template syntax
  yield* editor().edit(1.5)`def my_function():
    <ins>value = 10
    print(f"Value: {value}")</ins><del>pass</del>`;
  // <ins>...</ins>: Insert new code.
  // <del>...</del>: Delete old code.
  // Code outside tags is treated as context and should match existing lines.

  yield* waitFor(0.5);

  // Further edit, showing replacement (if <rep> is supported, otherwise use del/ins)
  // The <rep> tag is not explicitly in latest docs, usually achieved by <del>old</del><ins>new</ins>
  // on the same conceptual line or by careful diffing with .code()
  yield* editor().edit(1)`def my_function():
    value = <del>10</del><ins>20</ins>
    print(f"Value: {value}")`;

  yield* waitFor(0.5);

  // Remove a line
  yield* editor().edit(1)`def my_function():
    <del>value = 20</del>
    print(f"Value: {value}")`;
});
```

- **`yield* codeRef().edit(duration)\`template string\`;`**:
  - The template string describes the desired _end state_ of the code block relative to its current state.
  - **`<ins>text</ins>`**: Marks text to be inserted.
  - **`<del>text</del>`**: Marks text to be deleted.
  - **Unchanged Lines:** Lines in the template string without these tags are expected to match existing lines in the `Code` node. The diffing algorithm uses these as anchors.
- The `edit` method provides a very intuitive way to script "typing" or refactoring sequences.

**2. Programmatic Insert, Remove, Replace:**

For more dynamic or calculated changes, you can use specific methods. These often work with `CodePoint` (e.g., `{line: number, column: number}`) and `CodeRange` (start and end `CodePoint`).

- **`insert(point: CodePoint | SignalValue<CodePoint>, code: string | SignalValue<string>, duration?: number)`:** Inserts `code` at the given `point`.

  ```typescript
  import { CodePoint } from "@motion-canvas/core";
  // ...
  // yield* editor().insert(new CodePoint(1, 4), "  # Inserted comment\n", 1);
  ```

- **`remove(range: CodeRange | SignalValue<CodeRange>, duration?: number)`:** Removes the code within the specified `range`.

  ```typescript
  import { CodeRange } from "@motion-canvas/core";
  // ...
  // const lineToRemove = new CodeRange(new CodePoint(2,0), new CodePoint(3,0)); // Range for all of line 2
  // yield* editor().remove(lineToRemove, 1);
  ```

- **`replace(range: CodeRange | SignalValue<CodeRange>, code: string | SignalValue<string>, duration?: number)`:** Replaces the code in `range` with the new `code`.
  ```typescript
  // const wordToReplace = new CodeRange(new CodePoint(0,4), new CodePoint(0,13)); // 'my_function'
  // yield* editor().replace(wordToReplace, "new_name", 1);
  ```

**3. Animating Code Selection:**

Highlight parts of your code programmatically.

```typescript
import { makeScene2D, Code } from "@motion-canvas/2d";
import {
  createRef,
  lines,
  word,
  range,
  CodeSelection,
  waitFor,
} from "@motion-canvas/core"; // Import selection helpers

export default makeScene2D(function* (view) {
  const codeSelect = createRef<Code>();
  const codeContent = `const pi = 3.14159;
function calculateCircumference(radius) {
  return 2 * pi * radius;
}`;
  view.add(
    <Code
      ref={codeSelect}
      code={codeContent}
      language="javascript"
      fontSize={28}
    />
  );
  yield* waitFor(0.5);

  // Select the first line
  yield* codeSelect().selection(lines(0), 0.5); // Selects line index 0
  yield* waitFor(1);

  // Select a specific word: word(lineIndex, wordIndexInLine, [optional] characterSpanInWord)
  yield* codeSelect().selection(word(1, 1), 0.5); // Select 'calculateCircumference'
  yield* waitFor(1);

  // Select a character range: range(startLine, startCol, endLine, endCol)
  // Or a simpler range(fromCharIndex, toCharIndex) if using flat indexing.
  // For lines/columns:
  // yield* codeSelect().selection(range(new CodePoint(2,9), new CodePoint(2,11)), 0.5); // Select "pi"

  // Select multiple ranges
  yield* codeSelect().selection([lines(0), lines(2)], 0.75);
  yield* waitFor(1);

  // Clear selection
  yield* codeSelect().selection(null, 0.5); // Or CodeSelection.None
});
```

- Helper functions like `lines()`, `word()`, `range()` from `@motion-canvas/core` (or `@motion-canvas/2d` re-exports) help create `CodeRange` objects easily.
- The `selection` property itself is a signal and can be animated.

---

### 7.5 Using Different Themes and Languages

**Goal:** Understand how to apply different visual themes for syntax highlighting and specify various programming languages.

**1. Specifying Language:**

As seen before, use the `language` prop:

```typescript
<Code language="python" code={`print("Hello from Python")`} />
<Code language="html" code={`<h1>Title</h1>`} />
<Code language="css" code={`.class { color: red; }`} />
```

Motion Canvas relies on Lezer grammars. The available languages depend on which Lezer packages are included or configured in your Motion Canvas setup.

**2. Applying Themes:**

Themes control the colors used for syntax highlighting (keywords, comments, strings, etc.) and the background of the code block.

- **Importing Themes:** Motion Canvas typically provides some built-in themes. You import them and pass them to the `theme` prop.

  ```typescript
  import { makeScene2D, Code } from "@motion-canvas/2d";
  import { createRef } from "@motion-canvas/core";
  // Example: Importing a specific theme (actual theme names/paths might vary)
  import { githubDark } from "@motion-canvas/core/lib/themes"; // Check correct path for themes
  // Or: import { MyCustomTheme } from './myCustomTheme';

  export default makeScene2D(function* (view) {
    const themedCode = createRef<Code>();
    view.add(
      <Code
        ref={themedCode}
        code={`// Theme example\nconst id = 1;`}
        language="typescript"
        theme={githubDark} // Apply the imported theme
        fontSize={28}
      />
    );
    yield;
  });
  ```

- **Default Theme:** If no `theme` is provided, a default theme (often a dark theme like Monokai or similar) is used.
- **Custom Themes:** You can create custom theme objects. A theme object typically defines colors for various token types recognized by the highlighter. Refer to the Motion Canvas documentation or codebase (`packages/core/src/themes/CodeTheme.ts` or similar) for the structure of a theme object.
- **Global Theme Configuration:** It's often possible to set a default theme for all `Code` components in your `project.ts` via `Code.defaultTheme = myTheme;` or through project settings if available.

---

The `<Code />` component is incredibly versatile for any animation involving code. Mastering its diffing, editing methods, and selection capabilities will allow you to create very dynamic and engaging technical content.

This concludes our deep dive into the `<Code />` component. You were right to remind me – it's essential!
