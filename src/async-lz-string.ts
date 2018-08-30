import { ICompressor, CompressorImpl } from "./compressor";
import { IDecompressor, DecompressorImpl } from "./decompressor";

const compressor: ICompressor = new CompressorImpl();
const decompressor: IDecompressor = new DecompressorImpl();

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
