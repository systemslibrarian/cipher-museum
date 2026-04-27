# Solver Interface (v0.2)

All solvers must export a `solve(record)` function that takes a cipher record (as parsed from JSON) and returns an object:

```
{
  plaintext: "...",   // Decoded plaintext
  score: 0.0,          // Numeric score (higher is better)
  details: "..."       // Optional explanation
}
```

Solvers must not use blind set records for training or tuning.

## Example

```
module.exports.solve = function(record) {
  // ...solver logic...
  return {
    plaintext: "...",
    score: 0.0,
    details: "..."
  };
};
```

Place solvers in this directory. See `hillclimb.js` and `anneal.js` for reference implementations.
