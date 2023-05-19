import { ICompressor, CompressorImpl } from "./compressor";
import { IDecompressor, DecompressorImpl } from "./decompressor";

const compressor: ICompressor = new CompressorImpl();
const decompressor: IDecompressor = new DecompressorImpl();

const keyStrBase64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const baseReverseDic: Record<string, Record<string, number>> = {};

function getBaseValue(alphabet, character): number {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (let i = 0; i < alphabet.length; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

export async function compressToBase64(input: string) {
  if (input === null) {
    return "";
  }
  const compressResult = await compressor.compress(input, 6, function (a) {
    return keyStrBase64.charAt(a);
  });
  switch (
    compressResult.length % 4 // To produce valid Base64
  ) {
    default:
    case 0:
      return compressResult;
    case 1:
      return compressResult + "===";
    case 2:
      return compressResult + "==";
    case 3:
      return compressResult + "=";
  }
}

export async function decompressFromBase64(compressed: string) {
  if (compressed === null) {
    return "";
  }
  if (compressed === "") {
    return null;
  }
  return await decompressor.decompress(compressed.length, 32, function (index) {
    return getBaseValue(keyStrBase64, compressed.charAt(index));
  });
}

export async function compressToUTF16(input: string) {
  if (input === null) {
    return "";
  }
  const compressResult = await compressor.compress(
    input,
    15,
    function (a: number) {
      return String.fromCharCode(a + 32);
    }
  );
  return compressResult + " ";
}

export async function decompressFromUTF16(compressed: string) {
  if (compressed === null) {
    return "";
  }
  if (compressed === "") {
    return null;
  }
  return await decompressor.decompress(
    compressed.length,
    16384,
    function (index: number) {
      return compressed.charCodeAt(index) - 32;
    }
  );
}
