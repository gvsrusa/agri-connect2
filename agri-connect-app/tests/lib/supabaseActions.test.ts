// Mocking @/services/supabase/client

jest.mock('@/services/supabase/client', () => {
  const localMockSupabaseFrom = jest.fn();
  const localMockSelect = jest.fn();
  const localMockInsert = jest.fn();
  const localMockUpdate = jest.fn();
  const localMockUpsert = jest.fn();
  const localMockEq = jest.fn();
  const localMockSingle = jest.fn();

  const localBuilderInstance = {
    select: localMockSelect,
    insert: localMockInsert,
    update: localMockUpdate,
    upsert: localMockUpsert,
    eq: localMockEq,
    single: localMockSingle,
    // Add other chainable methods if used by supabaseActions.ts, e.g., order
  };

  localMockSupabaseFrom.mockReturnValue(localBuilderInstance);
  localMockSelect.mockReturnValue(localBuilderInstance);
  localMockInsert.mockReturnValue(localBuilderInstance); // Default to chainable
  localMockUpdate.mockReturnValue(localBuilderInstance); // Default to chainable
  localMockUpsert.mockReturnValue(localBuilderInstance); // Default to chainable
  localMockEq.mockReturnValue(localBuilderInstance);
  // localMockSingle is terminal. It should be configured in tests or have a default mockResolvedValue here if always terminal.
  localMockSingle.mockResolvedValue({ data: { mocked_local_single: 'default_data' }, error: null }); // Add a default for single

  return {
    __esModule: true,
    supabase: {
      from: localMockSupabaseFrom,
    },
    // Export mocks for test usage
    mockSupabaseFrom_test: localMockSupabaseFrom,
    mockSelect_test: localMockSelect,
    mockInsert_test: localMockInsert,
    mockUpdate_test: localMockUpdate,
    mockUpsert_test: localMockUpsert,
    mockEq_test: localMockEq,
    mockSingle_test: localMockSingle,
    mockBuilderInstance_test: localBuilderInstance,
  };
});

// Import the module to be tested AFTER ALL mocks are set up
import { 
    getLanguages, 
    getUserPreferredLanguage, 
    upsertUserProfile 
} from '@/lib/supabaseActions';

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('Supabase Actions', () => {
  const {
    mockSupabaseFrom_test,
    mockSelect_test,
    mockInsert_test,
    mockUpdate_test,
    mockUpsert_test,
    mockEq_test,
    mockSingle_test,
    mockBuilderInstance_test,
  } = jest.requireMock('@/services/supabase/client');

  beforeEach(() => {
    mockSupabaseFrom_test.mockClear();
    mockSelect_test.mockClear();
    mockInsert_test.mockClear();
    mockUpdate_test.mockClear();
    mockUpsert_test.mockClear();
    mockEq_test.mockClear();
    mockSingle_test.mockClear();

    (console.log as jest.Mock).mockClear();
    (console.warn as jest.Mock).mockClear();
    (console.error as jest.Mock).mockClear();

    // Reset main mocks to return the builder for chaining
    mockSupabaseFrom_test.mockReturnValue(mockBuilderInstance_test);
    mockSelect_test.mockReturnValue(mockBuilderInstance_test);
    mockInsert_test.mockReturnValue(mockBuilderInstance_test);
    mockUpdate_test.mockReturnValue(mockBuilderInstance_test);
    mockUpsert_test.mockReturnValue(mockBuilderInstance_test);
    mockEq_test.mockReturnValue(mockBuilderInstance_test);
    // mockSingle_test is terminal, configured per test.
  });

  describe('getLanguages', () => {
    it('should fetch and return languages', async () => {
      const mockLanguages = [{ code: 'en', name: 'English' }];
      mockSelect_test.mockResolvedValueOnce({ data: mockLanguages, error: null });
      
      const languages = await getLanguages();
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('languages');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(languages).toEqual(mockLanguages);
    });

    it('should return a default fallback on error', async () => {
      const dbError = { message: 'Fetch error' };
      mockSelect_test.mockResolvedValueOnce({ data: null, error: dbError });
      
      const languages = await getLanguages();
      expect(languages).toEqual([{ code: 'en', name: 'English (Default)', native_name: 'English' }]);
      expect(console.error).toHaveBeenCalledWith('Error fetching languages:', dbError);
    });
  });

  describe('getUserPreferredLanguage', () => {
    const mockUserId = 'user_123';

    it('should return preferred language if user and preference exist', async () => {
      const mockPreference = { preferred_language_code: 'hi' };
      mockSingle_test.mockResolvedValueOnce({ data: mockPreference, error: null });
      
      const lang = await getUserPreferredLanguage(mockUserId);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('users');
      expect(mockSelect_test).toHaveBeenCalledWith('preferred_language_code');
      expect(mockEq_test).toHaveBeenCalledWith('clerk_user_id', mockUserId);
      expect(mockSingle_test).toHaveBeenCalledTimes(1);
      expect(lang).toBe('hi');
    });

    it('should return null if user not found (PGRST116 error)', async () => {
      const mockUserIdNotFound = 'user_not_found';
      const pgrstError = { code: 'PGRST116', message: 'No rows found' };
      mockSingle_test.mockResolvedValueOnce({ data: null, error: pgrstError });
      
      const lang = await getUserPreferredLanguage(mockUserIdNotFound);
      expect(lang).toBeNull();
      expect(console.log).toHaveBeenCalledWith(`No user profile found for clerk_user_id: ${mockUserIdNotFound}. A new one might be created.`);
    });

    it('should return null on other errors', async () => {
      const mockUserIdError = 'user_error';
      const dbError = { message: 'Some DB error' };
      mockSingle_test.mockResolvedValueOnce({ data: null, error: dbError });
      
      const lang = await getUserPreferredLanguage(mockUserIdError);
      expect(lang).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error fetching user preferred language:', dbError);
    });

     it('should return null and warn if no clerkUserId is provided', async () => {
      const lang = await getUserPreferredLanguage('');
      expect(lang).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('getUserPreferredLanguage called without clerkUserId');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });
  });

  describe('upsertUserProfile', () => {
    const mockUserId = 'user_abc';
    const mockProfileData = { clerk_user_id: mockUserId, preferred_language_code: 'en' };

    it('should upsert user with default language if none provided and user is new', async () => {
      mockSingle_test // For the initial fetch of preferred_language_code
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }); // User not found or no language
      mockSingle_test // For the .select().single() after upsert
        .mockResolvedValueOnce({ data: { ...mockProfileData, preferred_language_code: 'en' }, error: null });
      
      const profile = await upsertUserProfile(mockUserId);
      
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('users');
      expect(mockSelect_test).toHaveBeenCalledWith('preferred_language_code');
      expect(mockEq_test).toHaveBeenCalledWith('clerk_user_id', mockUserId);
      
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('users');
      expect(mockUpsert_test).toHaveBeenCalledWith(
        { clerk_user_id: mockUserId, preferred_language_code: 'en' },
        { onConflict: 'clerk_user_id' }
      );
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(profile?.preferred_language_code).toBe('en');
    });

    it('should upsert user with provided language', async () => {
      // The upsertUserProfile with language provided doesn't do a preliminary fetch if lang is given.
      // It directly upserts then selects.
      mockSingle_test.mockResolvedValueOnce({ data: { ...mockProfileData, preferred_language_code: 'mr' }, error: null }); // For .select().single() after upsert

      const profile = await upsertUserProfile(mockUserId, 'mr');
      expect(mockUpsert_test).toHaveBeenCalledWith(
        { clerk_user_id: mockUserId, preferred_language_code: 'mr' },
        { onConflict: 'clerk_user_id' }
      );
      expect(profile?.preferred_language_code).toBe('mr');
      // Check that the preliminary fetch for existing language was NOT made
      const clerkIdCalls = mockEq_test.mock.calls.filter((call: any[]) => call[0] === 'clerk_user_id' && call[1] === mockUserId);
      expect(clerkIdCalls.length).toBe(0); 
    });
    
    it('should use existing language if no new one is provided and user exists', async () => {
      mockSingle_test // For the initial fetch of preferred_language_code
        .mockResolvedValueOnce({ data: { preferred_language_code: 'hi' }, error: null });
      mockSingle_test // For the .select().single() after upsert
        .mockResolvedValueOnce({ data: { ...mockProfileData, preferred_language_code: 'hi' }, error: null });
      
      const profile = await upsertUserProfile(mockUserId);
      
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('users');
      expect(mockSelect_test).toHaveBeenCalledWith('preferred_language_code');
      expect(mockEq_test).toHaveBeenCalledWith('clerk_user_id', mockUserId);
      
      expect(mockUpsert_test).toHaveBeenCalledWith(
        { clerk_user_id: mockUserId, preferred_language_code: 'hi' },
        { onConflict: 'clerk_user_id' }
      );
      expect(profile?.preferred_language_code).toBe('hi');
    });

    it('should return null on upsert error', async () => {
      const dbError = { message: 'Upsert error' };
      // This could be the initial fetch failing or the post-upsert select failing.
      // Assuming it's the post-upsert select().single() for this test.
      // If preferredLanguageCode is provided, initial fetch is skipped.
      mockSingle_test.mockResolvedValueOnce({ data: null, error: dbError });
      
      const profile = await upsertUserProfile(mockUserId, 'en');
      expect(profile).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error upserting user profile:', dbError);
    });

    it('should return null and error if no clerkUserId is provided', async () => {
      const profile = await upsertUserProfile('');
      expect(profile).toBeNull();
      expect(console.error).toHaveBeenCalledWith('upsertUserProfile called without clerkUserId');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });
  });
});