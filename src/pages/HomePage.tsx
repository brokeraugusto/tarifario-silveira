
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import StatisticsCards from '@/components/home/StatisticsCards';
import PerformanceCharts from '@/components/home/PerformanceCharts';

const HomePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="text-center pt-4 md:pt-10 pb-4 md:pb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-hotel-navy">Tarifário Silveira Eco Village</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">Sistema de gestão de acomodações e valores</p>
      </div>
      
      <div className="bg-hotel-navy text-white p-4 md:p-8 rounded-lg shadow-lg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-hotel-gold text-center">Bem-vindo ao Painel de Gestão</h2>
          <p className="mt-2 text-sm md:text-base text-center text-zinc-200">
            Use o sistema para buscar valores de acomodações, gerenciar dados e configurar preços por períodos.
          </p>
          
          <div className="mt-4 md:mt-6 flex justify-center">
            <Button 
              variant="secondary" 
              size={isMobile ? "default" : "lg"} 
              onClick={() => navigate('/search')} 
              className="bg-hotel-gold text-hotel-navy hover:bg-hotel-lightgold font-medium"
            >
              <Search className="mr-2 h-5 w-5" />
              Iniciar Busca de Acomodações
            </Button>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards - Real data from database */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-hotel-navy mb-4">Visão Geral do Sistema</h3>
        <StatisticsCards />
      </div>
      
      {/* Performance Charts - Real data from database */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-hotel-navy mb-4">Gráficos de Acompanhamento</h3>
        <PerformanceCharts />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
          <CardDescription>
            Navegue rapidamente para as principais funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/accommodations')}
            >
              <div className="text-base font-medium">Acomodações</div>
              <div className="text-xs text-muted-foreground text-center">
                Gerenciar unidades hospedagem
              </div>
              <ArrowRight className="h-4 w-4 mt-1" />
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/maintenance')}
            >
              <div className="text-base font-medium">Manutenção</div>
              <div className="text-xs text-muted-foreground text-center">
                Ordens de serviço e reparos
              </div>
              <ArrowRight className="h-4 w-4 mt-1" />
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/periods')}
            >
              <div className="text-base font-medium">Períodos</div>
              <div className="text-xs text-muted-foreground text-center">
                Configurar preços sazonais
              </div>
              <ArrowRight className="h-4 w-4 mt-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
