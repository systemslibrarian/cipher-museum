# LLM Eval Export Schema (v0.2)

This schema defines the format for exporting LLM evaluation results on the Cipher Corpus.

```
{
  "record_id": "string",           // Unique identifier for the cipher record
  "solver_name": "string",         // Name of the LLM or solver
  "run_id": "string",              // Unique run/session identifier
  "timestamp": "ISO 8601 string",  // When the evaluation was run
  "result": {
    "plaintext": "string",         // Decoded plaintext
    "score": "number",             // Evaluation score (e.g., accuracy, log-likelihood)
    "details": "string"            // Optional: explanation or metadata
  }
}
```

- All fields are required unless noted.
- Export as newline-delimited JSON (JSONL).
