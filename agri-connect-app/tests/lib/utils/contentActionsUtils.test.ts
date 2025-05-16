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
import { getUniqueCategoryKeys } from '@/lib/contentActions';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Content Actions Utils', () => {
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

  describe('getUniqueCategoryKeys', () => {
    it('should fetch and return unique category keys from a table', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      const mockCategoriesData = [
        { category_key: 'pest-control' },
        { category_key: 'soil-health' },
        { category_key: 'pest-control' }, 
        { category_key: 'irrigation' },
        { category_key: 'soil-health' },
      ];
      mockSelect_test.mockResolvedValueOnce({ data: mockCategoriesData, error: null });

      const result = await getUniqueCategoryKeys(mockSupabaseClient, 'test_table', 'category_key');
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('test_table');
      expect(mockSelect_test).toHaveBeenCalledWith('category_key');
      expect(mockOrder_test).toHaveBeenCalledWith('category_key');
      expect(result.data).toEqual(['pest-control', 'soil-health', 'irrigation']);
      expect(result.error).toBeNull();
    });

    it('should return an empty array if no categories are found', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      mockSelect_test.mockResolvedValueOnce({ data: [], error: null });
      
      const result = await getUniqueCategoryKeys(mockSupabaseClient, 'test_table', 'category_key');
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle null category values', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      const mockCategoriesData = [
        { category_key: 'pest-control' },
        { category_key: null },
        { category_key: 'irrigation' },
        { category_key: undefined },
      ];
      mockSelect_test.mockResolvedValueOnce({ data: mockCategoriesData, error: null });

      const result = await getUniqueCategoryKeys(mockSupabaseClient, 'test_table', 'category_key');
      expect(result.data).toEqual(['pest-control', 'irrigation']);
      expect(result.error).toBeNull();
    });

    it('should return error if Supabase fetch fails', async () => {
      const mockSupabaseClient = { from: mockSupabaseFrom_test } as unknown as SupabaseClient;
      const supabaseError = { message: 'Fetch failed for categories', code: 'DB_ERROR' };
      mockSelect_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getUniqueCategoryKeys(mockSupabaseClient, 'test_table', 'category_key');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching test_table categories');
    });
  });
});