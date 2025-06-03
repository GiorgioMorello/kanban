import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Ela intercepta chamadas HTTP feitas por bibliotecas como axios, fetch, etc., diretamente no ambiente de testes.
export const server = setupServer(...handlers);
