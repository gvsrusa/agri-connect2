// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder; // Removed TypeScript specific type assertion


// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'testanonkey';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_clerk_publishable_key';
process.env.CLERK_SECRET_KEY = 'test_clerk_secret_key';
// Add any other environment variables your app might need during tests

console.log('JEST_SETUP.JS: Applying global mocks...'); // Diagnostic log

jest.mock('@supabase/ssr', () => {
  console.log('JEST_SETUP.JS: Mocking @supabase/ssr createServerClient');
  const mockFromFn = jest.fn(() => {
    console.log('JEST_SETUP.JS: MOCKED supabase.from called via createServerClient');
    const builder = {
      select: jest.fn((...args) => { console.log('JEST_SETUP.JS: MOCKED (ssr) builder.select called with:', args); return builder; }),
      eq: jest.fn((...args) => { console.log('JEST_SETUP.JS: MOCKED (ssr) builder.eq called with:', args); return builder; }),
      order: jest.fn((...args) => { console.log('JEST_SETUP.JS: MOCKED (ssr) builder.order called with:', args); return builder; }),
      single: jest.fn().mockResolvedValue({ data: { mocked_ssr: 'data_ssr_single' }, error: null }),
      // Add other methods like insert, update, delete if they are directly part of this chain and return a promise
    };
    // For queries that don't end in .single() but are awaited (e.g. select().order())
    (builder.select).mockImplementation(function(...args) {
        console.log('JEST_SETUP.JS: MOCKED (ssr) builder.select called (promise path) with:', args);
        // @ts-ignore
        this.mockResolvedValueOnce = (val) => Object.assign(this, { then: (cb)=> cb(val) }); // crude promise mock
        return this;
    });
     (builder.order).mockImplementation(function(...args) {
        console.log('JEST_SETUP.JS: MOCKED (ssr) builder.order called (promise path) with:', args);
        // @ts-ignore
        this.mockResolvedValueOnce = (val) => Object.assign(this, { then: (cb)=> cb(val) }); // crude promise mock
        return this;
    });


    return builder;
  });
  return {
    __esModule: true,
    createServerClient: jest.fn(() => {
      console.log('JEST_SETUP.JS: MOCKED createServerClient called');
      return {
        from: mockFromFn,
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: {id: 'mocked-ssr-user'} }, error: null }),
        },
      };
    }),
  };
});

jest.mock('@/services/supabase/client', () => {
  console.log('JEST_SETUP.JS: Mocking @/services/supabase/client supabase object');

  const mockClientFrom = jest.fn();
  const mockClientSelect = jest.fn();
  const mockClientInsert = jest.fn();
  const mockClientUpdate = jest.fn();
  const mockClientUpsert = jest.fn();
  const mockClientDelete = jest.fn();
  const mockClientEq = jest.fn();
  const mockClientOrder = jest.fn();
  const mockClientSingle = jest.fn();
  // Add other specific client mocks if needed, e.g., lt, gt, etc.

  const clientBuilderInstance = {
    select: mockClientSelect,
    insert: mockClientInsert,
    update: mockClientUpdate,
    upsert: mockClientUpsert,
    delete: mockClientDelete,
    eq: mockClientEq,
    order: mockClientOrder,
    single: mockClientSingle,
    // Ensure all chainable methods return clientBuilderInstance
  };

  mockClientFrom.mockReturnValue(clientBuilderInstance);
  mockClientSelect.mockReturnValue(clientBuilderInstance);
  mockClientInsert.mockReturnValue(clientBuilderInstance);
  mockClientUpdate.mockReturnValue(clientBuilderInstance);
  mockClientUpsert.mockReturnValue(clientBuilderInstance);
  mockClientDelete.mockReturnValue(clientBuilderInstance);
  mockClientEq.mockReturnValue(clientBuilderInstance);
  mockClientOrder.mockReturnValue(clientBuilderInstance);
  
  // Default resolution ONLY for truly terminal methods like .single()
  // or methods that ALWAYS return a promise and are never chained further in the SUT.
  mockClientSingle.mockResolvedValue({ data: { mocked_client: 'data_client_single_default' }, error: null });
  
  // For methods like insert, update, upsert, delete:
  // Their default is to return clientBuilderInstance for chaining (e.g., .upsert().select()).
  // If a test needs them to be terminal (e.g. await supabase.from().insert()),
  // the test itself should do: mockClientInsert_test.mockResolvedValueOnce(...);

  return {
    __esModule: true,
    supabase: {
      from: mockClientFrom,
      // if there are direct methods on supabase client other than .from
    },
    // Export mocks for test usage
    mockClientFrom_test: mockClientFrom,
    mockClientSelect_test: mockClientSelect,
    mockClientInsert_test: mockClientInsert,
    mockClientUpdate_test: mockClientUpdate,
    mockClientUpsert_test: mockClientUpsert,
    mockClientDelete_test: mockClientDelete,
    mockClientEq_test: mockClientEq,
    mockClientOrder_test: mockClientOrder,
    mockClientSingle_test: mockClientSingle,
    mockClientBuilderInstance_test: clientBuilderInstance, // If needed
  };
});
