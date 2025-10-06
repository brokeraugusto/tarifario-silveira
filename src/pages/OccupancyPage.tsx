import Layout from "@/components/Layout";
import { OccupancyMapView } from "@/components/occupancy/OccupancyMapView";

const OccupancyPage = () => {
  return (
    <Layout>
      <div className="w-full h-full p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapa de Ocupação</h1>
          <p className="text-muted-foreground">Visualize a ocupação de todas as acomodações</p>
        </div>
        
        <OccupancyMapView />
      </div>
    </Layout>
  );
};

export default OccupancyPage;
