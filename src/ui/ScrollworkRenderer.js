export class ScrollworkRenderer {
  static drawCubicBezierCurve(graphics, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, steps = 16) {
    graphics.moveTo(p0x, p0y);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const invT = 1 - t;
      const invT2 = invT * invT;
      const invT3 = invT2 * invT;
      const t2 = t * t;
      const t3 = t2 * t;

      const x = invT3 * p0x + 3 * invT2 * t * p1x + 3 * invT * t2 * p2x + t3 * p3x;
      const y = invT3 * p0y + 3 * invT2 * t * p1y + 3 * invT * t2 * p2y + t3 * p3y;

      graphics.lineTo(x, y);
    }
  }

  static drawOrnateFrame(graphics, x, y, width, height, options = {}) {
    const {
      color = 0xC9A84C,
      lineWidth = 3,
      padding = 10,
      bgColor = 0x5C4033,
      bgAlpha = 0.8
    } = options;

    // Background
    graphics.fillStyle(bgColor, bgAlpha);
    graphics.fillRect(x, y, width, height);

    // Inner border
    graphics.lineStyle(1, color, 0.5);
    graphics.strokeRect(x + padding, y + padding, width - padding * 2, height - padding * 2);

    // Outer ornate border
    graphics.lineStyle(lineWidth, color, 1);
    
    const margin = padding / 2;
    const cornerSize = Math.min(width, height) * 0.15;
    
    // Draw straight lines connecting corners
    graphics.beginPath();
    graphics.moveTo(x + cornerSize, y + margin);
    graphics.lineTo(x + width - cornerSize, y + margin);
    
    graphics.moveTo(x + width - margin, y + cornerSize);
    graphics.lineTo(x + width - margin, y + height - cornerSize);
    
    graphics.moveTo(x + width - cornerSize, y + height - margin);
    graphics.lineTo(x + cornerSize, y + height - margin);
    
    graphics.moveTo(x + margin, y + height - cornerSize);
    graphics.lineTo(x + margin, y + cornerSize);
    graphics.strokePath();

    // Draw corners
    this.drawCornerFlourish(graphics, x + margin, y + margin, cornerSize, 0); // TL
    this.drawCornerFlourish(graphics, x + width - margin, y + margin, cornerSize, Math.PI / 2); // TR
    this.drawCornerFlourish(graphics, x + width - margin, y + height - margin, cornerSize, Math.PI); // BR
    this.drawCornerFlourish(graphics, x + margin, y + height - margin, cornerSize, -Math.PI / 2); // BL
  }

  static drawCornerFlourish(graphics, x, y, size, rotation) {
    const rotatePoint = (px, py, angle) => {
      return {
        x: px * Math.cos(angle) - py * Math.sin(angle),
        y: px * Math.sin(angle) + py * Math.cos(angle)
      };
    };

    // Draw a leaf/vine curve
    graphics.beginPath();
    let p0 = rotatePoint(0, size, rotation);
    let p1 = rotatePoint(size * 0.5, size * 0.8, rotation);
    let p2 = rotatePoint(size * 0.8, size * 0.5, rotation);
    let p3 = rotatePoint(size, 0, rotation);
    
    this.drawCubicBezierCurve(graphics, x + p0.x, y + p0.y, x + p1.x, y + p1.y, x + p2.x, y + p2.y, x + p3.x, y + p3.y);
    
    // Inner swirl
    p0 = rotatePoint(size * 0.2, size * 0.2, rotation);
    p1 = rotatePoint(size * 0.6, size * 0.2, rotation);
    p2 = rotatePoint(size * 0.6, size * 0.6, rotation);
    p3 = rotatePoint(size * 0.3, size * 0.4, rotation);
    
    this.drawCubicBezierCurve(graphics, x + p0.x, y + p0.y, x + p1.x, y + p1.y, x + p2.x, y + p2.y, x + p3.x, y + p3.y);

    graphics.strokePath();
  }

  static drawDivider(graphics, x, y, width) {
    const color = 0xC9A84C;
    graphics.lineStyle(2, color, 1);
    
    const midX = x + width / 2;
    
    graphics.beginPath();
    // Draw sweeping curve to center
    this.drawCubicBezierCurve(graphics, x, y, x + width * 0.25, y - 10, x + width * 0.4, y + 5, midX, y);
    // Continue
    this.drawCubicBezierCurve(graphics, midX, y, x + width * 0.6, y - 5, x + width * 0.75, y + 10, x + width, y);
    graphics.strokePath();

    // Center diamond
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    graphics.moveTo(midX, y - 6);
    graphics.lineTo(midX + 6, y);
    graphics.lineTo(midX, y + 6);
    graphics.lineTo(midX - 6, y);
    graphics.closePath();
    graphics.fillPath();
  }

  static drawCartouche(graphics, x, y, width, height) {
    const color = 0xC9A84C;
    graphics.fillStyle(0x081C15, 0.9);
    graphics.fillRoundedRect(x, y, width, height, height / 2);
    graphics.lineStyle(2, color, 1);
    graphics.strokeRoundedRect(x, y, width, height, height / 2);
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x + height / 2, y + height / 2, 4);
    graphics.fillCircle(x + width - height / 2, y + height / 2, 4);
  }

  static drawGolfHoleGoal(graphics, x, y, radius = 30, options = {}) {
    const {
      rimColor = 0xC9A84C,       // Brass/gold rim
      cupColor = 0x0A190E,       // Dark cup depression
      pinColor = 0xFFD700,       // Gold pin pole
      pennantColor = 0x00FF00,   // Green flag pennant (or Red 0xFF3333 for P1, Blue 0x3388FF for P2)
      pulseAlpha = 1.0
    } = options;

    // Outer grass ring shadow
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillCircle(x, y + 2, radius + 4);

    // Brass/gold cup rim ring
    graphics.lineStyle(4, rimColor, 1);
    graphics.fillStyle(cupColor, 1);
    graphics.fillCircle(x, y, radius);
    graphics.strokeCircle(x, y, radius);

    // Inner cup depth gradient / shadow
    graphics.fillStyle(0x000000, 0.6);
    graphics.fillCircle(x, y, radius * 0.65);

    // Glowing target center ring
    graphics.lineStyle(2, pennantColor, pulseAlpha);
    graphics.strokeCircle(x, y, radius * 0.45);

    // Golf Pin Pole (vertical brass rod)
    const poleHeight = 45;
    graphics.lineStyle(3, pinColor, 1);
    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.lineTo(x, y - poleHeight);
    graphics.strokePath();

    // Pin Pole Base Cap
    graphics.fillStyle(pinColor, 1);
    graphics.fillCircle(x, y, 4);

    // Pennant Flag at top of pin
    graphics.fillStyle(pennantColor, 1);
    graphics.beginPath();
    graphics.moveTo(x, y - poleHeight);
    graphics.lineTo(x + 22, y - poleHeight + 8);
    graphics.lineTo(x, y - poleHeight + 16);
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(1.5, 0xFFD700, 1);
    graphics.strokePath();
  }
}
