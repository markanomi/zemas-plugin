/*
 * Minimal fallback stub for local UI preview.
 * In Illustrator CEP runtime, this file should be replaced by Adobe's official CSInterface.js.
 */
if (typeof CSInterface === "undefined") {
  function CSInterface() {}
  CSInterface.prototype.evalScript = function (_script, callback) {
    if (callback) {
      callback('{"error":"CSInterface stub aktif. CEP içinde Adobe CSInterface.js kullanın."}');
    }
  };
}
