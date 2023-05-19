import * as AsyncLZString from "../src/async-lz-string";
import * as LZString from "lz-string";

function makeString(length: number) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function testBase64Compression(str: string): (done: () => void) => void {
  return (done) => {
    AsyncLZString.compressToBase64(str).then((asyncLzResult) => {
      const originalLZResult = LZString.compressToBase64(str);
      expect(asyncLzResult).toEqual(originalLZResult);
      done();
    });
  };
}

function testBase64Decompression(str: string): (done: () => void) => void {
  return (done) => {
    const originalLZCompressed = LZString.compressToBase64(str);
    AsyncLZString.decompressFromBase64(originalLZCompressed).then(
      (decompressed) => {
        expect(decompressed).toEqual(str);
        done();
      }
    );
  };
}

function testUtf16Compression(str: string): (done: () => void) => void {
  return (done) => {
    AsyncLZString.compressToUTF16(str).then((asyncLzResult) => {
      const originalLZResult = LZString.compressToUTF16(str);
      expect(asyncLzResult).toEqual(originalLZResult);
      done();
    });
  };
}

function testUtf16Decompression(str: string): (done: () => void) => void {
  return (done) => {
    const originalLZCompressed = LZString.compressToUTF16(str);
    AsyncLZString.decompressFromUTF16(originalLZCompressed).then(
      (decompressed) => {
        expect(decompressed).toEqual(str);
        done();
      }
    );
  };
}

describe("async-lz-string", () => {
  describe("compressToBase64", () => {
    it(
      "produces the same output as original lz-string for a null string",
      testBase64Compression(null)
    );

    it(
      "produces the same output as original lz-string for an empty string",
      testBase64Compression("")
    );

    it(
      "produces the same output as original lz-string for a single-letter string",
      testBase64Compression("a")
    );

    it(
      "produces the same output as original lz-string for a string containing a single non-ASCII letter",
      testBase64Compression("å")
    );

    it(
      "produces the same output as original lz-string for a string containing non-ASCII characters",
      testBase64Compression("åäö空手おじいさんåäö")
    );

    it(
      "produces the same output as original lz-string for a mixed ASCII/non-ASCII string",
      testBase64Compression("abcåäö")
    );

    it(
      "produces the same output as original lz-string for a random string",
      testBase64Compression(makeString(50000))
    );

    it(
      "produces the same output as original lz-string for a random long string",
      testBase64Compression(makeString(500000))
    );

    it("can be correctly decompressed", (done) => {
      const str = "aaabbccccd";
      AsyncLZString.compressToBase64(str).then((asyncLzResult) => {
        expect(LZString.decompressFromBase64(asyncLzResult)).toEqual(str);
        done();
      });
    });
  });

  describe("decompressFromBase64", () => {
    it(
      "produces the same output as original lz-string for a null string",
      testBase64Decompression(null)
    );

    it(
      "produces the same output as original lz-string for an empty string",
      testBase64Decompression("")
    );

    it(
      "correctly decompresses a single-letter string compressed by lz-string",
      testBase64Decompression("a")
    );

    it(
      "correctly decompresses a string containing a single non-ASCII letter compressed by lz-string",
      testBase64Decompression("å")
    );

    it(
      "correctly decompresses a string containing non-ASCII characters compressed by lz-string",
      testBase64Decompression("åäö空手おじいさんåäö")
    );

    it(
      "correctly decompresses a mixed ASCII/non-ASCII string compressed by lz-string",
      testBase64Decompression("abcåäö")
    );

    it(
      "correctly decompresses a random string compressed by lz-string",
      testBase64Decompression(makeString(50000))
    );

    it(
      "correctly decompresses a random long string compressed by lz-string",
      testBase64Decompression(makeString(500000))
    );
  });

  describe("compressToUTF16", () => {
    it(
      "produces the same output as original lz-string for a null string",
      testUtf16Compression(null)
    );

    it(
      "produces the same output as original lz-string for an empty string",
      testUtf16Compression("")
    );

    it(
      "produces the same output as original lz-string for a single-letter string",
      testUtf16Compression("a")
    );

    it(
      "produces the same output as original lz-string for a string containing a single non-ASCII letter",
      testUtf16Compression("å")
    );

    it(
      "produces the same output as original lz-string for a string containing non-ASCII characters",
      testUtf16Compression("åäö空手おじいさんåäö")
    );

    it(
      "produces the same output as original lz-string for a mixed ASCII/non-ASCII string",
      testUtf16Compression("abcåäö")
    );

    it(
      "produces the same output as original lz-string for a random string",
      testUtf16Compression(makeString(50000))
    );

    it(
      "produces the same output as original lz-string for a random long string",
      testUtf16Compression(makeString(500000))
    );

    it("can be correctly decompressed", (done) => {
      const str = "aaabbccccd";
      AsyncLZString.compressToUTF16(str).then((asyncLzResult) => {
        expect(LZString.decompressFromUTF16(asyncLzResult)).toEqual(str);
        done();
      });
    });
  });

  describe("decompressFromUTF16", () => {
    it(
      "produces the same output as original lz-string for a null string",
      testUtf16Decompression(null)
    );

    it(
      "produces the same output as original lz-string for an empty string",
      testUtf16Decompression("")
    );

    it(
      "correctly decompresses a single-letter string compressed by lz-string",
      testUtf16Decompression("a")
    );

    it(
      "correctly decompresses a string containing a single non-ASCII letter compressed by lz-string",
      testUtf16Decompression("å")
    );

    it(
      "correctly decompresses a string containing non-ASCII characters compressed by lz-string",
      testUtf16Decompression("åäö空手おじいさんåäö")
    );

    it(
      "correctly decompresses a mixed ASCII/non-ASCII string compressed by lz-string",
      testUtf16Decompression("abcåäö")
    );

    it(
      "correctly decompresses a random string compressed by lz-string",
      testUtf16Decompression(makeString(50000))
    );

    it(
      "correctly decompresses a random long string compressed by lz-string",
      testUtf16Decompression(makeString(500000))
    );
  });
});
