import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Palette, Eraser } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const colors = [
  { name: "vermelho", class: "bg-red-400", value: "#f87171" },
  { name: "azul", class: "bg-blue-400", value: "#60a5fa" },
  { name: "amarelo", class: "bg-yellow-400", value: "#facc15" },
  { name: "verde", class: "bg-green-400", value: "#4ade80" },
  { name: "roxo", class: "bg-purple-400", value: "#a78bfa" },
  { name: "rosa", class: "bg-pink-400", value: "#f472b6" },
];

export default function ColoringPage() {
  const [, setLocation] = useLocation();
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { data: child } = useQuery({
    queryKey: ["/api/child"],
  });

  const activityMutation = useMutation({
    mutationFn: async (data: { childId: number; activityType: string; duration: number }) => {
      return await apiRequest("POST", "/api/activity", data);
    },
  });

  useEffect(() => {
    if (startTime) {
      const handleBeforeUnload = () => {
        if (child?.id && startTime) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          if (duration > 0) {
            activityMutation.mutate({
              childId: child.id,
              activityType: "coloring",
              duration,
            });
          }
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [startTime, child?.id]);

  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Set up canvas
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 8;
        
        // Draw a simple butterfly outline
        drawButterfly(ctx);
      }
    }
  }, []);

  const drawButterfly = (ctx: CanvasRenderingContext2D) => {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Body
    ctx.moveTo(centerX, centerY - 60);
    ctx.lineTo(centerX, centerY + 60);
    
    // Left wing top
    ctx.moveTo(centerX, centerY - 30);
    ctx.quadraticCurveTo(centerX - 40, centerY - 60, centerX - 60, centerY - 20);
    ctx.quadraticCurveTo(centerX - 40, centerY, centerX, centerY - 30);
    
    // Left wing bottom
    ctx.moveTo(centerX, centerY);
    ctx.quadraticCurveTo(centerX - 30, centerY + 30, centerX - 50, centerY + 10);
    ctx.quadraticCurveTo(centerX - 30, centerY - 10, centerX, centerY);
    
    // Right wing top
    ctx.moveTo(centerX, centerY - 30);
    ctx.quadraticCurveTo(centerX + 40, centerY - 60, centerX + 60, centerY - 20);
    ctx.quadraticCurveTo(centerX + 40, centerY, centerX, centerY - 30);
    
    // Right wing bottom
    ctx.moveTo(centerX, centerY);
    ctx.quadraticCurveTo(centerX + 30, centerY + 30, centerX + 50, centerY + 10);
    ctx.quadraticCurveTo(centerX + 30, centerY - 10, centerX, centerY);
    
    // Antennae
    ctx.moveTo(centerX - 5, centerY - 60);
    ctx.lineTo(centerX - 15, centerY - 75);
    ctx.moveTo(centerX + 5, centerY - 60);
    ctx.lineTo(centerX + 15, centerY - 75);
    
    ctx.stroke();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 8;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawButterfly(ctx);
    }
  };

  const handleBack = () => {
    if (child?.id && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0) {
        activityMutation.mutate({
          childId: child.id,
          activityType: "coloring",
          duration,
        });
      }
    }
    setLocation("/menu");
  };

  return (
    <div className="min-h-screen p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          aria-label="Voltar para menu"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" aria-hidden="true" />
        </Button>

        <h2 className="text-child-xl font-bold text-gray-800">
          <Palette className="inline w-8 h-8 mr-3 text-purple-400" aria-hidden="true" />
          Colorir
        </h2>

        <div className="w-12 h-12"></div>
      </div>

      {/* Coloring Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drawing Canvas Area */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-xl">
              <CardContent className="p-6">
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 border-4 border-dashed border-gray-300 rounded-2xl cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  aria-label="Área de desenho - toque e arraste para colorir"
                />
              </CardContent>
            </Card>
          </div>

          {/* Color Palette */}
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-child-lg font-bold mb-6 text-gray-800 text-center">
                Escolha uma cor
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {colors.map((color) => (
                  <Button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform ${color.class} ${
                      selectedColor === color.value ? "ring-4 ring-gray-800" : ""
                    }`}
                    aria-label={`Cor ${color.name}`}
                  />
                ))}
              </div>

              {/* Clear Button */}
              <Button
                onClick={clearCanvas}
                className="button-large bg-gray-400 text-white font-bold mt-6 w-full hover:bg-gray-500"
                aria-label="Limpar desenho"
              >
                <Eraser className="w-5 h-5 mr-2" aria-hidden="true" />
                Limpar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
