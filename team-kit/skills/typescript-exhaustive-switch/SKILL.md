---
name: typescript-exhaustive-switch
description: Use exhaustive switch handling for TypeScript unions and enums. Use whenever writing, editing, or reviewing a TypeScript switch statement over a discriminated union or enum.
---

# TypeScript exhaustive switch

In switch statements over discriminated unions or enums, use a `never` check in the default case so newly added variants cause compile-time failures until handled.

```ts
switch (shape.kind) {
  case "circle":
    return area(shape);
  case "square":
    return side(shape) ** 2;
  default: {
    const unreachable: never = shape;
    throw new Error(`Unhandled shape: ${JSON.stringify(unreachable)}`);
  }
}
```
