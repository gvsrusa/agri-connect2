import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Mocking @supabase/ssr
jest.mock('@supabase/ssr', () => {
  const localMockSupabaseFrom = jest.fn();
  const localMockSelect = jest.fn();
  const localMockInsert = jest.fn();
  const localMockEq = jest.fn();
  const localMockOrder = jest.fn();
  const localMockSingle = jest.fn();
  const localMockAuthGetUser = jest.fn();

  const localBuilderInstance = {
    select: localMockSelect,
    insert: localMockInsert,
    eq: localMockEq,
    order: localMockOrder,
    single: localMockSingle,
    // Add other chainable methods if used by feedbackActions.ts
  };

  localMockSupabaseFrom.mockReturnValue(localBuilderInstance);
  localMockSelect.mockReturnValue(localBuilderInstance);
  localMockInsert.mockReturnValue(localBuilderInstance);
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
    mockInsert_test: localMockInsert,
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
  submitUserFeedback,
  getFeedbackByUser,
  getAllFeedback,
  UserFeedback 
} from '@/lib/feedbackActions';


const mockUser = { id: 'test-user-id', email: 'user@example.com' };
const mockFeedbackData: UserFeedback = { 
  feedback_id: 'test-feedback-id',
  user_id: mockUser.id,
  rating: 4,
  comments: 'The application is very helpful but could use some improvements in the UI.',
  page_context: 'market-prices',
  created_at: new Date().toISOString(),
};

describe('Feedback Actions', () => {
  const {
    mockClientFrom_test,
    mockClientSelect_test,
    mockClientInsert_test,
    mockClientEq_test,
    mockClientOrder_test,
    mockClientSingle_test,
  } = jest.requireMock('@/services/supabase/client');
  
  // For functions using createServerClient (if any in feedbackActions, though unlikely for lib)
  // We still might need mockAuthGetUser_test if any server-context user fetching is indirectly triggered
  const {
    mockAuthGetUser_test
  } = jest.requireMock('@supabase/ssr');

  beforeEach(() => {
    mockClientFrom_test.mockClear();
    mockClientSelect_test.mockClear();
    mockClientInsert_test.mockClear();
    mockClientEq_test.mockClear();
    mockClientOrder_test.mockClear();
    mockClientSingle_test.mockClear();
    mockAuthGetUser_test.mockClear();
    (cookies as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();

    // Default return values are set in jest.setup.js
    // For SSR auth mock, if needed by any indirect calls (though feedbackActions primarily uses client)
    mockAuthGetUser_test.mockResolvedValue({ data: { user: mockUser }, error: null });

    (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn(),
      }
    );
  });

  describe('submitUserFeedback', () => {
    it('should submit feedback successfully with user ID', async () => {
      const feedbackToSubmit: UserFeedback = {
        user_id: mockUser.id,
        rating: 4,
        comments: 'The application is very helpful but could use some improvements in the UI.',
        page_context: 'market-prices',
      };
      const expectedReturnedFeedback = { ...feedbackToSubmit, feedback_id: 'new-feedback-id', created_at: new Date().toISOString() };
      mockClientSingle_test.mockResolvedValueOnce({ data: expectedReturnedFeedback, error: null });
            
      const result = await submitUserFeedback(feedbackToSubmit);
      expect(mockClientFrom_test).toHaveBeenCalledWith('user_feedback');
      expect(mockClientInsert_test).toHaveBeenCalledWith([feedbackToSubmit]);
      expect(mockClientSelect_test).toHaveBeenCalledWith('*'); // This was part of the original test, assuming select after insert
      expect(mockClientSingle_test).toHaveBeenCalled();
      expect(result.data).toEqual(expectedReturnedFeedback);
      expect(result.error).toBeNull();
    });

    it('should submit anonymous feedback successfully without user ID', async () => {
      const anonymousFeedbackInput: UserFeedback = {
        user_id: null,
        rating: 5,
        comments: 'Great app! Very intuitive.',
        page_context: 'homepage',
      };
      const expectedReturnedAnonymousFeedback = { ...anonymousFeedbackInput, feedback_id: 'anon-feedback-id', created_at: new Date().toISOString() };
      mockClientSingle_test.mockResolvedValueOnce({ data: expectedReturnedAnonymousFeedback, error: null });
      
      const result = await submitUserFeedback(anonymousFeedbackInput);
      expect(result.data).toEqual(expectedReturnedAnonymousFeedback);
      expect(mockClientFrom_test).toHaveBeenCalledWith('user_feedback');
      expect(mockClientInsert_test).toHaveBeenCalledWith([anonymousFeedbackInput]);
      expect(result.error).toBeNull();
    });

    it('should return error if comments are missing', async () => {
      const input = {
        user_id: mockUser.id,
        rating: 4,
        comments: '',
        page_context: 'market-prices',
      };
      
      const result = await submitUserFeedback(input as UserFeedback);
      expect(result.error).toBe('Comments are required');
      expect(mockClientFrom_test).not.toHaveBeenCalled();
    });

    it('should return error if rating is invalid (too high)', async () => {
      const input = {
        user_id: mockUser.id,
        rating: 10,
        comments: 'The application is helpful.',
        page_context: 'market-prices',
      };
      
      const result = await submitUserFeedback(input as UserFeedback);
      expect(result.error).toBe('Rating must be a number between 1 and 5');
      expect(mockClientFrom_test).not.toHaveBeenCalled();
    });

    it('should return error if rating is invalid (too low)', async () => {
        const input = {
          user_id: mockUser.id,
          rating: 0,
          comments: 'The application is helpful.',
          page_context: 'market-prices',
        };
        const result = await submitUserFeedback(input as UserFeedback);
        expect(result.error).toBe('Rating must be a number between 1 and 5');
        expect(mockClientFrom_test).not.toHaveBeenCalled();
    });

    it('should return "Error submitting feedback" if Supabase insert fails', async () => {
      const supabaseError = { message: 'Insert failed', code: 'DB_INSERT_ERROR', details: '', hint: '' };
      mockClientSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const input: UserFeedback = {
        user_id: mockUser.id,
        rating: 4,
        comments: 'The application is very helpful.',
        page_context: 'market-prices',
      };
      
      const result = await submitUserFeedback(input);
      expect(result.error).toBe('Error submitting feedback'); // The function constructs this message
      expect(result.data).toBeNull();
    });

    it('should return "Authentication error. Try submitting anonymously." if auth error (42501) occurs', async () => {
      const supabaseAuthError = { code: '42501', message: 'Authentication error', details: '', hint: '' };
      mockClientSingle_test.mockResolvedValueOnce({ data: null, error: supabaseAuthError });
      
      const input: UserFeedback = {
        user_id: 'unauthenticated-user-id',
        rating: 4,
        comments: 'The application is very helpful.',
        page_context: 'market-prices',
      };
      
      const result = await submitUserFeedback(input);
      expect(result.error).toBe('Authentication error. Try submitting anonymously.');
      expect(result.data).toBeNull();
    });
  });

  describe('getFeedbackByUser', () => {
    it('should fetch feedback for a user successfully', async () => {
      const userFeedback = [mockFeedbackData];
      mockClientOrder_test.mockResolvedValueOnce({ data: userFeedback, error: null });
      
      const result = await getFeedbackByUser(mockUser.id);
      expect(result.data).toEqual(userFeedback);
      expect(mockClientFrom_test).toHaveBeenCalledWith('user_feedback');
      expect(mockClientSelect_test).toHaveBeenCalledWith('*');
      expect(mockClientEq_test).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockClientOrder_test).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.error).toBeNull();
    });

    it('should return error if user ID is not provided', async () => {
      const result = await getFeedbackByUser('');
      expect(result.error).toBe('User ID is required');
      expect(mockClientFrom_test).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
    });

    it('should return "Error fetching feedback" if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed', code: 'DB_FETCH_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getFeedbackByUser(mockUser.id);
      expect(result.error).toBe('Error fetching feedback');
      expect(result.data).toBeNull();
    });
  });

  describe('getAllFeedback', () => {
    it('should fetch all feedback successfully', async () => {
      const allFeedback = [mockFeedbackData, { ...mockFeedbackData, feedback_id: 'another-feedback-id', user_id: null }];
      mockClientOrder_test.mockResolvedValueOnce({ data: allFeedback, error: null });
      
      const result = await getAllFeedback();
      expect(result.data).toEqual(allFeedback);
      expect(mockClientFrom_test).toHaveBeenCalledWith('user_feedback');
      expect(mockClientSelect_test).toHaveBeenCalledWith('*');
      expect(mockClientOrder_test).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.error).toBeNull();
    });

    it('should return "Error fetching feedback" if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed', code: 'DB_FETCH_ALL_ERROR', details: '', hint: '' };
      mockClientOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getAllFeedback();
      expect(result.error).toBe('Error fetching feedback');
      expect(result.data).toBeNull();
    });
  });
});