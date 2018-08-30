import { wait } from "./wait";

const REV = [
    0x0,
    0x8,
    0x4,
    0xc,
    0x2,
    0xa,
    0x6,
    0xe,
    0x1,
    0x9,
    0x5,
    0xd,
    0x3,
    0xb,
    0x7,
    0xf,
];

function reverseBits(n: number, numNibbles: number) {
    let ret = 0;

    for (let i = 0; i < numNibbles; ++i) {
        ret <<= 4;
        ret |= REV[n & 0xF];
        n >>= 4;
    }

    return ret;
}

export interface ICompressor {
    compress(uncompressed: string, bitsPerChar: number, getCharFromInt: (a: number) => string);
}

interface ICompressorContext {
    // return value
    data: string[];
    // which bit in dataVal we should write next
    dataPosition: number;

    // value that will be added to data when dataPosition > numBits - 1
    dataVal: number;

    dictionary: Map<string, number>;
    dictionaryToCreate: Map<string, boolean>;
    dictSize: number;

    enlargeIn: number;

    numBits: number;

    // Current string context
    w: string;
}

export class CompressorImpl implements ICompressor {
    private static writeValueToData(context: ICompressorContext, value: number, bitsToWrite: number, bitsPerChar: number, getCharFromInt: (a: number) => string) {
        if (bitsToWrite % 4 !== 0 || context.dataPosition + bitsToWrite > bitsPerChar - 1) {
            for (let i = 0; i < bitsToWrite; i++) {
                context.dataVal = (context.dataVal << 1) | (value & 1);
                if (context.dataPosition == bitsPerChar - 1) {
                    context.dataPosition = 0;
                    context.data.push(getCharFromInt(context.dataVal));
                    context.dataVal = 0;
                } else {
                    context.dataPosition++;
                }
                value >>= 1;
            }
        } else {
            // Fast + simple path for case where iterations is divisible by 4 and we don't spill into a new character
            context.dataVal <<= bitsToWrite;
            context.dataVal |= reverseBits(value, bitsToWrite / 4);
            context.dataPosition += bitsToWrite;
        }
    }

    private static writeWToDataVal(context: ICompressorContext, bitsPerChar: number, getCharFromInt: (a: number) => string) {
        if (context.dictionaryToCreate.has(context.w)) {
            if (context.w.charCodeAt(0) < 256) {
                CompressorImpl.writeValueToData(context, 0, context.numBits, bitsPerChar, getCharFromInt);

                CompressorImpl.writeValueToData(context, context.w.charCodeAt(0), 8, bitsPerChar, getCharFromInt);
            } else {
                CompressorImpl.writeValueToData(context, 1, context.numBits, bitsPerChar, getCharFromInt);

                CompressorImpl.writeValueToData(context, context.w.charCodeAt(0), 16, bitsPerChar, getCharFromInt);
            }
            context.enlargeIn--;
            if (context.enlargeIn == 0) {
                context.enlargeIn = Math.pow(2, context.numBits);
                context.numBits++;
            }
            context.dictionaryToCreate.delete(context.w);
        } else {
            CompressorImpl.writeValueToData(context, context.dictionary.get(context.w), context.numBits, bitsPerChar, getCharFromInt);
        }
        context.enlargeIn--;
        if (context.enlargeIn == 0) {
            context.enlargeIn = Math.pow(2, context.numBits);
            context.numBits++;
        }
    }

    private static loopIteration(uncompressed: string, ii: number, bitsPerChar: number, getCharFromInt: (a: number) => string, context: ICompressorContext) {
        const context_c = uncompressed.charAt(ii);
        if (!context.dictionary.has(context_c)) {
            context.dictionary.set(context_c, context.dictSize++);
            context.dictionaryToCreate.set(context_c, true)
        }

        const context_wc = context.w + context_c;

        if (context.dictionary.has(context_wc)) {
            // we have seen the string contained in context_wc before. Update context so on next iteration we will continue building on this string.
            context.w = context_wc;
        } else {
            this.writeWToDataVal(context, bitsPerChar, getCharFromInt);
            context.dictionary.set(context_wc, context.dictSize++);
            context.w = String(context_c);
        }
    }

    public compress(uncompressed: string, bitsPerChar: number, getCharFromInt: (a: number) => string): Promise<string> {
        return new Promise(async (resolve) => {
            if (uncompressed == null) {
                resolve("");
                return;
            }

            let context: ICompressorContext = {
                data: [],
                dataPosition: 0,
                dataVal: 0,
                dictionary: new Map<string, number>(),
                dictionaryToCreate: new Map<string, boolean>(),
                dictSize: 3,
                enlargeIn: 2,
                numBits: 2,
                w: "",
            };

            for (let ii = 0; ii < uncompressed.length; ii += 1) {
                CompressorImpl.loopIteration(uncompressed, ii, bitsPerChar, getCharFromInt, context);
                if (ii % 10000 === 0) {
                    await wait();
                }
            }

            // Output the code for w.
            if (context.w !== "") {
                CompressorImpl.writeWToDataVal(context, bitsPerChar, getCharFromInt);
            }

            CompressorImpl.writeValueToData(context, 2, context.numBits, bitsPerChar, getCharFromInt);

            context.dataVal <<= bitsPerChar - context.dataPosition;
            context.data.push(getCharFromInt(context.dataVal));

            resolve(context.data.join(''));
        });
    }
}
