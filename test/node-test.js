const AsyncLZString = require("../libs/async-lz-string");

async function main() {
  const original = "hello world";
  const compressed = await AsyncLZString.compressToUTF16(original);
  const decompressed = await AsyncLZString.decompressFromUTF16(compressed);

  if (decompressed !== original) {
    throw new Error(
      `expected decompressed="${original}", have decompressed=${decompressed}`
    );
  } else {
    console.log("Running in Node seems to work as it should :)");
  }
}

main();
