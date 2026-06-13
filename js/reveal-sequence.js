/**
 * Procedural scroll-synced reveal frames (replaces 341 JPG hero sequence)
 */
window.RevealSequence = {
  draw(ctx, cw, ch, progress) {
    const p = Math.min(1, Math.max(0, progress));
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, cw, ch);

    const cx = cw * 0.5;
    const cy = ch * 0.5;
    const scale = 0.15 + p * 0.85;
    const w = cw * scale;
    const h = ch * scale * 0.72;

    const grad = ctx.createLinearGradient(cx - w, cy - h, cx + w, cy + h);
    grad.addColorStop(0, '#ff6ec7');
    grad.addColorStop(0.35, '#7873f5');
    grad.addColorStop(0.65, '#22d3ee');
    grad.addColorStop(1, '#4ade80');

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p * Math.PI * 0.12);
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(2, cw * 0.004);
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.globalAlpha = 0.15 + p * 0.55;
    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + p * 2;
      const r = Math.min(w, h) * (0.25 + p * 0.35);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.strokeStyle = `hsla(${280 + i * 30}, 90%, 70%, ${0.2 + p * 0.5})`;
      ctx.stroke();
    }
    ctx.restore();

    ctx.globalAlpha = 0.08 + p * 0.25;
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
    rg.addColorStop(0, '#ffffff');
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
  },
};
