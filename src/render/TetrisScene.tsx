import { useEffect, useRef, useState } from "react";
import { IViewport } from "../engine/viewport/types";
import Viewport from "../engine/viewport/viewport";
import Board from "../engine/board/board";
import KeyboardUtil from "../utils/keyboard-util";
import Key from "../types/key";
import Score from "../engine/score/score";
import BackgroundUtil from "../engine/utils/background-util";

interface Props {

}

const TetrisScene: React.FC<Props> = () => {
    const [viewport, setViewport] = useState<IViewport>();
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!viewportRef.current) return;
        const viewport = new Viewport(viewportRef.current);
        const board = new Board();
        const score = new Score();

        const onKeyDown = (e: KeyboardEvent) => {
            if (KeyboardUtil.hasPressedKey(e.key, Key.ArrowLeft)) {
                board.moveActiveToLeftOrRight(-1);
            }
            if (KeyboardUtil.hasPressedKey(e.key, Key.ArrowRight)) {
                board.moveActiveToLeftOrRight(1);
            }
            if (KeyboardUtil.hasPressedKey(e.key, Key.ArrowDown)) {
                board.moveActiveToDown();
            }
            if (KeyboardUtil.hasPressedKey(e.key, Key.Control, Key.Meta, Key.Z)) {
                board.rotateCurrentBlock();
            }
            if (KeyboardUtil.hasPressedKey(e.key, Key.Space)) {
                viewport.shakeCamera(board.takeDownBlock());
            }
        };

        window.addEventListener('keydown', onKeyDown);

        viewport.render(board.getBoard());
        viewport.render(score.getScore());
        viewport.render(BackgroundUtil.createNightSky());
        viewport.render(BackgroundUtil.createStars());
        viewport.render(BackgroundUtil.createGrassFloor());

        setViewport(viewport);
        viewport.startLoop(() => {
            board.onUpdate();
            score.setScore(board.getScore());
        });

        return () => {
            viewport.renderer.dispose();
            viewportRef.current?.replaceChildren();
        };
    }, []);

    return <div ref={viewportRef} style={{ width: 1300, height: 800 }}></div>;
};

export default TetrisScene;