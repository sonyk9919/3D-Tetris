export const enum BlockType {
    I_TETROMINO, 
    O_TETROMINO, 
    T_TETROMINO, 
    S_TETROMINO, 
    Z_TETROMINO, 
    J_TETROMINO, 
    L_TETROMINO,
}

export const BLOCK_COLORS = [
    0xA8E6CF, // 민트
    0xDCEDC1, // 라이트 그린
    0xFFD3B6, // 피치 오렌지
    0xFFAAA5, // 코랄 핑크
    0xFF8B94, // 로즈 핑크
    0xDCE3FF, // 페일 블루
    0xFFFACD, // 라이트 옐로우  
    0xECECEC, // 파스텔 화이트/회색
] as const;