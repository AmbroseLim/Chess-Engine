declare module 'stockfish.wasm' {
  interface Stockfish {
    postMessage(command: string): void;
    onmessage: ((e: MessageEvent | string) => void) | null;
  }

  function Stockfish(): Promise<Stockfish>;

  export = Stockfish;
}