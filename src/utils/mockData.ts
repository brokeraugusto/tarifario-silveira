
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
    minimumStay: 1
  },
  {
    id: '2',
    name: 'Apartamento Standard 109',
    roomNumber: '109',
    category: 'Standard',
    capacity: 2,
    description: 'Acomodação Standard com cama de casal, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 1
  },
  {
    id: '3',
    name: 'Apartamento Luxo 104',
    roomNumber: '104',
    category: 'Luxo',
    capacity: 4,
    description: 'Acomodação Luxo com cama de casal, sofá-cama, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 2
  },
  {
    id: '4',
    name: 'Apartamento Luxo 107',
    roomNumber: '107',
    category: 'Luxo',
    capacity: 4,
    description: 'Acomodação Luxo com cama de casal, sofá-cama, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 2
  },
  {
    id: '5',
    name: 'Apartamento Luxo 108',
    roomNumber: '108',
    category: 'Luxo',
    capacity: 4,
    description: 'Acomodação Luxo com cama de casal, sofá-cama, banheiro privativo e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 2
  },
  {
    id: '6',
    name: 'Apartamento Super Luxo 202',
    roomNumber: '202',
    category: 'Super Luxo',
    capacity: 4,
    description: 'Acomodação Super Luxo com cama de casal, sofá-cama, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 3
  },
  {
    id: '7',
    name: 'Apartamento Super Luxo 203',
    roomNumber: '203',
    category: 'Super Luxo',
    capacity: 4,
    description: 'Acomodação Super Luxo com cama de casal, sofá-cama, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 3
  },
  {
    id: '8',
    name: 'Apartamento Super Luxo 204',
    roomNumber: '204',
    category: 'Super Luxo',
    capacity: 5,
    description: 'Acomodação Super Luxo espaçosa com cama de casal, sofá-cama duplo, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 3
  },
  {
    id: '9',
    name: 'Apartamento Super Luxo 205',
    roomNumber: '205',
    category: 'Super Luxo',
    capacity: 5,
    description: 'Acomodação Super Luxo espaçosa com cama de casal, sofá-cama duplo, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 3
  },
  {
    id: '10',
    name: 'Apartamento Super Luxo 113',
    roomNumber: '113',
    category: 'Super Luxo',
    capacity: 5,
    description: 'Acomodação Super Luxo espaçosa com cama de casal, sofá-cama duplo, banheiro privativo, jacuzzi e café da manhã incluso.',
    imageUrl: '/placeholder.svg',
    minimumStay: 3
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
    isHoliday: false
  },
  {
    id: '2',
    name: 'Feriado Nacional',
    startDate: addDays(currentDate, 14),
    endDate: addDays(currentDate, 16),
    isHoliday: true
  },
  {
    id: '3',
    name: 'Alta Temporada',
    startDate: addMonths(currentDate, 3),
    endDate: addMonths(currentDate, 5),
    isHoliday: false
  }
];

// Mock de preços por número de pessoas
export const pricesByPeople: PriceByPeople[] = [
  // Baixa Temporada - Standard (2 pessoas)
  { id: '1', accommodationId: '1', periodId: '1', people: 1, pricePerNight: 250 },
  { id: '2', accommodationId: '1', periodId: '1', people: 2, pricePerNight: 300 },
  { id: '3', accommodationId: '2', periodId: '1', people: 1, pricePerNight: 250 },
  { id: '4', accommodationId: '2', periodId: '1', people: 2, pricePerNight: 300 },
  
  // Baixa Temporada - Luxo (4 pessoas)
  { id: '5', accommodationId: '3', periodId: '1', people: 2, pricePerNight: 400 },
  { id: '6', accommodationId: '3', periodId: '1', people: 3, pricePerNight: 450 },
  { id: '7', accommodationId: '3', periodId: '1', people: 4, pricePerNight: 500 },
  { id: '8', accommodationId: '4', periodId: '1', people: 2, pricePerNight: 400 },
  { id: '9', accommodationId: '4', periodId: '1', people: 3, pricePerNight: 450 },
  { id: '10', accommodationId: '4', periodId: '1', people: 4, pricePerNight: 500 },
  { id: '11', accommodationId: '5', periodId: '1', people: 2, pricePerNight: 400 },
  { id: '12', accommodationId: '5', periodId: '1', people: 3, pricePerNight: 450 },
  { id: '13', accommodationId: '5', periodId: '1', people: 4, pricePerNight: 500 },
  
  // Baixa Temporada - Super Luxo (4 pessoas)
  { id: '14', accommodationId: '6', periodId: '1', people: 2, pricePerNight: 600 },
  { id: '15', accommodationId: '6', periodId: '1', people: 3, pricePerNight: 650 },
  { id: '16', accommodationId: '6', periodId: '1', people: 4, pricePerNight: 700 },
  { id: '17', accommodationId: '7', periodId: '1', people: 2, pricePerNight: 600 },
  { id: '18', accommodationId: '7', periodId: '1', people: 3, pricePerNight: 650 },
  { id: '19', accommodationId: '7', periodId: '1', people: 4, pricePerNight: 700 },
  
  // Baixa Temporada - Super Luxo (5 pessoas)
  { id: '20', accommodationId: '8', periodId: '1', people: 3, pricePerNight: 750 },
  { id: '21', accommodationId: '8', periodId: '1', people: 4, pricePerNight: 800 },
  { id: '22', accommodationId: '8', periodId: '1', people: 5, pricePerNight: 850 },
  { id: '23', accommodationId: '9', periodId: '1', people: 3, pricePerNight: 750 },
  { id: '24', accommodationId: '9', periodId: '1', people: 4, pricePerNight: 800 },
  { id: '25', accommodationId: '9', periodId: '1', people: 5, pricePerNight: 850 },
  { id: '26', accommodationId: '10', periodId: '1', people: 3, pricePerNight: 750 },
  { id: '27', accommodationId: '10', periodId: '1', people: 4, pricePerNight: 800 },
  { id: '28', accommodationId: '10', periodId: '1', people: 5, pricePerNight: 850 },
  
  // Feriado Nacional (preços maiores)
  { id: '29', accommodationId: '1', periodId: '2', people: 1, pricePerNight: 350 },
  { id: '30', accommodationId: '1', periodId: '2', people: 2, pricePerNight: 400 },
  { id: '31', accommodationId: '2', periodId: '2', people: 1, pricePerNight: 350 },
  { id: '32', accommodationId: '2', periodId: '2', people: 2, pricePerNight: 400 },
  { id: '33', accommodationId: '3', periodId: '2', people: 2, pricePerNight: 550 },
  { id: '34', accommodationId: '6', periodId: '2', people: 2, pricePerNight: 850 },
  { id: '35', accommodationId: '8', periodId: '2', people: 4, pricePerNight: 1100 },
  
  // Alta Temporada
  { id: '36', accommodationId: '1', periodId: '3', people: 1, pricePerNight: 300 },
  { id: '37', accommodationId: '1', periodId: '3', people: 2, pricePerNight: 380 },
  { id: '38', accommodationId: '3', periodId: '3', people: 2, pricePerNight: 480 },
  { id: '39', accommodationId: '6', periodId: '3', people: 2, pricePerNight: 750 },
  { id: '40', accommodationId: '8', periodId: '3', people: 5, pricePerNight: 950 },
];
