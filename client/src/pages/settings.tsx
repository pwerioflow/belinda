import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Baby, BarChart3, Save, Cat, Dog, Heart, Music, Palette, Images } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const avatarOptions = [
  { value: "cat", icon: Cat, label: "Gato" },
  { value: "dog", icon: Dog, label: "Cachorro" },
  { value: "heart", icon: Heart, label: "Coração" },
];

const activityIcons = {
  music: Music,
  coloring: Palette,
  photos: Images,
};

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [childName, setChildName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("heart");
  const [timeLimit, setTimeLimit] = useState("30");

  const { data: userResponse } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: child } = useQuery({
    queryKey: ["/api/child"],
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activities", child?.id, new Date().toISOString().split("T")[0]],
    enabled: !!child?.id,
  });

  const updateChildMutation = useMutation({
    mutationFn: async (data: { name: string; avatar: string; timeLimit: number }) => {
      return await apiRequest("PUT", `/api/child/${child?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child"] });
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: { name: string; avatar: string; timeLimit: number }) => {
      return await apiRequest("POST", "/api/child", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child"] });
      toast({
        title: "Sucesso!",
        description: "Perfil da criança criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (child) {
      setChildName(child.name || "");
      setSelectedAvatar(child.avatar || "heart");
      setTimeLimit(child.timeLimit?.toString() || "30");
    }
  }, [child]);

  const isParent = userResponse?.user?.isParent;

  if (!isParent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <Card className="rounded-3xl shadow-xl">
          <CardContent className="p-8 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-child-lg font-bold mb-4 text-gray-800">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-6">
              Esta área é apenas para pais e responsáveis.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="button-large soft-blue text-white font-bold px-8 py-3"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    const data = {
      name: childName,
      avatar: selectedAvatar,
      timeLimit: parseInt(timeLimit),
    };

    if (child?.id) {
      updateChildMutation.mutate(data);
    } else {
      createChildMutation.mutate(data);
    }
  };

  // Calculate activity statistics
  const activityStats = activities.reduce((acc, activity) => {
    if (!acc[activity.activityType]) {
      acc[activity.activityType] = 0;
    }
    acc[activity.activityType] += activity.duration;
    return acc;
  }, {} as Record<string, number>);

  const totalTime = Object.values(activityStats).reduce((sum, time) => sum + time, 0);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)} min`;
  };

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

        <h2 className="text-child-xl font-bold text-gray-800">
          <Settings className="inline w-8 h-8 mr-3 text-gray-600" aria-hidden="true" />
          Configurações dos Pais
        </h2>

        <div className="w-12 h-12"></div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Baby Settings */}
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-child-lg font-bold mb-6 text-gray-800">
                <Baby className="inline w-6 h-6 mr-2 text-blue-400" aria-hidden="true" />
                Informações da Criança
              </h3>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="childName" className="block text-lg font-semibold mb-2 text-gray-700">
                    Nome:
                  </Label>
                  <Input
                    id="childName"
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="input-large w-full px-4"
                    placeholder="Nome da criança"
                  />
                </div>

                <div>
                  <Label className="block text-lg font-semibold mb-2 text-gray-700">
                    Avatar:
                  </Label>
                  <div className="flex space-x-3">
                    {avatarOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.value}
                          onClick={() => setSelectedAvatar(option.value)}
                          variant={selectedAvatar === option.value ? "default" : "outline"}
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedAvatar === option.value
                              ? "soft-blue text-white"
                              : "hover:bg-gray-100"
                          }`}
                          aria-label={`Avatar ${option.label}`}
                        >
                          <IconComponent className="w-6 h-6" aria-hidden="true" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="timeLimit" className="block text-lg font-semibold mb-2 text-gray-700">
                    Tempo de uso (minutos):
                  </Label>
                  <Select value={timeLimit} onValueChange={setTimeLimit}>
                    <SelectTrigger className="input-large w-full px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-child-lg font-bold mb-6 text-gray-800">
                <BarChart3 className="inline w-6 h-6 mr-2 text-yellow-400" aria-hidden="true" />
                Atividades de Hoje
              </h3>

              <div className="space-y-4">
                {Object.entries(activityStats).map(([activityType, duration]) => {
                  const IconComponent = activityIcons[activityType as keyof typeof activityIcons];
                  const activityNames = {
                    music: "Música",
                    coloring: "Colorir",
                    photos: "Fotos",
                  };
                  const activityName = activityNames[activityType as keyof typeof activityNames];

                  return (
                    <div
                      key={activityType}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl"
                    >
                      <div className="flex items-center">
                        {IconComponent && (
                          <IconComponent className="w-6 h-6 text-blue-400 mr-3" aria-hidden="true" />
                        )}
                        <span className="font-semibold">{activityName}</span>
                      </div>
                      <span className="text-gray-600">{formatTime(duration)}</span>
                    </div>
                  );
                })}

                {Object.keys(activityStats).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma atividade realizada hoje
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 mint-green rounded-2xl text-center">
                <p className="font-bold text-gray-800">
                  Total de hoje: {formatTime(totalTime)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSave}
            disabled={updateChildMutation.isPending || createChildMutation.isPending || !childName.trim()}
            className="button-large soft-blue text-white font-bold px-12 py-4 hover:bg-blue-400"
            aria-label="Salvar configurações"
          >
            {(updateChildMutation.isPending || createChildMutation.isPending) ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" aria-hidden="true" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
