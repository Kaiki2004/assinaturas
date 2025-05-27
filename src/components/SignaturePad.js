import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 300 });

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.lineCap = 'round';
      setCtx(context);
    }
  }, [canvasSize]);

  const resizeCanvas = () => {
    const width = Math.min(window.innerWidth - 40, 500); // padding de 20px de cada lado
    const height = width * 0.6;  // proporção 5:3
    setCanvasSize({ width, height });
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (e) => {
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();  // evita scroll
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL('image/png');
    console.log('Base64 Assinatura:', dataURL);

    alert('Assinatura salva! Veja o console para Base64.');
  };

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ ...styles.canvas, width: '100%', height: 'auto' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div style={styles.buttons}>
        <button onClick={clearCanvas}>Limpar</button>
        <button onClick={saveSignature}>Salvar</button>
      </div>
    </div>
  );
};

export default SignaturePad;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px',
    width: '100%',
    maxWidth: '500px',
  },
  canvas: {
    border: '1px solid black',
    borderRadius: '8px',
    backgroundColor: '#fff',
    touchAction: 'none',
    display: 'block',
  },
  buttons: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
  },
};
