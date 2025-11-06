class MathUtil {
    public static roundToHalf(number: number): number {
        return Math.round(number / 0.5) * 0.5
    }
}

export default MathUtil;