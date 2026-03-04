export const VEHICLE_TYPES = ['Jeepney', 'Bus', 'UV Express', 'Tricycle', 'MRT/LRT', 'Ferry']

export const TYPE_COLORS = {
  Jeepney:  '#FF6B35',
  Bus:      '#4A90D9',
  'UV Express': '#27AE60',
  Tricycle: '#F39C12',
  'MRT/LRT': '#8E44AD',
  Ferry:    '#2980B9',
}

export const INITIAL_MARKERS = [
  {
    id: 1,
    lat: 14.5995,
    lng: 120.9842,
    type: 'Jeepney',
    name: 'Quiapo to Cubao — Route 1',
    images: [
      'https://placehold.co/480x240/FF6B35/white?text=Jeepney+Route+1',
      'https://placehold.co/480x240/FF6B35/white?text=Quiapo+Terminal',
      'https://placehold.co/480x240/FF6B35/white?text=Cubao+Stop',
    ],
  },
  {
    id: 2,
    lat: 10.3157,
    lng: 123.8854,
    type: 'Bus',
    name: 'Cebu South Bus Terminal',
    images: [
      'https://placehold.co/480x240/4A90D9/white?text=South+Bus+Terminal',
      'https://placehold.co/480x240/4A90D9/white?text=Cebu+Bus+1',
      'https://placehold.co/480x240/4A90D9/white?text=Cebu+Bus+2',
    ],
  },
  {
    id: 3,
    lat: 7.1907,
    lng: 125.4553,
    type: 'UV Express',
    name: 'Davao UV Express Hub',
    images: [
      'https://placehold.co/480x240/27AE60/white?text=UV+Express+Hub',
      'https://placehold.co/480x240/27AE60/white?text=Davao+Van+1',
      'https://placehold.co/480x240/27AE60/white?text=Davao+Van+2',
    ],
  },
  {
    id: 4,
    lat: 16.4023,
    lng: 120.5960,
    type: 'Bus',
    name: 'Baguio Bus Terminal — Victory Liner',
    images: [
      'https://placehold.co/480x240/4A90D9/white?text=Victory+Liner+Baguio',
      'https://placehold.co/480x240/4A90D9/white?text=Baguio+Terminal',
      'https://placehold.co/480x240/4A90D9/white?text=Cordillera+Route',
    ],
  },
  {
    id: 5,
    lat: 14.5547,
    lng: 121.0244,
    type: 'MRT/LRT',
    name: 'MRT-3 Guadalupe Station',
    images: [
      'https://placehold.co/480x240/8E44AD/white?text=MRT-3+Guadalupe',
      'https://placehold.co/480x240/8E44AD/white?text=Station+Platform',
      'https://placehold.co/480x240/8E44AD/white?text=Metro+Rail',
    ],
  },
]

export const SAMPLE_ROUTES = [
  {
    id: 'r1',
    positions: [
      [14.5995, 120.9842],
      [13.9764, 121.5797],
      [13.4125, 121.9800],
      [12.3797, 121.7740],
      [11.5016, 122.5736],
      [10.7202, 122.5621],
      [10.3157, 123.8854],
    ],
    label: 'Bus — Manila to Cebu (via RORO)',
    color: '#E74C3C',
    weight: 3,
    dash: '8 4',
  },
  {
    id: 'r2',
    positions: [
      [14.5995, 120.9842],
      [15.1480, 120.5960],
      [16.4023, 120.5960],
    ],
    label: 'Bus — Manila to Baguio',
    color: '#4A90D9',
    weight: 3,
    dash: '8 4',
  },
]
