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
import { getDistinctKeysFromTable } from '@/lib/marketPriceActions';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Market Price Actions Utils', () => {
  const {
    mockSupabaseFrom_test,
    mockSelect_test,
    mockEq_test,
    mockOrder_test,
    mockSingle_test,
    mockAuthGetUser_test,
    mockBuilderInstance_test,
  } = jest.requireMock('@supabase/ssr');

  beforeEach(() => {
    mockSupabaseFrom_test.mockClear();
    mockSelect_test.mockClear();
    mockEq_test.mockClear();
    mockOrder_test.mockClear();
    mockSingle_test.mockClear();
    mockAuthGetUser_test.mockClear();
    (cookies as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();

    // Re-configure default return values
    mockSupabaseFrom_test.mockReturnValue(mockBuilderInstance_test);
    mockSelect_test.mockReturnValue(mockBuilderInstance_test);
    mockEq_test.mockReturnValue(mockBuilderInstance_test);
    mockOrder_test.mockReturnValue(mockBuilderInstance_test);
    mockAuthGetUser_test.mockResolvedValue({ data: { user: null }, error: null });

    (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn(),
      }
    );
  });

  describe('getDistinctKeysFromTable', () => {
    it('should fetch and return unique keys from a table column', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      const mockKeysData = [
        { crop_name_key: 'tomato' },
        { crop_name_key: 'potato' },
        { crop_name_key: 'tomato' },
        { crop_name_key: 'onion' },
      ];
      mockSelect_test.mockResolvedValueOnce({ data: mockKeysData, error: null });

      const result = await getDistinctKeysFromTable(mockSupabaseClient, 'market_prices', 'crop_name_key');
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('market_prices');
      expect(mockSelect_test).toHaveBeenCalledWith('crop_name_key');
      expect(mockOrder_test).toHaveBeenCalledWith('crop_name_key');
      expect(result.data).toEqual(['tomato', 'potato', 'onion']);
      expect(result.error).toBeNull();
    });

    it('should return an empty array if no keys are found', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      mockSelect_test.mockResolvedValueOnce({ data: [], error: null });
      
      const result = await getDistinctKeysFromTable(mockSupabaseClient, 'market_prices', 'crop_name_key');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle null key values', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      const mockKeysData = [
        { crop_name_key: 'tomato' },
        { crop_name_key: null },
        { crop_name_key: 'onion' },
        { crop_name_key: undefined },
      ];
      mockSelect_test.mockResolvedValueOnce({ data: mockKeysData, error: null });

      const result = await getDistinctKeysFromTable(mockSupabaseClient, 'market_prices', 'crop_name_key');
      // Supabase might return nulls, ensure Set handles them (it should, by adding 'null' or 'undefined' as strings if not filtered)
      // The current implementation of getDistinctKeysFromTable adds item[columnName] directly.
      // If item[columnName] is null or undefined, it will be added as such to the Set.
      // Array.from(new Set([null, undefined, 'tomato'])) would be [null, undefined, 'tomato']
      // Let's assume the database won't store undefined as a key, but null is possible.
      // The current code `uniqueKeys.add(item[columnName]);` will add `null` if `item[columnName]` is `null`.
      expect(result.data).toEqual([null, 'tomato', 'onion']); // Order might vary based on Set to Array conversion
      expect(result.error).toBeNull();
    });
    
    it('should return error if Supabase fetch fails', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      const supabaseError = { message: 'Fetch failed for keys', code: 'DB_ERROR' };
      mockSelect_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getDistinctKeysFromTable(mockSupabaseClient, 'market_prices', 'crop_name_key');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching crop_name_key');
    });
  });
});