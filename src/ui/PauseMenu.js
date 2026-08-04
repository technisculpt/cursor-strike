import { ScrollworkRenderer } from './ScrollworkRenderer.js';
import { audioManager } from '../audio/AudioManager.js';

export class PauseMenu {
  constructor(scene, options = {}) {
    this.scene = scene;
    const { width, height } = scene.scale;
    
    this.onResume = options.onResume || (() => {});
    this.onRestart = options.onRestart || (() => {});
    this.onQuit = options.onQuit || (() => { this.scene.scene.start('MainMenu'); });

    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000); // Ensure it's on top
    this.container.alpha = 0;

    // Overlay
    const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);
    overlay.setInteractive(); // Block clicks to game
    this.container.add(overlay);

    // Panel
    const panelWidth = 400;
    const panelHeight = 450;
    const panelX = width / 2;
    const panelY = height / 2;

    const panelContainer = scene.add.container(panelX, panelY);
    this.container.add(panelContainer);

    const graphics = scene.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(graphics, -panelWidth/2, -panelHeight/2, panelWidth, panelHeight, {
      color: 0xC9A84C,
      lineWidth: 3,
      padding: 12,
      bgColor: 0x081C15,
      bgAlpha: 0.95
    });
    panelContainer.add(graphics);

    // Title
    panelContainer.add(scene.add.text(0, -panelHeight/2 + 60, 'PAUSED', {
      fontFamily: '"Cinzel", serif',
      fontSize: '40px',
      color: '#C9A84C',
      letterSpacing: 4
    }).setOrigin(0.5));

    const divGraphics = scene.add.graphics();
    ScrollworkRenderer.drawDivider(divGraphics, -100, -panelHeight/2 + 110, 200);
    panelContainer.add(divGraphics);

    // Buttons
    this.createButton(panelContainer, 0, -20, 'RESUME', () => {
      this.hide(this.onResume);
    });
    
    this.createButton(panelContainer, 0, 60, 'RESTART', () => {
      this.hide(this.onRestart);
    });
    
    this.createButton(panelContainer, 0, 140, 'QUIT TO MENU', () => {
      this.hide(this.onQuit);
    });
  }

  createButton(parent, x, y, text, callback) {
    const width = 250;
    const height = 60;
    const btnContainer = this.scene.add.container(x, y);
    btnContainer.setSize(width, height);
    btnContainer.setInteractive({ useHandCursor: true });

    const graphics = this.scene.add.graphics();
    ScrollworkRenderer.drawOrnateFrame(graphics, -width/2, -height/2, width, height, {
      color: 0xC9A84C,
      lineWidth: 2,
      padding: 5,
      bgColor: 0x5C4033,
      bgAlpha: 1
    });

    const btnText = this.scene.add.text(0, 0, text, {
      fontFamily: '"Cinzel", serif',
      fontSize: '24px',
      color: '#FFFFF0'
    }).setOrigin(0.5);

    btnContainer.add([graphics, btnText]);

    btnContainer.on('pointerover', () => {
      audioManager.playUIHover();
      this.scene.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 150 });
      btnText.setTint(0xC9A84C);
    });
    btnContainer.on('pointerout', () => {
      this.scene.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 150 });
      btnText.clearTint();
    });
    btnContainer.on('pointerup', () => {
      audioManager.playUIClick();
      callback();
    });

    parent.add(btnContainer);
  }

  show() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 250,
      ease: 'Power2'
    });
  }

  hide(callback) {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: callback
    });
  }
}
