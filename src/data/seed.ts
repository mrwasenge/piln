import { Case, Partner } from '@/types';

export const seedCases: Case[] = [
  {
    id: 'case-1',
    submittedAt: new Date().toISOString(),
    fullName: 'John Doe',
    email: 'john@example.com',
    injuryType: 'Auto',
    description: 'Hit by a car at intersection and suffered whiplash injuries.',
    status: 'NEW',
  },
  {
    id: 'case-2',
    submittedAt: new Date().toISOString(),
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    injuryType: 'Slip & Fall',
    description: 'Slipped on wet floor in grocery store and broke arm.',
    status: 'NEW',
  },
];

export const seedPartners: Partner[] = [
  {
    id: 'partner-1',
    name: 'Auto Experts LLC',
    email: 'auto@example.com',
    specialties: ['Auto'],
    coverage: ['NY', 'NJ'],
    capacity: 10,
    active: true,
  },
  {
    id: 'partner-2',
    name: 'Slip & Fall Pros',
    email: 'slip@example.com',
    specialties: ['Slip & Fall'],
    coverage: ['CA'],
    capacity: 5,
    active: true,
  },
  {
    id: 'partner-3',
    name: 'General Injury Co',
    email: 'injury@example.com',
    specialties: ['Auto', 'Slip & Fall'],
    coverage: ['TX', 'FL'],
    capacity: 8,
    active: false,
  },
];
