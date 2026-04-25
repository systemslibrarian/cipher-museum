/* ================================================================
   THE CIPHER MUSEUM — Cipher Detective v1.5 compatibility shim

   This file loads the v1.5 modular sub-packages and re-exports
   window.CipherDetective for backward compatibility with
   test-comprehensive.js and any other callers.

   In the browser the four <script> tags in cipher-detective.html
   load the modules directly; this shim is only used by Node.js
   test runners that require() this single file.
   ================================================================ */
'use strict';

if (typeof require !== 'undefined') {
  /* Node / test runner context: load sub-modules explicitly. */
  require('./detective/analyses.js');
  require('./detective/scoring.js');
  require('./detective/render.js');
  require('./detective/detective.js');
}
/* In a browser context the <script> tags in the HTML page are
   sufficient; nothing more needs to happen here. */
