import { http, HttpResponse } from 'msw';

const factoryStatus = {
  amrWorking: 12,
  amrMaxNum: 20,
  amrWaiting: 3,
  amrCharging: 2,
  amrError: 1,
  amrWorkTime: 240,
  storageQuantity: 7500,
  storageMaxQuantity: 10000,
  lineWorking: 8,
  lineMaxNum: 10,
};

const productionStatus = {
  data: Array.from({ length: 12 }, (_, index) => ({
    timestamp: index + 8,
    production: 10 + (index % 5),
    target: 15,
  })),
};

export const dashboardHandlers = [
  http.get('*/api/v1/status/factory', () => HttpResponse.json(factoryStatus)),
  http.get('*/api/v1/status/production', () => HttpResponse.json(productionStatus)),
  http.get('*/api/v1/status/heatmap', () => HttpResponse.json({ data: [] })),
];
