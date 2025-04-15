
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bed, Calendar, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureCard = ({ icon, title, description, linkTo, linkText }: { 
  icon: React.ReactNode;
  title: string; 
  description: string;
  linkTo: string;
  linkText: string;
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="transition-all hover:border-hotel-gold hover:shadow-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-hotel-navy p-2 rounded-md">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base mb-4">{description}</CardDescription>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-between hover:bg-hotel-navy hover:text-white"
          onClick={() => navigate(linkTo)}
        >
          <span>{linkText}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="text-center pt-10 pb-6">
        <h1 className="text-4xl font-bold text-hotel-navy">AcomodaValor</h1>
        <p className="text-xl text-muted-foreground mt-2">Sistema de gestão de acomodações e valores</p>
      </div>
      
      <div className="bg-hotel-navy text-white p-8 rounded-lg shadow-lg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-hotel-gold">Bem-vindo ao Painel de Gestão</h2>
          <p className="mt-2">
            Use o sistema para buscar valores de acomodações, gerenciar dados e configurar preços por períodos.
          </p>
          
          <div className="mt-6">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-hotel-gold text-hotel-navy hover:bg-hotel-lightgold"
              onClick={() => navigate('/search')}
            >
              <Search className="mr-2 h-5 w-5" />
              Iniciar Busca de Acomodações
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Search className="h-5 w-5 text-white" />}
          title="Buscar Acomodações" 
          description="Encontre acomodações disponíveis com base na data, período e número de hóspedes."
          linkTo="/search"
          linkText="Ir para busca"
        />
        
        <FeatureCard 
          icon={<Bed className="h-5 w-5 text-white" />}
          title="Gerenciar Acomodações" 
          description="Cadastre, edite e exclua acomodações do sistema."
          linkTo="/accommodations"
          linkText="Gerenciar acomodações"
        />
        
        <FeatureCard 
          icon={<Calendar className="h-5 w-5 text-white" />}
          title="Períodos e Preços" 
          description="Configure períodos sazonais e defina preços por acomodação e número de pessoas."
          linkTo="/periods"
          linkText="Configurar preços"
        />
      </div>
    </div>
  );
};

export default HomePage;
