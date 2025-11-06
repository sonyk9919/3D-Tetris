import Key from "../types/key";

class KeyboardUtil {
   public static hasPressedKey(pressed: string, ...target: Key[]): boolean {
      return target.some(t => t === pressed);
   }
}

export default KeyboardUtil;