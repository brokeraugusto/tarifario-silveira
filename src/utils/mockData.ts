
import { Accommodation, PricePeriod, PriceByPeople } from '../types';
import { addDays, addMonths } from 'date-fns';

// Mock de acomodações
export const accommodations: Accommodation[] = [
  {
    id: '1',
    name: 'Apartamento Standard 102',
    roomNumber: '102',
    category: 'Standard',
    capacity: 2,
    description: 'Acomodação Standard com cama de casal, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '2',
    name: 'Apartamento Standard 109',
    roomNumber: '109',
    category: 'Standard',
    capacity: 2,
    description: 'Acomodação Standard com cama de casal, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '3',
    name: 'Apartamento Luxo 104',
    roomNumber: '104',
    category: 'Luxo',
    capacity: 4,
    description: 'Acomodação Luxo com cama de casal, sofá-cama, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '4',
    name: 'Apartamento Luxo 107',
    roomNumber: '107',
    category: 'Luxo',
    capacity: 4,
    description: 'Acomodação Luxo com cama de casal, sofá-cama, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '5',
    name: 'Apartamento Luxo 108',
    roomNumber: '108',
    category: 'Luxo',
    capacity: 4,
    description: 'Acomodação Luxo com cama de casal, sofá-cama, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '6',
    name: 'Apartamento Super Luxo 202',
    roomNumber: '202',
    category: 'Super Luxo',
    capacity: 4,
    description: 'Acomodação Super Luxo com cama de casal, sofá-cama, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '7',
    name: 'Apartamento Super Luxo 203',
    roomNumber: '203',
    category: 'Super Luxo',
    capacity: 4,
    description: 'Acomodação Super Luxo com cama de casal, sofá-cama, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '8',
    name: 'Apartamento Super Luxo 204',
    roomNumber: '204',
    category: 'Super Luxo',
    capacity: 5,
    description: 'Acomodação Super Luxo espaçosa com cama de casal, sofá-cama duplo, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '9',
    name: 'Apartamento Super Luxo 205',
    roomNumber: '205',
    category: 'Super Luxo',
    capacity: 5,
    description: 'Acomodação Super Luxo espaçosa com cama de casal, sofá-cama duplo, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '10',
    name: 'Apartamento Super Luxo 113',
    roomNumber: '113',
    category: 'Super Luxo',
    capacity: 5,
    description: 'Acomodação Super Luxo espaçosa com cama de casal, sofá-cama duplo, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    images: [],
    isBlocked: false
  },
  {
    id: '11',
    name: 'Suíte Cubo',
    roomNumber: '301',
    category: 'Master',
    capacity: 2,
    description: 'Suíte Cubo exclusiva com design moderno, cama king size, área de estar, banheiro privativo com banheira de hidromassagem e café da manhã gourmet incluso.',
    imageUrl: '/placeholder.svg',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1170&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1074&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=1170&auto=format&fit=crop'
    ],
    isBlocked: false
  },
];

// Mock de períodos de preços
const currentDate = new Date();
export const pricePeriods: PricePeriod[] = [
  {
    id: '1',
    name: 'Baixa Temporada',
    startDate: currentDate,
    endDate: addMonths(currentDate, 2),
    isHoliday: false,
    minimumStay: 1
  },
  {
    id: '2',
    name: 'Feriado Nacional',
    startDate: addDays(currentDate, 14),
    endDate: addDays(currentDate, 16),
    isHoliday: true,
    minimumStay: 3
  },
  {
    id: '3',
    name: 'Alta Temporada',
    startDate: addMonths(currentDate, 3),
    endDate: addMonths(currentDate, 5),
    isHoliday: false,
    minimumStay: 2
  }
];

// Mock de preços por número de pessoas
export const pricesByPeople: PriceByPeople[] = [
  // Baixa Temporada - Standard (2 pessoas)
  { id: '1', accommodationId: '1', periodId: '1', people: 1, pricePerNight: 250, includesBreakfast: true },
  { id: '2', accommodationId: '1', periodId: '1', people: 2, pricePerNight: 300, includesBreakfast: true },
  { id: '3', accommodationId: '2', periodId: '1', people: 1, pricePerNight: 250, includesBreakfast: true },
  { id: '4', accommodationId: '2', periodId: '1', people: 2, pricePerNight: 300, includesBreakfast: true },
  
  // Baixa Temporada - Luxo (4 pessoas)
  { id: '5', accommodationId: '3', periodId: '1', people: 2, pricePerNight: 400, includesBreakfast: true },
  { id: '6', accommodationId: '3', periodId: '1', people: 3, pricePerNight: 450, includesBreakfast: true },
  { id: '7', accommodationId: '3', periodId: '1', people: 4, pricePerNight: 500, includesBreakfast: true },
  { id: '8', accommodationId: '4', periodId: '1', people: 2, pricePerNight: 400, includesBreakfast: true },
  { id: '9', accommodationId: '4', periodId: '1', people: 3, pricePerNight: 450, includesBreakfast: true },
  { id: '10', accommodationId: '4', periodId: '1', people: 4, pricePerNight: 500, includesBreakfast: true },
  { id: '11', accommodationId: '5', periodId: '1', people: 2, pricePerNight: 400, includesBreakfast: true },
  { id: '12', accommodationId: '5', periodId: '1', people: 3, pricePerNight: 450, includesBreakfast: true },
  { id: '13', accommodationId: '5', periodId: '1', people: 4, pricePerNight: 500, includesBreakfast: true },
  
  // Baixa Temporada - Super Luxo (4 pessoas)
  { id: '14', accommodationId: '6', periodId: '1', people: 2, pricePerNight: 600, includesBreakfast: true },
  { id: '15', accommodationId: '6', periodId: '1', people: 3, pricePerNight: 650, includesBreakfast: true },
  { id: '16', accommodationId: '6', periodId: '1', people: 4, pricePerNight: 700, includesBreakfast: true },
  { id: '17', accommodationId: '7', periodId: '1', people: 2, pricePerNight: 600, includesBreakfast: true },
  { id: '18', accommodationId: '7', periodId: '1', people: 3, pricePerNight: 650, includesBreakfast: true },
  { id: '19', accommodationId: '7', periodId: '1', people: 4, pricePerNight: 700, includesBreakfast: true },
  
  // Baixa Temporada - Super Luxo (5 pessoas)
  { id: '20', accommodationId: '8', periodId: '1', people: 3, pricePerNight: 750, includesBreakfast: true },
  { id: '21', accommodationId: '8', periodId: '1', people: 4, pricePerNight: 800, includesBreakfast: true },
  { id: '22', accommodationId: '8', periodId: '1', people: 5, pricePerNight: 850, includesBreakfast: true },
  { id: '23', accommodationId: '9', periodId: '1', people: 3, pricePerNight: 750, includesBreakfast: true },
  { id: '24', accommodationId: '9', periodId: '1', people: 4, pricePerNight: 800, includesBreakfast: true },
  { id: '25', accommodationId: '9', periodId: '1', people: 5, pricePerNight: 850, includesBreakfast: true },
  { id: '26', accommodationId: '10', periodId: '1', people: 3, pricePerNight: 750, includesBreakfast: true },
  { id: '27', accommodationId: '10', periodId: '1', people: 4, pricePerNight: 800, includesBreakfast: true },
  { id: '28', accommodationId: '10', periodId: '1', people: 5, pricePerNight: 850, includesBreakfast: true },
  
  // Feriado Nacional (preços maiores)
  { id: '29', accommodationId: '1', periodId: '2', people: 1, pricePerNight: 350, includesBreakfast: true },
  { id: '30', accommodationId: '1', periodId: '2', people: 2, pricePerNight: 400, includesBreakfast: true },
  { id: '31', accommodationId: '2', periodId: '2', people: 1, pricePerNight: 350, includesBreakfast: true },
  { id: '32', accommodationId: '2', periodId: '2', people: 2, pricePerNight: 400, includesBreakfast: true },
  { id: '33', accommodationId: '3', periodId: '2', people: 2, pricePerNight: 550, includesBreakfast: true },
  { id: '34', accommodationId: '6', periodId: '2', people: 2, pricePerNight: 850, includesBreakfast: true },
  { id: '35', accommodationId: '8', periodId: '2', people: 4, pricePerNight: 1100, includesBreakfast: true },
  
  // Alta Temporada
  { id: '36', accommodationId: '1', periodId: '3', people: 1, pricePerNight: 300, includesBreakfast: true },
  { id: '37', accommodationId: '1', periodId: '3', people: 2, pricePerNight: 380, includesBreakfast: true },
  { id: '38', accommodationId: '3', periodId: '3', people: 2, pricePerNight: 480, includesBreakfast: true },
  { id: '39', accommodationId: '6', periodId: '3', people: 2, pricePerNight: 750, includesBreakfast: true },
  { id: '40', accommodationId: '8', periodId: '3', people: 5, pricePerNight: 950, includesBreakfast: true },
  
  // Preços para Suíte Cubo - Baixa Temporada
  { id: '41', accommodationId: '11', periodId: '1', people: 1, pricePerNight: 800, includesBreakfast: true },
  { id: '42', accommodationId: '11', periodId: '1', people: 2, pricePerNight: 950, includesBreakfast: true },
  { id: '43', accommodationId: '11', periodId: '1', people: 1, pricePerNight: 700, includesBreakfast: false },
  { id: '44', accommodationId: '11', periodId: '1', people: 2, pricePerNight: 850, includesBreakfast: false },
  
  // Preços para Suíte Cubo - Feriado Nacional
  { id: '45', accommodationId: '11', periodId: '2', people: 1, pricePerNight: 1200, includesBreakfast: true },
  { id: '46', accommodationId: '11', periodId: '2', people: 2, pricePerNight: 1350, includesBreakfast: true },
  { id: '47', accommodationId: '11', periodId: '2', people: 1, pricePerNight: 1100, includesBreakfast: false },
  { id: '48', accommodationId: '11', periodId: '2', people: 2, pricePerNight: 1250, includesBreakfast: false },
  
  // Preços para Suíte Cubo - Alta Temporada
  { id: '49', accommodationId: '11', periodId: '3', people: 1, pricePerNight: 1000, includesBreakfast: true },
  { id: '50', accommodationId: '11', periodId: '3', people: 2, pricePerNight: 1150, includesBreakfast: true },
  { id: '51', accommodationId: '11', periodId: '3', people: 1, pricePerNight: 900, includesBreakfast: false },
  { id: '52', accommodationId: '11', periodId: '3', people: 2, pricePerNight: 1050, includesBreakfast: false },
];
