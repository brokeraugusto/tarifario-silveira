import Layout from "@/components/Layout";
import PageContainer from "@/components/common/PageContainer";
import { OccupancyMapView } from "@/components/occupancy/OccupancyMapView";

const OccupancyPage = () => {
  return (
    <Layout>
      <PageContainer
        title="Mapa de Ocupação"
        description="Visualize a ocupação de todas as acomodações"
        contentClassName="p-0 h-full"
      >
        <OccupancyMapView />
      </PageContainer>
    </Layout>
  );
};

export default OccupancyPage;
