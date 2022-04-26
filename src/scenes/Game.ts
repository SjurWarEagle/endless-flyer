import Phaser from 'phaser';
import SceneKeys from "~/consts/SceneKeys";
import TextureKeys from '~/consts/TextureKeys';
import PlayerBalloon from "~/game/player-balloon";
import LiveDisplay from "~/game/LiveDisplay";
import AnimationKeys from "~/consts/AnimationKeys";

export default class Game extends Phaser.Scene {
    private CNT_COINS = 10;
    private CNT_EAGLES = 4;
    // create the background class property
    private player!: PlayerBalloon;
    private cloudsBig!: Phaser.GameObjects.TileSprite;
    private cloudsSmall!: Phaser.GameObjects.TileSprite;
    private coins!: Phaser.Physics.Arcade.StaticGroup;

    private scoreLabel!: Phaser.GameObjects.Text;
    private score = 0;
    private lifes = 3;
    private eagles!: Phaser.Physics.Arcade.StaticGroup;
    private liveDisplay!: LiveDisplay;

    public init() {
        this.score = 0;
        this.lifes = 3;
    }

    constructor() {
        super(SceneKeys.Game);
    }

    public create() {
        const height = this.scale.height;
        const width = this.scale.width;

        this.scale.displaySize.setAspectRatio(width / height);
        this.scale.refresh();


        this.cloudsSmall = this.add.tileSprite(0, 0, width, height, TextureKeys.CloudsSmall)
            .setOrigin(0, 0)
            .setScrollFactor(0, 0);
        this.cloudsBig = this.add.tileSprite(0, 0, width, height, TextureKeys.Clouds)
            .setOrigin(0, 0)
            .setScrollFactor(0, 0);

        this.liveDisplay = new LiveDisplay(this);

        this.add.existing(this.liveDisplay);

        this.coins = this.physics.add.staticGroup();
        this.spawnCoins();

        this.eagles = this.physics.add.staticGroup();
        this.spawnEagles();

        // add new RocketMouse
        this.player = new PlayerBalloon(this, width * 0.25, height - 100);
        this.add.existing(this.player);

        // error happens here
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setVelocityX(200);

        const marginWorld = height * (1 / 100);
        this.physics.world.setBounds(
            0, marginWorld, // x, y
            Number.MAX_SAFE_INTEGER,  // width
            height - 2 * marginWorld // height
        );

        this.cameras.main.startFollow(this.player);
        this.cameras.main.followOffset.set(-width * 0.35, 0);
        this.cameras.main.setBounds(100, 0, Number.MAX_SAFE_INTEGER, height);

        // this.physics.add.overlap(
        //     this.laserObstacle.top,
        //     this.player,
        //     this.handleTouchedGateBorder,
        //     undefined,
        //     this
        // );
        //

        this.physics.add.overlap(
            this.coins,
            this.player,
            this.handleCollectCoin,
            undefined,
            this
        );

        this.physics.add.overlap(
            this.eagles,
            this.player,
            this.handleTouchedEagle,
            undefined,
            this
        );

        this.scoreLabel = this.add.text(10, 10, `Score: ${this.score}`, {
            fontSize: '24px',
            color: '#d3d2d2',
            shadow: {fill: true, blur: 2, offsetX: 2, offsetY: 2, color: '#000000'},
            // padding: {left: 15, right: 15, top: 10, bottom: 10}
        }).setScrollFactor(0);

        // this.liveLabel = this.add.text(10, 50, `Lives: ${this.lifes}`, {
        //     fontSize: '12px',
        //     color: '#bbbbbb',
        //     backgroundColor: '#2646c6',
        //     shadow: {fill: true, blur: 0, offsetY: 0},
        //     padding: {left: 15, right: 15, top: 10, bottom: 10}
        // }).setScrollFactor(0)
        this.liveDisplay.updateLifes(this.lifes);

        this.input.mouse.disableContextMenu();
        this.input.mouse.enabled = true;
        this.input.on('pointerdown', () => {
            this.player.jump(true);
        });
        this.input.on('pointerup', () => {
            this.player.jump(false);
        });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.player.jump(true);
        });
        this.input.keyboard.on('keyup-SPACE', () => {
            this.player.jump(false);
        });

    }

    private handleTouchedEagle(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const player = obj1 as Phaser.Physics.Arcade.Sprite;
        const eagle = obj2 as Phaser.Physics.Arcade.Sprite;

        if (eagle.getData('touched')) {
            return;
        }
        eagle.body.enable=false;

        this.lifes--;
        this.liveDisplay.updateLifes(this.lifes);

        if (this.lifes <= 0) {
            this.player.kill();
        }
    }

    // noinspection JSUnusedLocalSymbols
    private handleCollectCoin(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        // eslint-disable-next-line
        const player = obj1 as Phaser.Physics.Arcade.Sprite
        const coin = obj2 as Phaser.Physics.Arcade.Sprite;
        // use the group to hide it
        this.coins.killAndHide(coin);
        // and turn off the physics body
        coin.body.enable = false;
        this.score++;
        this.scoreLabel.text = `Score: ${this.score}`;
        this.generateCoin();
    }

    private wrapCoins() {
        const scrollX = this.cameras.main.scrollX;

        this.coins.children.each(child => {
            const coin = child as Phaser.Physics.Arcade.Sprite;
            const body = coin.body as Phaser.Physics.Arcade.StaticBody;
            const width = body.width;

            if (coin.x + width < scrollX) {
                this.coins.killAndHide(coin);
                coin.body.enable = false;
                this.generateCoin();
            }
        });
    }

    private spawnEagles() {
        this.eagles.children.each(child => {
            const eagle = child as Phaser.Physics.Arcade.Sprite;
            this.coins.killAndHide(eagle);
            eagle.body.enable = false;
        });
        for (let cnt = 0; cnt < this.CNT_EAGLES; cnt++) {
            this.spawnEagle();
        }
    }

    private spawnEagle() {
        const width = this.scale.width;
        const height = this.scale.height;

        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        const x = rightEdge + Phaser.Math.Between(0, 2 * width);
        const y = Phaser.Math.Between(50, height - 50);

        const eagle = (this.eagles.get(x, y, TextureKeys.EagleFly) as Phaser.Physics.Arcade.Sprite)
            .setFlipX(true)
            .setOrigin(0.5, 1)
            .setScale(0.25)
            .play(AnimationKeys.EagleFly);

        eagle.setData('touched', false);

        const body = eagle.body as Phaser.Physics.Arcade.StaticBody;
        // body.setAccelerationY(-200);
        // body.setVelocityX(-20);
        eagle.setVisible(true);
        eagle.setActive(true);

        // body.setCircle(body.width * 0.015)
        body.enable = true;

        body.updateFromGameObject();
    }

    private wrapEagle() {
        // const width = this.scale.width;
        // const height = this.scale.height;

        const scrollX = this.cameras.main.scrollX;
        // const rightEdge = scrollX + this.scale.width


        this.eagles.children.each(child => {
            const eagle = child as Phaser.Physics.Arcade.Sprite;
            const body = eagle.body as Phaser.Physics.Arcade.StaticBody;
            const width = body.width;


            if (eagle.x + width < scrollX) {
                this.eagles.killAndHide(eagle);
                eagle.body.enable = false;
                this.spawnEagle();
            }

            // console.log(eagle.x,scrollX);

            // if (eagle.position.x < scrollX) {
            //     eagle.position.x = scrollX + width;
            //     eagle.position.y = Phaser.Math.Between(50, height - 50);
            //     // console.log(Phaser.Math.Between(50, height - 50));
            // }
        });
        // body variable with specific physics body type
        // const body = this.laserObstacle.body as
        //     Phaser.Physics.Arcade.StaticBody
        // // use the body's width
        // const width = body.width
        // if (this.laserObstacle.x + width < scrollX) {
        //     if (!this.laserObstacle.touched) {
        //         this.missedObstacle();
        //     }
        //     this.laserObstacle.x = Phaser.Math.Between(
        //         rightEdge + width,
        //         rightEdge + width + 1000
        //     )
        //     this.laserObstacle.y = Phaser.Math.Between(0, 300)
        //     // set the physics body's position
        //     // add body.offset.x to account for x offset
        //     body.position.x = this.laserObstacle.x + body.offset.x
        //     body.position.y = this.laserObstacle.y + body.offset.y;
        //     this.laserObstacle.touched = false;
        //
        //     this.laserObstacle.updateBorders();
        //     this.laserObstacle.resetTouched();
        // }
    }

    update() {
        // scroll the background
        // this.background.setTilePosition(this.cameras.main.scrollX);
        this.cloudsBig.setTilePosition(this.cameras.main.scrollX * 0.5);
        this.cloudsSmall.setTilePosition(this.cameras.main.scrollX * 0.25);

        // this.wrapLaserObstacle();
        this.wrapCoins();
        this.wrapEagle();
    }

    private spawnCoins() {
        // make sure all coins are inactive and hidden
        this.coins.children.each(child => {
            const coin = child as Phaser.Physics.Arcade.Sprite;
            this.coins.killAndHide(coin);
            coin.body.enable = false;
        });
        const numCoins = Phaser.Math.Between(1, this.CNT_COINS);

        for (let i = 0; i < numCoins; ++i) {
            this.generateCoin();
        }
    }

    private generateCoin() {
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;
        // start at 100 pixels past the right side of the screen
        const x = rightEdge + Phaser.Math.Between(100, 1000);

        const coin = this.coins.get(
            x,
            Phaser.Math.Between(100, this.scale.height - 100),
            TextureKeys.Coin
        ) as Phaser.Physics.Arcade.Sprite;

        const body = coin.body as Phaser.Physics.Arcade.StaticBody;

        // make sure coin is active and visible
        coin.setVisible(true);
        coin.setActive(true);

        // enable and adjust physics body to be a circle
        body.setCircle(body.width * 0.5);
        body.enable = true;

        // update the body x, y position from the GameObject
        body.updateFromGameObject();
    }
}
