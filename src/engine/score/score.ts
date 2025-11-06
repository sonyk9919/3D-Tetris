import { Text } from "troika-three-text";
import gsap from "gsap";

class Score {
    private score: any = new Text();

    public constructor() {
        this.setup();
        this.setScore(0);
    }

    private setup() {
        this.score.fontSize = 2;
        this.score.position.set(8, 14, 2);
        this.score.scale.set(1, 1, 1);
        this.setFontColorRandomly();
    }

    public getScore(): any {
        return this.score;
    }

    private setFontColorRandomly(): void {
        this.score.color = Math.floor(Math.random() * 0xffffff);
    }

    public setScore(score: number): void {
        if (this.score.text === score) return;
        this.score.text = score;
        this.setFontColorRandomly();

        this.score.sync(() => {
            gsap.killTweensOf(this.score.scale);
            gsap.fromTo(
                this.score.scale,
                { x: 1.4, y: 1.4, z: 1.4 },
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.25,
                    ease: "back.out(2.5)"
                }
            );
        });
    }
}

export default Score;
