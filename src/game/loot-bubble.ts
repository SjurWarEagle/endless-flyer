import Phaser from "phaser";
import TextureKeys from "~/consts/TextureKeys";
import AnimationKeys from "~/consts/AnimationKeys";

export class LootBubble extends Phaser.GameObjects.Container {
    private bubble: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        const width = 60;
        const height = 50;

        const bubble = scene.add.sprite(width / 2, height / 2, TextureKeys.Bubble)
            .setDisplaySize(width, height)
            //TODO .setOrigin(-0.3, -0.3)
            .play(AnimationKeys.Bubble)


        const coin = scene.add.sprite(width / 2, height / 2, TextureKeys.Coin)
            .setDisplaySize(width * 0.75, height * 0.75)
        //TODO .setOrigin(-0.3, -0.3)

        this.add(coin);
        this.add(bubble);

        scene.physics.add.existing(this);
        scene.add.existing(bubble);
        this.bubble = this.body as Phaser.Physics.Arcade.Body;

        this.initSpeed();

        this.bubble.updateFromGameObject();
        this.bubble.setCollideWorldBounds(false);

        scene.add.existing(this);
        this.visible = true;
        this.bubble.enable = true;
    }

    preUpdate() {
        this.body = this.body as Phaser.Physics.Arcade.Body;
    }

    initSpeed() {
        const gravity = -200;
        const deltaY = Phaser.Math.Between(-5, 5);
        const deltaX = Phaser.Math.Between(-2, 2);
        this.bubble.setAccelerationY(gravity + deltaY);
        this.bubble.setAccelerationX(deltaX);
        this.bubble.setVelocity(0, 0);
    }
}
