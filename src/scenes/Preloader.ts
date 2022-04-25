import Phaser from 'phaser';
import TextureKeys from '~/consts/TextureKeys';
import SceneKeys from '~/consts/SceneKeys';
import AnimationKeys from "~/consts/AnimationKeys";


export default class Preloader extends Phaser.Scene {


    constructor() {
        super(SceneKeys.Preloader)
    }

    preload() {
        this.load.image(TextureKeys.Coin, 'house/object_coin.png');

        // this.load.image(TextureKeys.Background, 'spaceship/bg_spaceship.png')
        // this.load.image(TextureKeys.Background1, 'spaceship/bg_spaceship_1.png')
        // this.load.image(TextureKeys.Background2, 'spaceship/bg_spaceship_2.png')
        // this.load.image(TextureKeys.Background3, 'spaceship/bg_spaceship_3.png')
        this.load.atlas(TextureKeys.RocketMouse, 'characters/rocket-mouse.png', 'characters/rocket-mouse.json')

        this.load.atlas(TextureKeys.EagleFly, 'characters/eagle/eagle.png', 'characters/eagle/eagle.json')

        // this.load.image(TextureKeys.LaserEnd, 'house/object_laser_end.png');
        // this.load.image(TextureKeys.LaserMiddle, 'house/object_laser.png');

        this.load.image(TextureKeys.Clouds, 'clouds/clouds-white.png');
        this.load.image(TextureKeys.CloudsSmall, 'clouds/clouds-white-small.png');

        this.load.image(TextureKeys.PlayerLeft, 'characters/hot-air-ballon-left.png');
        this.load.image(TextureKeys.PlayerRight, 'characters/hot-air-ballon-right.png');
        this.load.image(TextureKeys.PlayerNormal, 'characters/hot-air-ballon-normal.png');

        // this.load.image(TextureKeys.IslandHill, 'islands/island_hill.png');

        this.load.image(TextureKeys.LiveAvailable, 'characters/circle-gold-colored-01-heart-400.png');
        this.load.image(TextureKeys.LiveUsed, 'characters/circle-gold-mono-01-heart-400.png');
    }

    create() {
        this.anims.create({
            key: AnimationKeys.EagleFly,
            // helper to generate frames
            frames: this.anims.generateFrameNames(AnimationKeys.EagleFly, {
                start: 1,
                end: 8,
                prefix: 'fly_',
                zeroPad: 2,
                suffix: ''
            }),
            frameRate: 10,
            repeat: -1 // -1 to loop forever
        });

        // new fall animation
        this.anims.create({
            key: AnimationKeys.RocketMouseFall,
            frames: [{
                key: TextureKeys.RocketMouse,
                frame: 'rocketmouse_fall01.png'
            }]
        });

        this.anims.create({
            key: AnimationKeys.PlayerNormal,
            frames: [{
                key: TextureKeys.PlayerNormal,
                frame: 'PlayerNormal'
            }]
        });

        // // create the flames animation
        // this.anims.create({
        //     key: AnimationKeys.RocketFlamesOn,
        //     frames: this.anims.generateFrameNames(TextureKeys.RocketMouse,
        //         {start: 1, end: 2, prefix: 'flame', suffix: '.png'}),
        //     frameRate: 10,
        //     repeat: -1
        // })

        this.scene.start(SceneKeys.Game);
    }
}
