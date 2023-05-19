# async-lz-string

This is a JavaScript library which compresses and decompresses strings. It implements the same algorithm as the [lz-string](https://github.com/pieroxy/lz-string) library but unlike that library this one is async and leaves time for other tasks to run while compressing/decompressing.

# About

The reason for complicating the original [lz-string](https://github.com/pieroxy/lz-string) library with async is that on slow devices it can take several seconds to compress long strings. If this wasn't done async the page would not be responsive to click events or anything during this time. So if compressing longer strings without causing the page to freeze is desired, async is the best option. If freezing the page is not a problem, the original [lz-string](https://github.com/pieroxy/lz-string) will likely have better performance and be simpler to use since it does not require using promises.

The asynchronicity is implemented by awaiting a timeout of 0 after a certain number of iterations. This will let the browser run event handlers before the next iteration. The number of iterations between waits is tuned to be a number which doesn't affect the time taken to compress too much while still being frequent enough to not cause significant delay in processing events.

# Use cases

Simply put: This project makes strings smaller. Why is that useful?

The first thing that comes to mind is `localStorage`. `localStorage` has limited space on many platforms, so if you for some reason need to store big strings in there this library can help you keep your strings small.

Note that the compression can be combined with `JSON.stringify` to compress any object that can be serialized to JSON.

The second thing that comes to mind is transfering things to the server. People on slow internet or with tight bandwidth caps will probably be happier if you transfer smaller amounts of data. Servers often GZip their responses but requests are usually not compressed in any way. If your requests are large enough it may be worth compressing them first, though it's not recommended that you always do it since it will make your code messier.

For a list of server side libraries implementing the same algorithm, see [this page](http://pieroxy.net/blog/pages/lz-string/index.html).

# Usage

Add `async-lz-string` to your package.json and install it.

There are four functions exported as a UMD module: `compressToUTF16, decompressFromUTF16, compressToBase64, and decompressFromBase64`. They do exactly what you expect them to do.

Example usage in TypeScript:

```typescript
import { compressToUTF16, decompressFromUTF16 } from "async-lz-string";

async function compressAndDecompress(str: string) {
  const compressed = await compressToUTF16(str);
  const decompressed = await decompressFromUTF16(compressed);
  console.log(str === decompressed); // true
}
```

# Development

If you want to change something in async-lz-string you are welcome to send a pull request.

To get started, run the following in your terminal:

```bash
git clone https://github.com/jackbister/async-lz-string.git
cd async-lz-string
npm install
npm run watch
```

You will now have the project and all its dependencies checked out, and webpack will be running in watch mode so your changes will be reflected immediately.

There are currently two ways you can test your changes:

- Running the test suite
  - There is a small test suite that ensures that the compressor and decompressor are compatible with the lz-string package.
  - To run this test suite once you can run `npm run test`
  - To run it in watch mode you can use `npm run start-test`
- Using npm link
  - If you have another project that uses async-lz-string you can use npm link to use your local copy of async-lz-string.
  - Run `npm link` in the async-lz-string directory
  - Run `npm link async-lz-string` in the other project's directory.
  - When you're done, run `npm unlink async-lz-string` in the other project's directory and `npm unlink` in the async-lz-string directory.
