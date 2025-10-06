import Layout from "@/components/Layout";
import { OccupancyMapView } from "@/components/occupancy/OccupancyMapView";

const OccupancyPage = () => {
  return (
    <Layout>
      <div className="h-full p-6 space-y-6" style={{ width: 'calc(100% + 150px)', marginLeft: '-75px', marginRight: '-75px' }}>
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
