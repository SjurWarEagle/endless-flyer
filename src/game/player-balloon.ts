import Phaser from 'phaser';
import TextureKeys from '../consts/TextureKeys';
import AnimationKeys from '../consts/AnimationKeys';
import SceneKeys from "~/consts/SceneKeys";
import {PlayerState} from "~/game/PlayerState";

export default class PlayerBalloon extends Phaser.GameObjects.Container {
    private flames: Phaser.GameObjects.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private player: Phaser.GameObjects.Image;
    private mouseState = PlayerState.Normal;
    private mousebody: Phaser.Physics.Arcade.Body;
    private overlay: any;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const imageScale = 1 / 8;
        // const imageScale=0.25;

        // create the flames and play the animation
        this.player = scene.add.image(0, 0, TextureKeys.PlayerNormal)
            // .setOrigin(0.25, 0.25)
            .setOrigin(0.5, 1)
            .setScale(imageScale);
        this.flames = scene.add.sprite(0, -30, TextureKeys.RocketMouse)
            .setOrigin(0, 1)
            .setScale(0.25)
            .setRotation(2.7)
            .play(AnimationKeys.RocketFlamesOn);

        this.enableJetpack(false);
        // create the Rocket Mouse sprite
        // .play(AnimationKeys.PlayerNormal);
        // this.player = scene.add.sprite(0, 0, TextureKeys.RocketMouse)
        //     .setOrigin(0.5, 1)
        //     .play(AnimationKeys.RocketMouseRun);
        // add as child of Container
        this.add(this.flames);
        this.add(this.player);

        scene.physics.add.existing(this);
        // this.body = this.body as Phaser.Physics.Arcade.Body;

        // adjust physics body size and offset
        this.mousebody = this.body as Phaser.Physics.Arcade.Body;
        this.mousebody.setSize(this.player.width, this.player.height);
        // this.mousebody.setOffset(this.player.width * -0.5, -this.player.height);

        // get a CursorKeys instance
        this.cursors = scene.input.keyboard.createCursorKeys();
        // use half width and 70% of height
        this.mousebody.setSize(this.player.width * imageScale, this.player.height * imageScale);
        // this.mousebody.setOffset(this.player.width * -0.25, -this.player.height*0.5 + 15);
        this.mousebody.setOffset(-this.player.width * imageScale / 2, this.player.height * -imageScale);

        this.overlay = scene.add.graphics({
            x: 0,
            y: 0
        })
            .fillStyle(0xff0000, 0.75)
            .fillEllipse(0, -65, 60, 80)
            // .fillRect(-30,-100,60,100)
            .setAlpha(0);
        this.add(this.overlay);
    }

    preUpdate() {
        switch (this.mouseState) {
            // move all previous code into this case
            case PlayerState.Normal: {
                // if (this.cursors.space?.isDown) {
                //     this.jump(true);
                // } else {
                //     // this.jump(false);
                // }
                this.body = this.body as Phaser.Physics.Arcade.Body;
                if (this.body.blocked.down) {
                    // this.player.play(AnimationKeys.RocketMouseRun, true);
                } else if (this.body.velocity.y > 0) {
                    // this.player.play(AnimationKeys.RocketMouseFall, true);
                }
                // don't forget the break statement
                break;
            }
            case PlayerState.Killed: {
                // reduce velocity to 99% of current value
                this.mousebody.velocity.x *= 0.99;
                // once less than 5 we can say stop
                if (this.mousebody.velocity.x <= 5) {
                    this.mouseState = PlayerState.Dead;
                }
                break;
            }
            case PlayerState.Dead: {
                // make a complete stop
                this.mousebody.setVelocity(0, 0);
                this.scene.scene.run(SceneKeys.GameOver);
                break;
            }
        }

    }

    enableJetpack(enabled: boolean) {
        this.flames.setVisible(enabled);
    }

    jump(active: boolean) {
        if (active) {
            if ((this.mouseState == PlayerState.Killed)
                || (this.mouseState == PlayerState.Dead)) {
                return;
            }
            this.mousebody.setAccelerationY(-600);
            this.enableJetpack(true);
            // this.player.play(AnimationKeys.RocketMouseFly, true);
        } else {
            this.mousebody.setAccelerationY(0);
            this.enableJetpack(false);
            // this.player.play(AnimationKeys.RocketMouseFall, true);
        }

    }

    hit() {
        // this.mousebody.set
        // this.player.setTint(0xffff00);
        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 0.75,
            ease: 'Cubic.easeOut',
            duration: 100,
            repeat: 0,
            yoyo: true
        });

    }

    kill() {
        // don't do anything if not in RUNNING state
        if ((this.mouseState == PlayerState.Killed)
            || (this.mouseState == PlayerState.Dead)) {
            return;
        }
        // set state to KILLED
        this.mouseState = PlayerState.Killed;
        // this.player.play(AnimationKeys.RocketMouseDead)
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAccelerationY(0);
        body.setVelocity(400, 0);
        this.enableJetpack(false);
    }

    setVisible(value: boolean): this {
        return super.setVisible(value);
    }
}
