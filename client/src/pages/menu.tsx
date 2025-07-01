import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music, Palette, Images } from "lucide-react";

export default function MenuPage() {
  const [, setLocation] = useLocation();

  const activities = [
    {
      id: "music",
      title: "Ouvir Música",
      description: "Escute músicas divertidas!",
      icon: Music,
      color: "soft-blue",
      route: "/music",
    },
    {
      id: "coloring",
      title: "Colorir",
      description: "Desenhe e pinte!",
      icon: Palette,
      color: "lilac",
      route: "/coloring",
    },
    {
      id: "photos",
      title: "Ver Fotos",
      description: "Veja imagens bonitas!",
      icon: Images,
      color: "soft-yellow",
      route: "/photos",
    },
  ];

  return (
    <div className="min-h-screen p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/")}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
          aria-label="Voltar para tela de boas-vindas"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" aria-hidden="true" />
        </Button>

        <h2 className="text-child-xl font-bold text-gray-800">Escolha uma atividade</h2>

        <div className="w-12 h-12"></div> {/* Spacer */}
      </div>

      {/* Activity Cards */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div
                key={activity.id}
                className="activity-card"
                onClick={() => setLocation(activity.route)}
                role="button"
                tabIndex={0}
                aria-label={`Atividade de ${activity.title.toLowerCase()}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setLocation(activity.route);
                  }
                }}
              >
                <div className={`w-20 h-20 ${activity.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <IconComponent className="text-white w-8 h-8" aria-hidden="true" />
                </div>
                <h3 className="text-child-lg font-bold mb-3 text-gray-800">{activity.title}</h3>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
