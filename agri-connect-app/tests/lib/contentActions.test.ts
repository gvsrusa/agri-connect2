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
import {
  getAdvisoryCategories,
  getPostHarvestCategories,
  getAdvisoryTopics,
  getAdvisoryContent,
  getPostHarvestTopics,
  getPostHarvestContent,
} from '@/lib/contentActions';


describe('Content Actions', () => {
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
    // Example: mockClientSelect_test.mockReturnValue(clientBuilderInstance_test);
    // Tests will override specific terminal calls like mockClientSingle_test.mockResolvedValueOnce()

    (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn(),
      }
    );
  });

  describe('getAdvisoryCategories', () => {
    it('should fetch and return unique advisory categories', async () => {
      const mockCategoriesData = [
        { category_key: 'pest-control' },
        { category_key: 'soil-health' },
        { category_key: 'pest-control' },
        { category_key: 'irrigation' },
        { category_key: 'soil-health' },
      ];
      // For getAdvisoryCategories, the chain is from().select().order()
      // The actual promise resolves from the .order() call in getUniqueCategoryKeys
      mockClientOrder_test.mockResolvedValueOnce({ data: mockCategoriesData, error: null });

      const result = await getAdvisoryCategories();
      expect(mockClientFrom_test).toHaveBeenCalledWith('advisory_content');
      expect(mockClientSelect_test).toHaveBeenCalledWith('category_key');
      expect(mockClientOrder_test).toHaveBeenCalledWith('category_key');
      expect(result.data).toEqual(['pest-control', 'soil-health', 'irrigation']); // Order might change due to Set
      expect(result.error).toBeNull();
    });

    it('should return an empty array if no categories are found', async () => {
      mockClientOrder_test.mockResolvedValueOnce({ data: [], error: null });
      const result = await getAdvisoryCategories();
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error string if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed for advisory categories', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getAdvisoryCategories();
      expect(result.data).toBeNull();
      // The new utility function returns a string error
      expect(result.error).toBe('Error fetching advisory_content categories');
    });
  });

  describe('getPostHarvestCategories', () => {
    it('should fetch and return unique post-harvest categories', async () => {
      const mockCategoriesData = [
        { category_key: 'storage' },
        { category_key: 'processing' },
        { category_key: 'storage' },
        { category_key: 'transport' },
      ];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockCategoriesData, error: null });

      const result = await getPostHarvestCategories();
      expect(mockClientFrom_test).toHaveBeenCalledWith('post_harvest_content');
      expect(mockClientSelect_test).toHaveBeenCalledWith('category_key');
      expect(mockClientOrder_test).toHaveBeenCalledWith('category_key');
      expect(result.data).toEqual(['storage', 'processing', 'transport']);
      expect(result.error).toBeNull();
    });

    it('should return an empty array if no categories are found', async () => {
      mockClientOrder_test.mockResolvedValueOnce({ data: [], error: null });
      const result = await getPostHarvestCategories();
      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should return error string if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed for post-harvest categories', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getPostHarvestCategories();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching post_harvest_content categories');
    });
  });

  describe('getAdvisoryTopics', () => {
    it('should call Supabase with correct parameters and return data', async () => {
      const mockTopics = [{ id: '1', topic_key: 'topic1', title: 'Topic 1', category_key: 'cat1' }];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockTopics, error: null });
      const result = await getAdvisoryTopics('en');

      expect(mockClientFrom_test).toHaveBeenCalledWith('advisory_content');
      expect(mockClientSelect_test).toHaveBeenCalledWith('id, topic_key, title, category_key');
      expect(mockClientEq_test).toHaveBeenCalledWith('language_code', 'en');
      expect(mockClientOrder_test).toHaveBeenCalledWith('title'); // Default ascending
      expect(result.data).toEqual(mockTopics);
      expect(result.error).toBeNull();
    });

     it('should return error string if Supabase fetch fails for topics', async () => {
      const supabaseError = { message: 'Fetch failed for advisory topics', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getAdvisoryTopics('en');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching advisory topics');
    });
  });

  describe('getAdvisoryContent', () => {
    it('should call Supabase with correct parameters and return content', async () => {
      const mockContent = { id: '1', topic_key: 'some-topic', title: 'Some Topic', body_text: 'Details...' };
      mockClientSingle_test.mockResolvedValueOnce({ data: mockContent, error: null });
      const result = await getAdvisoryContent('some-topic', 'en');

      expect(mockClientFrom_test).toHaveBeenCalledWith('advisory_content');
      expect(mockClientSelect_test).toHaveBeenCalledWith('*');
      expect(mockClientEq_test).toHaveBeenNthCalledWith(1, 'topic_key', 'some-topic');
      expect(mockClientEq_test).toHaveBeenNthCalledWith(2, 'language_code', 'en');
      expect(mockClientSingle_test).toHaveBeenCalled();
      expect(result.data).toEqual(mockContent);
      expect(result.error).toBeNull();
    });

    it('should return error string if Supabase fetch fails for content', async () => {
      const supabaseError = { message: 'Fetch failed for advisory content', code: 'DB_ERROR', details: '', hint: '' };
      mockClientSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getAdvisoryContent('some-topic', 'en');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching advisory content');
    });
  });

  describe('getPostHarvestTopics', () => {
    it('should call Supabase with correct parameters and return topics', async () => {
      const mockTopics = [{ id: 'ph1', topic_key: 'phtopic1', title: 'PH Topic 1', category_key: 'phcat1' }];
      mockClientOrder_test.mockResolvedValueOnce({ data: mockTopics, error: null });
      const result = await getPostHarvestTopics('en');

      expect(mockClientFrom_test).toHaveBeenCalledWith('post_harvest_content');
      expect(mockClientSelect_test).toHaveBeenCalledWith('id, topic_key, title, category_key');
      expect(mockClientEq_test).toHaveBeenCalledWith('language_code', 'en');
      expect(mockClientOrder_test).toHaveBeenCalledWith('title');
      expect(result.data).toEqual(mockTopics);
      expect(result.error).toBeNull();
    });

     it('should return error string if Supabase fetch fails for topics', async () => {
      const supabaseError = { message: 'Fetch failed for post-harvest topics', code: 'DB_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getPostHarvestTopics('en');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching post-harvest topics');
    });
  });

  describe('getPostHarvestContent', () => {
    it('should call Supabase with correct parameters and return content', async () => {
      const mockContent = { id: 'phc1', topic_key: 'another-topic', title: 'Another PH Topic', body_text: 'More details...' };
      mockClientSingle_test.mockResolvedValueOnce({ data: mockContent, error: null });
      const result = await getPostHarvestContent('another-topic', 'en');

      expect(mockClientFrom_test).toHaveBeenCalledWith('post_harvest_content');
      expect(mockClientSelect_test).toHaveBeenCalledWith('*');
      expect(mockClientEq_test).toHaveBeenNthCalledWith(1, 'topic_key', 'another-topic');
      expect(mockClientEq_test).toHaveBeenNthCalledWith(2, 'language_code', 'en');
      expect(mockClientSingle_test).toHaveBeenCalled();
      expect(result.data).toEqual(mockContent);
      expect(result.error).toBeNull();
    });

    it('should return error string if Supabase fetch fails for content', async () => {
      const supabaseError = { message: 'Fetch failed for post-harvest content', code: 'DB_ERROR', details: '', hint: '' };
      mockClientSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      const result = await getPostHarvestContent('another-topic', 'en');
      expect(result.data).toBeNull();
      expect(result.error).toBe('Error fetching post-harvest content');
    });
  });
});