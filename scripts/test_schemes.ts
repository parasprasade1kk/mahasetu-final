import { getServiceConfig } from '../lib/servicesConfig';

const testCases = [
  'post-matric-scholarship',
  'disability-scholarship',
  'senior-citizen-scheme',
  'financial-assistance-scheme',
  'women-welfare-scheme',
  'income-certificate',
  'rcsm-scholarship',
  'namo-shetkari'
];

testCases.forEach(id => {
  const cfg = getServiceConfig(id);
  console.log(id, '--> Title:', cfg.titleEn, '| Dept:', cfg.deptNameEn);
});
