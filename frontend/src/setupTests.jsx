import {server} from './__mocks__/server.jsx'
import { beforeAll, afterEach, afterAll } from 'vitest'



beforeAll(()=> server.listen());
afterEach(()=> server.resetHandlers());
afterAll(()=> server.close());

globalThis.baseURL = import.meta.env.VITE_API_URL;
