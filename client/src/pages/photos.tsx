import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PhotosPage() {
  const [, setLocation] = useLocation();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { data: child } = useQuery({
    queryKey: ["/api/child"],
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["/api/photos"],
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
              activityType: "photos",
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        previousPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPhotoIndex, photos.length]);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const previousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const showPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const handleBack = () => {
    if (child?.id && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0) {
        activityMutation.mutate({
          childId: child.id,
          activityType: "photos",
          duration,
        });
      }
    }
    setLocation("/menu");
  };

  if (photos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-child-lg text-gray-600">Carregando fotos...</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

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
          <Images className="inline w-8 h-8 mr-3 text-yellow-400" aria-hidden="true" />
          Fotos Bonitas
        </h2>

        <div className="w-12 h-12"></div>
      </div>

      {/* Photo Gallery */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Current Photo Display */}
          <Card className="rounded-3xl shadow-xl mb-8">
            <CardContent className="p-6 text-center">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt}
                className="rounded-2xl shadow-lg w-full h-auto max-h-96 object-cover mx-auto"
                loading="lazy"
              />
              <p className="text-child-lg font-semibold mt-4 text-gray-800">
                {currentPhoto.title}
              </p>
            </CardContent>
          </Card>

          {/* Photo Navigation */}
          <div className="flex justify-center space-x-6 mb-8">
            <Button
              onClick={previousPhoto}
              disabled={photos.length <= 1}
              className="button-large soft-blue text-white font-bold px-8 py-4 hover:bg-blue-400"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Anterior
            </Button>

            <Button
              onClick={nextPhoto}
              disabled={photos.length <= 1}
              className="button-large soft-blue text-white font-bold px-8 py-4 hover:bg-blue-400"
              aria-label="Próxima foto"
            >
              Próxima
              <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {photos.map((photo, index) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.alt}
                  className={`w-full h-20 object-cover rounded-xl shadow cursor-pointer hover:scale-105 transition-transform ${
                    index === currentPhotoIndex ? "ring-4 ring-blue-400" : ""
                  }`}
                  onClick={() => showPhoto(index)}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
