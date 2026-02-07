/* Quench sanity tests for Actor Studio
   This registers a tiny passing and failing test so Quench UI can be validated.
   See: https://ethaks.github.io/FVTT-Quench/index.html
*/

import type { Quench, QuenchContext } from '@ethaks/fvtt-quench';

Hooks.on("quenchReady", (quench: Quench) => {
  quench.registerBatch(
    "actor-studio.sanity",
    (context: QuenchContext) => {
      const { describe, it, assert } = context;

      describe("Actor Studio Sanity", function () {
        it("has a sane environment", function () {
          assert.ok(true);
        });

        it("an example failure (for UI)", function () {
          assert.strictEqual(1 + 1, 2);
        });
      });
    },
    { displayName: "ACTOR-STUDIO: Sanity tests", preSelected: true }
  );
});
