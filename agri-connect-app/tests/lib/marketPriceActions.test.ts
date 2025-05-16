import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Mocking @supabase/ssr
jest.mock('@supabase/ssr', () => {
  const localMockSupabaseFrom = jest.fn();
  const localMockSelect = jest.fn();
  const localMockEq = jest.fn();
  const localMockOrder = jest.fn();
  const localMockSingle = jest.fn();
  const localMockAuthGetUser = jest.fn();

  const localBuilderInstance = {
    select: localMockSelect,
    eq: localMockEq,
    order: localMockOrder,
    single: localMockSingle,
    // Add other chainable methods if used by marketPriceActions.ts
  };

  localMockSupabaseFrom.mockReturnValue(localBuilderInstance);
  localMockSelect.mockReturnValue(localBuilderInstance);
  localMockEq.mockReturnValue(localBuilderInstance);
  localMockOrder.mockReturnValue(localBuilderInstance);
  // localMockSingle and localMockAuthGetUser are terminal or configured per test.

  return {
    __esModule: true,
    createServerClient: jest.fn(() => ({
      from: localMockSupabaseFrom,
      auth: {
        getUser: localMockAuthGetUser,
      },
    })),
    // Export mocks for test usage
    mockSupabaseFrom_test: localMockSupabaseFrom,
    mockSelect_test: localMockSelect,
    mockEq_test: localMockEq,
    mockOrder_test: localMockOrder,
    mockSingle_test: localMockSingle,
    mockAuthGetUser_test: localMockAuthGetUser,
    mockBuilderInstance_test: localBuilderInstance,
  };
});

// Other necessary mocks
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

// Import the module to be tested AFTER ALL mocks are set up
import {
  getMarketPrices,
  getMarketPrice,
  getDistinctCropNameKeys,
  getDistinctMarketNameKeys,
} from '@/lib/marketPriceActions';

describe('Market Price Actions', () => {
  // Import client-specific mocks from the @/services/supabase/client mock
  const {
    mockClientFrom_test,
    mockClientSelect_test,
    mockClientEq_test,
    mockClientOrder_test,
    mockClientSingle_test,
  } = jest.requireMock('@/services/supabase/client');

  beforeEach(() => {
    mockClientFrom_test.mockClear();
    mockClientSelect_test.mockClear();
    mockClientEq_test.mockClear();
    mockClientOrder_test.mockClear();
    mockClientSingle_test.mockClear();
    (cookies as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();

    // Default return values for client mocks are set in jest.setup.js
    // For chaining, ensure they return the builder instance.
    // This is also handled in jest.setup.js by default.

    (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn(),
      }
    );
  });

  describe('getDistinctCropNameKeys', () => {
    it('should fetch and return unique crop name keys', async () => {
      const mockCropKeysData = [
        { crop_name_key: 'tomato' },
        { crop_name_key: 'potato' },
        { crop_name_key: 'tomato' },
        { crop_name_key: 'onion' },
      ];
      // For getDistinctCropNameKeys, the chain is from().select().order()
      // The actual promise resolves from the .order() call in getDistinctKeysFromTable
      mockClientOrder_test.mockResolvedValueOnce({ data: mockCropKeysData, error: null });

      const result = await getDistinctCropNameKeys();
      expect(mockClientFrom_test).toHaveBeenCalledWith('market_prices');
      expect(mockClientSelect_test).toHaveBeenCalledWith('crop_name_key');
      expect(mockClientOrder_test).toHaveBeenCalledWith('crop_name_key');
      expect(result.data).toEqual(['tomato', 'potato', 'onion']);
      expect(result.error).toBeNull();
    });

    it('should return an empty array if no crop keys are found', async () => {
      mockClientOrder_test.mockResolvedValueOnce({ data: [], error: null });
      const result = await getDistinctCropNameKeys();
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error string if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed for crop keys', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getDistinctCropNameKeys();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching crop_name_key');
    });
  });

  describe('getDistinctMarketNameKeys', () => {
    it('should fetch and return unique market name keys', async () => {
      const mockMarketKeysData = [
        { market_name_key: 'mumbai_market' },
        { market_name_key: 'pune_market' },
        { market_name_key: 'mumbai_market' },
        { market_name_key: 'delhi_market' },
      ];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockMarketKeysData, error: null });

      const result = await getDistinctMarketNameKeys();
      expect(mockClientFrom_test).toHaveBeenCalledWith('market_prices');
      expect(mockClientSelect_test).toHaveBeenCalledWith('market_name_key');
      expect(mockClientOrder_test).toHaveBeenCalledWith('market_name_key');
      expect(result.data).toEqual(['mumbai_market', 'pune_market', 'delhi_market']);
      expect(result.error).toBeNull();
    });

    it('should return an empty array if no market keys are found', async () => {
      mockClientOrder_test.mockResolvedValueOnce({ data: [], error: null });
      const result = await getDistinctMarketNameKeys();
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error string if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed for market keys', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getDistinctMarketNameKeys();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching market_name_key');
    });
  });

  describe('getMarketPrices', () => {
    it('should fetch all market prices if no filters are provided', async () => {
      const mockPrices = [
        { crop_name_key: 'tomato', market_name_key: 'mumbai', price: 100, date: '2023-01-01' },
        { crop_name_key: 'potato', market_name_key: 'pune', price: 50, date: '2023-01-02' },
      ];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockPrices, error: null });

      const result = await getMarketPrices();
      expect(mockClientFrom_test).toHaveBeenCalledWith('market_prices');
      expect(mockClientSelect_test).toHaveBeenCalledWith('*');
      expect(mockClientOrder_test).toHaveBeenCalledWith('price_date', { ascending: false });
      expect(result.data).toEqual(mockPrices);
      expect(result.error).toBeNull();
    });

    it('should filter by crop_name_key if provided', async () => {
      const mockPrices = [{ crop_name_key: 'tomato', market_name_key: 'mumbai', price: 100, date: '2023-01-01' }];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockPrices, error: null });

      await getMarketPrices('tomato');
      expect(mockClientEq_test).toHaveBeenCalledWith('crop_name_key', 'tomato');
    });

    it('should filter by market_name_key if provided', async () => {
      const mockPrices = [{ crop_name_key: 'tomato', market_name_key: 'mumbai', price: 100, date: '2023-01-01' }];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockPrices, error: null });
      
      await getMarketPrices(undefined, 'mumbai');
      expect(mockClientEq_test).toHaveBeenCalledWith('market_name_key', 'mumbai');
    });

    it('should filter by both crop_name_key and market_name_key if provided', async () => {
        const mockPrices = [{ crop_name_key: 'tomato', market_name_key: 'mumbai', price: 100, date: '2023-01-01' }];
        mockClientOrder_test.mockResolvedValueOnce({ data: mockPrices, error: null });

        await getMarketPrices('tomato', 'mumbai');
        expect(mockClientEq_test).toHaveBeenCalledWith('crop_name_key', 'tomato');
        expect(mockClientEq_test).toHaveBeenCalledWith('market_name_key', 'mumbai');
    });

    it('should return error string if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed for market prices', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getMarketPrices();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching market prices');
    });
  });

  describe('getMarketPrice', () => {
    it('should fetch a single market price successfully', async () => {
      const mockPrice = { crop_name_key: 'tomato', market_name_key: 'mumbai', price: 100, date: '2023-01-01' };
      mockClientSingle_test.mockResolvedValueOnce({ data: mockPrice, error: null });

      const result = await getMarketPrice('tomato', 'mumbai');
      expect(mockClientFrom_test).toHaveBeenCalledWith('market_prices');
      expect(mockClientSelect_test).toHaveBeenCalledWith('*');
      expect(mockClientEq_test).toHaveBeenCalledWith('crop_name_key', 'tomato');
      expect(mockClientEq_test).toHaveBeenCalledWith('market_name_key', 'mumbai');
      expect(mockClientOrder_test).toHaveBeenCalledWith('price_date', { ascending: false });
      expect(mockClientSingle_test).toHaveBeenCalled();
      expect(result.data).toEqual(mockPrice);
      expect(result.error).toBeNull();
    });

    it('should return null data if no price found (PGRST116)', async () => {
        mockClientSingle_test.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found', details: '', hint: '' } });
        const result = await getMarketPrice('unknown_crop', 'unknown_market');
        expect(result.data).toBeNull();
        expect(result.error).toBeNull();
    });
    
    it('should return error string if Supabase fetch fails with other error', async () => {
      const supabaseError = { message: 'Fetch failed for single market price', code: 'DB_ERROR', details: '', hint: '' };
      mockClientSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getMarketPrice('tomato', 'mumbai');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching market price');
    });
  });
});