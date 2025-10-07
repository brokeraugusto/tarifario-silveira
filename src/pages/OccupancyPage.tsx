import Layout from "@/components/Layout";
import { OccupancyMapView } from "@/components/occupancy/OccupancyMapView";

const OccupancyPage = () => {
  return (
    <Layout>
      <div className="w-full h-full flex flex-col">
        <div className="px-6 pt-6">
          <h1 className="text-3xl font-bold text-foreground">Mapa de Ocupação</h1>
          <p className="text-muted-foreground">Visualize a ocupação de todas as acomodações</p>
        </div>
        
        <div className="flex-1 min-h-0 p-6">
          <OccupancyMapView />
        </div>
      </div>
    </Layout>
  );
};

export default OccupancyPage;
