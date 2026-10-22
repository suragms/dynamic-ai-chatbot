import React, { useEffect, useRef } from 'react';

interface Hero3DCanvasProps {
  isDark: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  color: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 440);

    // Color palettes
    const palette = isDark
      ? {
          primary: '#60a5fa',
          secondary: '#c084fc',
          accent: '#38bdf8',
          line: 'rgba(147, 197, 253, ',
          glow: 'rgba(99, 102, 241, 0.35)',
          core: '#818cf8',
        }
      : {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#0284c7',
          line: 'rgba(99, 102, 241, ',
          glow: 'rgba(99, 102, 241, 0.22)',
          core: '#6366f1',
        };

    // Generate 3D sphere points
    const points: Point3D[] = [];
    const numPoints = 85;
    const radius = Math.min(width, height) * 0.34;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      points.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        size: 1.8 + Math.random() * 2.2,
        color: i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.accent,
      });
    }

    // Outer orbital rings points
    const ringPoints: { angle: number; radius: number; speed: number; tilt: number; color: string }[] = [];
    for (let i = 0; i < 28; i++) {
      ringPoints.push({
        angle: (i / 28) * Math.PI * 2,
        radius: radius * 1.35,
        speed: 0.008 + (i % 2) * 0.004,
        tilt: Math.PI / 4,
        color: i % 2 === 0 ? palette.secondary : palette.accent,
      });
    }

    let angleX = 0;
    let angleY = 0;
    const fov = 380;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = nx * 0.8;
      mouseRef.current.targetY = ny * 0.8;
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isHovering = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      angleY += 0.006 + mouseRef.current.x * 0.01;
      angleX = Math.sin(time * 0.4) * 0.15 + mouseRef.current.y * 0.35;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw central pulsating halo
      const pulse = 1 + Math.sin(time * 2.2) * 0.08;
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius * 1.1 * pulse
      );
      gradient.addColorStop(0, palette.glow);
      gradient.addColorStop(0.6, isDark ? 'rgba(67, 56, 202, 0.12)' : 'rgba(99, 102, 241, 0.08)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.1 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Transform and project points
      const projected = points.map((p) => {
        // Rotate around Y
        let x1 = p.baseX * cosY - p.baseZ * sinY;
        let z1 = p.baseZ * cosY + p.baseX * sinY;

        // Rotate around X
        let y2 = p.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.baseY * sinX;

        // Perspective scale
        const scale = fov / (fov + z2);
        const x2d = centerX + x1 * scale;
        const y2d = centerY + y2 * scale;
        const alpha = Math.max(0.15, Math.min(1, (z2 + radius) / (radius * 2)));

        return { x: x2d, y: y2d, z: z2, scale, alpha, size: p.size * scale, color: p.color };
      });

      // Sort points by Z for depth rendering
      projected.sort((a, b) => a.z - b.z);

      // Draw interconnecting synaptic lines between close neighbors
      ctx.lineWidth = 1;
      const maxDist = 65;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.28 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `${palette.line}${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw outer 3D orbital ring
      ctx.save();
      for (const rp of ringPoints) {
        rp.angle += rp.speed;
        const rx = Math.cos(rp.angle) * rp.radius;
        const rz = Math.sin(rp.angle) * rp.radius;
        const ry = Math.sin(rp.angle) * Math.sin(rp.tilt) * (rp.radius * 0.5);

        // Apply global rotation
        let rx1 = rx * cosY - rz * sinY;
        let rz1 = rz * cosY + rx * sinY;
        let ry2 = ry * cosX - rz1 * sinX;
        let rz2 = rz1 * cosX + ry * sinX;

        const scale = fov / (fov + rz2);
        const ringX2d = centerX + rx1 * scale;
        const ringY2d = centerY + ry2 * scale;
        const ringAlpha = Math.max(0.2, Math.min(0.9, (rz2 + radius * 1.5) / (radius * 3)));

        ctx.fillStyle = rp.color;
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.arc(ringX2d, ringY2d, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw 3D nodes
      for (const p of projected) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.z > 0 ? 10 * p.scale : 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [isDark]);

  return (
    <div className="hero-3d-canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} className="hero-3d-canvas" />
    </div>
  );
};
