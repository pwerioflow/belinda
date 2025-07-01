import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, Star, Sun, Leaf } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const iconMap = {
  star: Star,
  sun: Sun,
  leaf: Leaf,
};

const colorMap = {
  "soft-blue": "soft-blue",
  "lilac": "lilac",
  "mint-green": "mint-green",
};

export default function MusicPage() {
  const [, setLocation] = useLocation();
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: userResponse } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: child } = useQuery({
    queryKey: ["/api/child"],
  });

  const { data: songs = [] } = useQuery({
    queryKey: ["/api/songs"],
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
              activityType: "music",
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
  }, []);

  const handlePlayPause = (songIndex: number) => {
    if (currentPlaying === songIndex) {
      // Pause current song
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentPlaying(null);
    } else {
      // Play new song
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // For demo purposes, we'll play a simple tone
      // In production, you would load the actual audio file
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different songs
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      oscillator.frequency.setValueAtTime(frequencies[songIndex] || 523.25, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 3);
      
      setCurrentPlaying(songIndex);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCurrentPlaying(null);
      }, 3000);
    }
  };

  const handleBack = () => {
    if (child?.id && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0) {
        activityMutation.mutate({
          childId: child.id,
          activityType: "music",
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
          <Star className="inline w-8 h-8 mr-3 text-blue-400" aria-hidden="true" />
          Músicas
        </h2>

        <div className="w-12 h-12"></div>
      </div>

      {/* Music Player Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {songs.map((song, index) => {
            const IconComponent = iconMap[song.icon as keyof typeof iconMap] || Star;
            const colorClass = colorMap[song.color as keyof typeof colorMap] || "soft-blue";
            const isPlaying = currentPlaying === index;

            return (
              <Card key={song.id} className="rounded-3xl shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="text-white w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-child-lg font-bold mb-4 text-gray-800">{song.title}</h3>
                  <Button
                    onClick={() => handlePlayPause(index)}
                    className={`button-large ${colorClass} text-white font-bold px-8 py-3 w-full ${
                      song.color === "mint-green" ? "text-gray-800" : ""
                    }`}
                    aria-label={`${isPlaying ? "Pausar" : "Tocar"} música ${song.title}`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 mr-2" aria-hidden="true" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" aria-hidden="true" />
                    )}
                    {isPlaying ? "Pausar" : "Tocar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
