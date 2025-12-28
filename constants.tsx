
import React from 'react';
import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'airport',
    title: '机场英语 (Airport)',
    description: 'Check-in, security, boarding, and baggage claim essentials.',
    icon: '✈️',
    color: 'bg-blue-500',
    faIcon: 'fa-plane'
  },
  {
    id: 'business',
    title: '商务会议 (Business)',
    description: 'Professional networking, presentations, and meetings.',
    icon: '💼',
    color: 'bg-indigo-600',
    faIcon: 'fa-briefcase'
  },
  {
    id: 'workplace',
    title: '职场社交 (Workplace)',
    description: 'Collaborating with colleagues and casual office talk.',
    icon: '🏢',
    color: 'bg-slate-700',
    faIcon: 'fa-building'
  },
  {
    id: 'travel',
    title: '旅游出行 (Travel)',
    description: 'Booking hotels, asking for directions, and sightseeing.',
    icon: '🌍',
    color: 'bg-emerald-500',
    faIcon: 'fa-globe'
  },
  {
    id: 'restaurant',
    title: '餐厅点餐 (Dining)',
    description: 'Ordering food, describing preferences, and paying bills.',
    icon: '🍽️',
    color: 'bg-orange-500',
    faIcon: 'fa-utensils'
  },
  {
    id: 'medical',
    title: '医疗求助 (Medical)',
    description: 'Describing symptoms and understanding doctor advice.',
    icon: '🏥',
    color: 'bg-rose-500',
    faIcon: 'fa-hospital'
  }
];
