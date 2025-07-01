import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings, Play, Cat, Dog, Heart } from "lucide-react";

const avatarIcons = {
  cat: Cat,
  dog: Dog,
  heart: Heart,
};

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  const { data: userResponse } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: child } = useQuery({
    queryKey: ["/api/child"],
  });

  const isParent = userResponse?.user?.isParent;
  const childName = child?.name || "Visitante";
  const avatarType = child?.avatar || "heart";
  const AvatarIcon = avatarIcons[avatarType as keyof typeof avatarIcons] || Heart;

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative">
      <div className="text-center max-w-lg mx-auto">
        {/* Greeting */}
        <h1 className="text-child-xl font-bold mb-8 text-gray-800">
          Olá, <span className="text-blue-500">{childName}</span>! 🌟
        </h1>

        {/* Avatar */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <AvatarIcon className="text-white w-16 h-16" aria-hidden="true" />
          </div>
          <p className="text-child-lg text-gray-600 mt-4 font-semibold">Que bom te ver aqui!</p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => setLocation("/menu")}
          className="button-large mint-green text-gray-800 font-bold px-12 py-4 hover:bg-green-300"
          aria-label="Continuar para as atividades"
        >
          <Play className="w-6 h-6 mr-3" aria-hidden="true" />
          Vamos brincar!
        </Button>

        {/* Settings Icon (visible only for parents) */}
        {isParent && (
          <div className="absolute top-6 right-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/settings")}
              className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
              aria-label="Configurações para pais"
            >
              <Settings className="w-6 h-6 text-gray-600" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
