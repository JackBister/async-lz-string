import { wait } from "./wait";

export interface IDecompressor {
    decompress(length: number, resetValue: number, getNextValue: (a: number) => number);
}

interface IDecompressionContext {
    bits: number;

    c: string | number;

    dataIndex: number;
    dataPosition: number;
    dataVal: number;

    dictionary: Map<number, number>;
    dictSize: number;

    enlargeIn: number;

    entry: string | number;

    maxPower: number;

    numBits: number;

    power: number;

    resb: number;

    result: string[];

    w: string;
}

export class DecompressorImpl implements IDecompressor {
    public decompress(length: number, resetValue: number, getNextValue: (a: number) => number): Promise<string> {
        return new Promise(async (resolve) => {
            let context: IDecompressionContext = {
                bits: 0,

                c: null,

                dataIndex: 1,
                dataPosition: resetValue,
                dataVal: getNextValue(0),

                dictionary: new Map<number, number>(),
                dictSize: 4,

                enlargeIn: 4,

                entry: "",

                maxPower: Math.pow(2, 2),

                numBits: 3,

                power: 1,

                resb: null,

                result: [],

                w: null
            };

            for (let i = 0; i < 3; i += 1) {
                context.dictionary.set(i, i);
            }

            while (context.power != context.maxPower) {
                context.resb = context.dataVal & context.dataPosition;
                context.dataPosition >>= 1;
                if (context.dataPosition == 0) {
                    context.dataPosition = resetValue;
                    context.dataVal = getNextValue(context.dataIndex++);
                }
                context.bits |= (context.resb > 0 ? 1 : 0) * context.power;
                context.power <<= 1;
            }

            const next = context.bits;
            switch (next) {
                case 0:
                    context.bits = 0;
                    context.maxPower = Math.pow(2, 8);
                    context.power = 1;
                    while (context.power != context.maxPower) {
                        context.resb = context.dataVal & context.dataPosition;
                        context.dataPosition >>= 1;
                        if (context.dataPosition == 0) {
                            context.dataPosition = resetValue;
                            context.dataVal = getNextValue(context.dataIndex++);
                        }
                        context.bits |= (context.resb > 0 ? 1 : 0) * context.power;
                        context.power <<= 1;
                    }
                    context.c = String.fromCharCode(context.bits);
                    break;
                case 1:
                    context.bits = 0;
                    context.maxPower = Math.pow(2, 16);
                    context.power = 1;
                    while (context.power !== context.maxPower) {
                        context.resb = context.dataVal & context.dataPosition;
                        context.dataPosition >>= 1;
                        if (context.dataPosition === 0) {
                            context.dataPosition = resetValue;
                            context.dataVal = getNextValue(context.dataIndex++);
                        }
                        context.bits |= (context.resb > 0 ? 1 : 0) * context.power;
                        context.power <<= 1;
                    }
                    context.c = String.fromCharCode(context.bits);
                    break;
                case 2:
                    resolve("");
                    return;
            }
            context.dictionary[3] = context.c;
            context.w = context.c as string;
            context.result.push(context.c as string);
            let iteration = 1;
            while (true) {
                if (iteration % 20000 === 0) {
                    await wait();
                }
                if (context.dataIndex > length) {
                    resolve("");
                    return;
                }

                context.bits = 0;
                context.maxPower = Math.pow(2, context.numBits);
                context.power = 1;
                while (context.power != context.maxPower) {
                    context.resb = context.dataVal & context.dataPosition;
                    context.dataPosition >>= 1;
                    if (context.dataPosition == 0) {
                        context.dataPosition = resetValue;
                        context.dataVal = getNextValue(context.dataIndex++);
                    }
                    context.bits |= (context.resb > 0 ? 1 : 0) * context.power;
                    context.power <<= 1;
                }
                switch (context.c = context.bits) {
                    case 0:
                        context.bits = 0;
                        context.maxPower = Math.pow(2, 8);
                        context.power = 1;
                        while (context.power !== context.maxPower) {
                            context.resb = context.dataVal & context.dataPosition;
                            context.dataPosition >>= 1;
                            if (context.dataPosition == 0) {
                                context.dataPosition = resetValue;
                                context.dataVal = getNextValue(context.dataIndex++);
                            }
                            context.bits |= (context.resb > 0 ? 1 : 0) * context.power;
                            context.power <<= 1;
                        }

                        context.dictionary[context.dictSize++] = String.fromCharCode(context.bits);
                        context.c = context.dictSize - 1;
                        context.enlargeIn--;
                        break;
                    case 1:
                        context.bits = 0;
                        context.maxPower = Math.pow(2, 16);
                        context.power = 1;
                        while (context.power !== context.maxPower) {
                            context.resb = context.dataVal & context.dataPosition;
                            context.dataPosition >>= 1;
                            if (context.dataPosition == 0) {
                                context.dataPosition = resetValue;
                                context.dataVal = getNextValue(context.dataIndex++);
                            }
                            context.bits |= (context.resb > 0 ? 1 : 0) * context.power;
                            context.power <<= 1;
                        }
                        context.dictionary[context.dictSize++] = String.fromCharCode(context.bits);
                        context.c = context.dictSize - 1;
                        context.enlargeIn--;
                        break;
                    case 2:
                        resolve(context.result.join(''));
                        return;
                }

                if (context.enlargeIn == 0) {
                    context.enlargeIn = Math.pow(2, context.numBits);
                    context.numBits++;
                }

                if (context.dictionary[context.c]) {
                    context.entry = context.dictionary[context.c];
                } else {
                    if (context.c === context.dictSize) {
                        context.entry = context.w + context.w.charAt(0);
                    } else {
                        resolve(null);
                        return;
                    }
                }
                context.result.push(context.entry as string);

                // Add w+entry[0] to the dictionary.
                context.dictionary[context.dictSize++] = context.w + (context.entry as string).charAt(0);
                context.enlargeIn--;

                context.w = context.entry as string;

                if (context.enlargeIn == 0) {
                    context.enlargeIn = Math.pow(2, context.numBits);
                    context.numBits++;
                }

                iteration++;
            }
        });
    }
}
