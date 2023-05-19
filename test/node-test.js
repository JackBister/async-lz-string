const AsyncLZString = require("../libs/async-lz-string");

async function main() {
  const original = "hello world";
  const compressedUTF16 = await AsyncLZString.compressToUTF16(original);
  const decompressedUTF16 = await AsyncLZString.decompressFromUTF16(
    compressedUTF16
  );
  const compressedBase64 = await AsyncLZString.compressToBase64(original);
  const decompressedBase64 = await AsyncLZString.decompressFromBase64(
    compressedBase64
  );

  if (decompressedUTF16 !== original) {
    throw new Error(
      `expected decompressedUTF16="${original}", have decompressedUTF16=${decompressedUTF16}`
    );
  }
  if (decompressedBase64 !== original) {
    throw new Error(
      `expected decompressedBase64="${original}", have decompressedBase64=${decompressedBase64}`
    );
  }
  console.log("Running in Node seems to work as it should :)");
}

main();
