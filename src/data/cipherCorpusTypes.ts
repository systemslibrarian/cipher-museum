// Cipher Corpus Data Types

export type CipherCorpusRecord = {
  id: string;
  title: string;
  cipher_family: string;
  cipher_type: string;
  plaintext: string;
  ciphertext: string;
  key: Record<string, unknown>;
  language: string;
  alphabet: string;
  text_length: number;
  normalized_text_length: number;
  spacing: "preserved" | "removed" | "grouped" | "mixed";
  punctuation: "preserved" | "removed" | "mixed";
  casing: "uppercase" | "lowercase" | "mixed";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  source_type: "synthetic" | "historical" | "public_domain" | "user_contributed";
  source: string;
  license: string;
  notes: string;
  expected_attacks: string[];
  tags: string[];
  created_by: string;
  verified: boolean;
  dataset_version: string;
};

export type CipherCorpusRecordOptional = {
  year?: string;
  historical_context?: string;
  known_solution_method?: string;
  hints?: string[];
  tool_notes?: string;
  related_exhibit_url?: string;
  try_in_cipher_detective_url?: string;
  benchmark_split?: "beginner" | "intermediate" | "advanced" | "expert" | "historical" | "blind";
  scoring_notes?: string;
};
