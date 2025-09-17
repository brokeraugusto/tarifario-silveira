export interface CopyConfig {
  includeName: boolean;
  includeCategory: boolean;
  includeCapacity: boolean;
  includeDescription: boolean;
  includeNights: boolean;
  includeAlbumUrl: boolean;
  includePixPrice: boolean;
  includeCardPrice: boolean;
  includePixTotal: boolean;
  includeCardTotal: boolean;
}

export const DEFAULT_COPY_CONFIG: CopyConfig = {
  includeName: true,
  includeCategory: true,
  includeCapacity: true,
  includeDescription: true,
  includeNights: true,
  includeAlbumUrl: true,
  includePixPrice: true,
  includeCardPrice: true,
  includePixTotal: true,
  includeCardTotal: true,
};

export interface CopyConfigTemplate {
  name: string;
  config: CopyConfig;
}

export const COPY_CONFIG_TEMPLATES: CopyConfigTemplate[] = [
  {
    name: 'Completo',
    config: DEFAULT_COPY_CONFIG,
  },
  {
    name: 'Básico',
    config: {
      includeName: true,
      includeCategory: true,
      includeCapacity: true,
      includeDescription: false,
      includeNights: false,
      includeAlbumUrl: false,
      includePixPrice: true,
      includeCardPrice: false,
      includePixTotal: false,
      includeCardTotal: false,
    },
  },
  {
    name: 'Apenas Preços',
    config: {
      includeName: true,
      includeCategory: false,
      includeCapacity: false,
      includeDescription: false,
      includeNights: true,
      includeAlbumUrl: false,
      includePixPrice: true,
      includeCardPrice: true,
      includePixTotal: true,
      includeCardTotal: true,
    },
  },
];