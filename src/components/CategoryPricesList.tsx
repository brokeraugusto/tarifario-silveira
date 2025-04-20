
import React, { useState, useEffect } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import { CategoryType, PricePeriod, Accommodation, PriceByPeople } from '@/types';
import { getAllPricePeriods } from '@/integrations/supabase/services/periodService';
import { getAccommodationsByCategory } from '@/integrations/supabase/services/accommodations/queries';
import { getPricesForAccommodation } from '@/integrations/supabase/services/priceService';

interface CategoryPricesListProps {
  initialCategory?: CategoryType;
}

const CategoryPricesList: React.FC<CategoryPricesListProps> = ({ initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCategory || 'Standard');
  const [periods, setPeriods] = useState<PricePeriod[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [pricesByAccommodation, setPricesByAccommodation] = useState<Record<string, PriceByPeople[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    fetchData(selectedCategory);
  }, [selectedCategory]);
  
  const fetchData = async (category: CategoryType) => {
    setLoading(true);
    try {
      // Fetch periods
      const periodsData = await getAllPricePeriods();
      setPeriods(periodsData);
      
      // Fetch accommodations by category
      const accommodationsData = await getAccommodationsByCategory(category);
      setAccommodations(accommodationsData);
      
      // Fetch prices for each accommodation
      const pricesByAccommodationData: Record<string, PriceByPeople[]> = {};
      for (const accommodation of accommodationsData) {
        const prices = await getPricesForAccommodation(accommodation.id);
        pricesByAccommodationData[accommodation.id] = prices;
      }
      setPricesByAccommodation(pricesByAccommodationData);
      
    } catch (error) {
      console.error('Error fetching data for category prices list:', error);
      toast.error('Erro ao carregar dados de preços');
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryColor = (cat: CategoryType) => {
    switch (cat) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      case 'Master':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to format the price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL'
    }).format(price);
  };
  
  // Function to get prices for an accommodation in a specific period for a certain number of people
  const getPriceForPeriodAndPeople = (accommodationId: string, periodId: string, people: number, withBreakfast: boolean) => {
    const prices = pricesByAccommodation[accommodationId] || [];
    const price = prices.find(p => 
      p.periodId === periodId && 
      p.people === people && 
      p.includesBreakfast === withBreakfast
    );
    
    return price ? formatPrice(price.pricePerNight) : 'N/A';
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Lista de Preços por Categoria</h2>
      
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as CategoryType)}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="Standard">Standard</TabsTrigger>
          <TabsTrigger value="Luxo">Luxo</TabsTrigger>
          <TabsTrigger value="Super Luxo">Super Luxo</TabsTrigger>
          <TabsTrigger value="Master">Master</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando preços...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-sm ${getCategoryColor(selectedCategory)}`}>
                  {selectedCategory}
                </span>
                <span>Visão Geral</span>
              </CardTitle>
              <CardDescription>
                {accommodations.length} acomodações encontradas nesta categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={["overview"]}>
                <AccordionItem value="overview">
                  <AccordionTrigger>Visão Geral de Preços</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      {periods.map(period => (
                        <div key={period.id} className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{period.name}</h3>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Mín. {period.minimumStay} {period.minimumStay === 1 ? 'diária' : 'diárias'}</span>
                            </Badge>
                            {period.isHoliday && <Badge>Feriado/Especial</Badge>}
                          </div>
                          
                          <div className="border rounded-md overflow-hidden">
                            <div className="grid grid-cols-3 bg-muted px-4 py-2 text-sm font-medium">
                              <div>Quantidade de pessoas</div>
                              <div>Com Café da Manhã</div>
                              <div>Sem Café da Manhã</div>
                            </div>
                            
                            {[2, 3, 4, 5].map(people => {
                              const hasAnyPrice = accommodations.some(acc => {
                                const withBreakfastPrice = getPriceForPeriodAndPeople(acc.id, period.id, people, true);
                                const withoutBreakfastPrice = getPriceForPeriodAndPeople(acc.id, period.id, people, false);
                                return withBreakfastPrice !== 'N/A' || withoutBreakfastPrice !== 'N/A';
                              });
                              
                              if (!hasAnyPrice) return null;
                              
                              return (
                                <div key={people} className="grid grid-cols-3 px-4 py-3 border-t">
                                  <div className="font-medium">{people} pessoas</div>
                                  <div className="flex gap-2 flex-wrap">
                                    {accommodations.map(acc => {
                                      const price = getPriceForPeriodAndPeople(acc.id, period.id, people, true);
                                      if (price === 'N/A') return null;
                                      return (
                                        <Badge key={`${acc.id}-with`} variant="outline" className="bg-green-50">
                                          {acc.roomNumber}: {price}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {accommodations.map(acc => {
                                      const price = getPriceForPeriodAndPeople(acc.id, period.id, people, false);
                                      if (price === 'N/A') return null;
                                      return (
                                        <Badge key={`${acc.id}-without`} variant="outline">
                                          {acc.roomNumber}: {price}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {accommodations.map(accommodation => (
                  <AccordionItem key={accommodation.id} value={accommodation.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span>{accommodation.name}</span>
                        <Badge variant="outline" className="ml-2">{accommodation.roomNumber}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {periods.map(period => (
                          <div key={period.id} className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold">{period.name}</h4>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Mín. {period.minimumStay} {period.minimumStay === 1 ? 'diária' : 'diárias'}</span>
                              </Badge>
                            </div>
                            
                            <div className="border rounded-md overflow-hidden">
                              <div className="grid grid-cols-3 bg-muted px-4 py-2 text-sm font-medium">
                                <div>Pessoas</div>
                                <div>Com Café da Manhã</div>
                                <div>Sem Café da Manhã</div>
                              </div>
                              
                              {[2, 3, 4, 5].map(people => {
                                if (people > accommodation.capacity) return null;
                                
                                const withBreakfastPrice = getPriceForPeriodAndPeople(
                                  accommodation.id, period.id, people, true
                                );
                                const withoutBreakfastPrice = getPriceForPeriodAndPeople(
                                  accommodation.id, period.id, people, false
                                );
                                
                                if (withBreakfastPrice === 'N/A' && withoutBreakfastPrice === 'N/A') return null;
                                
                                return (
                                  <div key={people} className="grid grid-cols-3 px-4 py-3 border-t">
                                    <div className="font-medium">{people} pessoas</div>
                                    <div className="text-green-700 font-medium">{withBreakfastPrice}</div>
                                    <div>{withoutBreakfastPrice}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CategoryPricesList;
