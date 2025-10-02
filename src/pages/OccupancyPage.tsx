import Layout from "@/components/Layout";
import { OccupancyMapView } from "@/components/occupancy/OccupancyMapView";

const OccupancyPage = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mapa de Ocupação</h1>
          <p className="text-muted-foreground">
            Visualize a ocupação de todas as acomodações
          </p>
        </div>

        <OccupancyMapView />
      </div>
    </Layout>
  );
};

export default OccupancyPage;
