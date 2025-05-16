import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Mocking @supabase/ssr
// The factory function will define and return the mocks.
// We will then import these mocks using jest.requireMock.

jest.mock('@supabase/ssr', () => {
  const localMockSupabaseFrom = jest.fn();
  const localMockSelect = jest.fn();
  const localMockInsert = jest.fn();
  const localMockUpdate = jest.fn();
  const localMockDelete = jest.fn();
  const localMockEq = jest.fn();
  const localMockOrder = jest.fn();
  const localMockSingle = jest.fn();
  const localMockAuthGetUser = jest.fn();

  const localBuilderInstance = {
    select: localMockSelect,
    insert: localMockInsert,
    update: localMockUpdate,
    'delete': localMockDelete, // Quoted
    eq: localMockEq,
    order: localMockOrder,
    single: localMockSingle,
  };

  localMockSupabaseFrom.mockReturnValue(localBuilderInstance);
  localMockSelect.mockReturnValue(localBuilderInstance);
  localMockInsert.mockReturnValue(localBuilderInstance);
  localMockUpdate.mockReturnValue(localBuilderInstance);
  localMockDelete.mockReturnValue(localBuilderInstance);
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
    mockUpdate_test: localMockUpdate,
    mockDelete_test: localMockDelete,
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
  createProduceListing,
  getAllProduceListings,
  getProduceListingById,
  getProduceListingsByUserId,
  updateProduceListing,
  deleteProduceListing,
  type ProduceListing,
  type CreateProduceListingInput,
  type UpdateProduceListingInput,
} from '@/lib/marketplaceActions';


const mockUser = { id: 'test-user-id', email: 'user@example.com' };
const mockListing: ProduceListing = {
  listing_id: 'test-listing-id', 
  seller_user_id: mockUser.id,
  crop_type: 'Tomatoes',
  quantity: 100,
  price: 5.99,
  description: 'Fresh tomatoes',
  status: 'available', 
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};


describe('Marketplace Actions', () => {
  // Get references to the exported mocks
  const {
    mockSupabaseFrom_test,
    mockSelect_test,
    mockInsert_test,
    mockUpdate_test,
    mockDelete_test,
    mockEq_test,
    mockOrder_test,
    mockSingle_test,
    mockAuthGetUser_test,
    mockBuilderInstance_test,
  } = jest.requireMock('@supabase/ssr');

  beforeEach(() => {
    mockSupabaseFrom_test.mockClear();
    mockSelect_test.mockClear();
    mockInsert_test.mockClear();
    mockUpdate_test.mockClear();
    mockDelete_test.mockClear();
    mockEq_test.mockClear();
    mockOrder_test.mockClear();
    mockSingle_test.mockClear();
    mockAuthGetUser_test.mockClear();
    (cookies as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();

    // Re-configure default return values for chainable mocks
    mockSupabaseFrom_test.mockReturnValue(mockBuilderInstance_test);
    mockSelect_test.mockReturnValue(mockBuilderInstance_test);
    mockInsert_test.mockReturnValue(mockBuilderInstance_test);
    mockUpdate_test.mockReturnValue(mockBuilderInstance_test);
    mockDelete_test.mockReturnValue(mockBuilderInstance_test);
    mockEq_test.mockReturnValue(mockBuilderInstance_test);
    mockOrder_test.mockReturnValue(mockBuilderInstance_test);
    mockAuthGetUser_test.mockResolvedValue({ data: { user: mockUser }, error: null });
    
    (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn(),
      }
    );
  });

  describe('createProduceListing', () => {
    const validInput: CreateProduceListingInput = { 
      crop_type: 'Apples', 
      quantity: 50, 
      price: 2.50, 
      description: 'Crisp apples',
      status: 'available', 
    };

    it('should create a listing successfully', async () => {
      const expectedCreatedListing: ProduceListing = { 
        ...mockListing, 
        listing_id: 'new-listing-id', 
        seller_user_id: mockUser.id, 
        crop_type: validInput.crop_type,
        quantity: validInput.quantity,
        price: validInput.price,
        description: validInput.description,
        status: validInput.status || 'available', 
      };
      mockSingle_test.mockResolvedValueOnce({ data: expectedCreatedListing, error: null });
      
      const result = await createProduceListing(validInput);
      
      expect(mockAuthGetUser_test).toHaveBeenCalled();
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('produce_listings');
      expect(mockInsert_test).toHaveBeenCalledWith([expect.objectContaining({
        ...validInput,
        seller_user_id: mockUser.id,
        status: validInput.status || 'available',
       })]);
      expect(mockSelect_test).toHaveBeenCalledWith();
      expect(mockSingle_test).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/[locale]/marketplace', 'page');
      expect(revalidatePath).toHaveBeenCalledWith(`/[locale]/marketplace/list-crop`, 'page');
      expect(result.data).toEqual(expectedCreatedListing);
      expect(result.error).toBeUndefined(); 
      expect(result.errorFields).toBeUndefined();
    });

    it('should return Zod validation error if input is invalid', async () => {
      const invalidInput = { crop_type: '', quantity: -5, price: -1, status: 'invalid_status' };
      const result = await createProduceListing(invalidInput as any); 
      
      expect(result.data).toBeUndefined(); 
      expect(result.error).toContain('Validation failed');
      expect(result.errorFields).toBeDefined();
      expect(result.errorFields?.crop_type).toBeDefined();
      expect(result.errorFields?.quantity).toBeDefined();
      expect(result.errorFields?.price).toBeDefined();
      expect(result.errorFields?.status).toBeDefined();
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });

    it('should return error if user is not authenticated', async () => {
      mockAuthGetUser_test.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Auth error' } });
      const result = await createProduceListing(validInput);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('User not authenticated or error fetching user.');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });

    it('should return Supabase error message if Supabase insert fails', async () => {
      const supabaseError = { message: 'Insert failed', code: 'DB_INSERT_ERROR' };
      mockSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await createProduceListing(validInput);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe(supabaseError.message); 
      expect(result.errorFields).toBeUndefined();
    });
  });

  describe('getAllProduceListings', () => {
    it('should fetch all listings successfully', async () => {
      const listings = [mockListing, { ...mockListing, listing_id: 'another-id' }];
      mockOrder_test.mockResolvedValueOnce({ data: listings, error: null });
      
      const result = await getAllProduceListings();
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('produce_listings');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockOrder_test).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(listings);
      expect(result.error).toBeUndefined();
    });

    it('should return Supabase error message if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch all failed', code: 'DB_FETCH_ERROR' };
      mockOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getAllProduceListings();
      expect(result.data).toBeUndefined();
      expect(result.error).toBe(supabaseError.message);
    });
  });

  describe('getProduceListingById', () => {
    it('should fetch a listing by ID successfully', async () => {
      mockSingle_test.mockResolvedValueOnce({ data: mockListing, error: null });
      
      const result = await getProduceListingById(mockListing.listing_id as string);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('produce_listings');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockEq_test).toHaveBeenCalledWith('listing_id', mockListing.listing_id);
      expect(mockSingle_test).toHaveBeenCalled();
      expect(result.data).toEqual(mockListing);
      expect(result.error).toBeUndefined();
    });
    
    it('should return Supabase error message if Supabase fetch by ID fails', async () => {
      const supabaseError = { message: 'Fetch by ID failed', code: 'DB_FETCH_ID_ERROR' };
      mockSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getProduceListingById(mockListing.listing_id as string);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe(supabaseError.message);
    });

    it('should return error if listingId is not provided', async () => {
        const result = await getProduceListingById('');
        expect(result.error).toBe('Listing ID is required.');
        expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });
  });

  describe('getProduceListingsByUserId', () => {
    it('should fetch listings by user ID successfully', async () => {
      const userListings = [mockListing];
      mockOrder_test.mockResolvedValueOnce({ data: userListings, error: null });
      
      const result = await getProduceListingsByUserId(mockUser.id);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('produce_listings');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockEq_test).toHaveBeenCalledWith('seller_user_id', mockUser.id);
      expect(mockOrder_test).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(userListings);
      expect(result.error).toBeUndefined();
    });

    it('should return Supabase error message if Supabase fetch by user ID fails', async () => {
      const supabaseError = { message: 'Fetch by user ID failed', code: 'DB_FETCH_USER_ERROR' };
      mockOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getProduceListingsByUserId(mockUser.id);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe(supabaseError.message);
    });

     it('should return error if userId is not provided', async () => {
        const result = await getProduceListingsByUserId('');
        expect(result.error).toBe('User ID is required.');
        expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });
  });

  describe('updateProduceListing', () => {
    const updateInput: UpdateProduceListingInput = { 
      listing_id: mockListing.listing_id as string,
      crop_type: 'Red Tomatoes', 
      quantity: 120, 
      price: 6.50, 
      description: 'Very red tomatoes', 
      status: 'sold', 
    };

    it('should update a listing successfully', async () => {
      const updatedListingData = { ...mockListing, ...updateInput };
      // Ensure this specific mockSingle_test call for the update resolves with the correct data
      mockSingle_test.mockResolvedValueOnce({ data: updatedListingData, error: null });
      
      const result = await updateProduceListing(updateInput);

      expect(mockAuthGetUser_test).toHaveBeenCalledTimes(1);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('produce_listings');
      const { listing_id, ...updatePayload } = updateInput;
      expect(mockUpdate_test).toHaveBeenCalledWith(updatePayload);
      expect(mockEq_test).toHaveBeenCalledWith('listing_id', listing_id);
      expect(mockEq_test).toHaveBeenCalledWith('seller_user_id', mockUser.id);
      expect(mockSelect_test).toHaveBeenCalledWith();
      expect(mockSingle_test).toHaveBeenCalled();
      
      expect(revalidatePath).toHaveBeenCalledWith('/[locale]/marketplace', 'page');
      expect(revalidatePath).toHaveBeenCalledWith(`/[locale]/marketplace/list-crop`, 'page');
      expect(revalidatePath).toHaveBeenCalledWith(`/[locale]/marketplace/edit-crop/${listing_id}`, 'page');
      expect(result.data).toEqual(updatedListingData);
      expect(result.error).toBeUndefined();
    });
    
    it('should return error if user is not authenticated', async () => {
      mockAuthGetUser_test.mockResolvedValueOnce({ data: { user: null }, error: {message: 'Auth error'} });
      const result = await updateProduceListing(updateInput);
      expect(result.error).toBe('User not authenticated or error fetching user.');
    });

    it('should return error if listing_id is not provided in input', async () => {
      const result = await updateProduceListing({ crop_type: 'test' } as UpdateProduceListingInput);
      expect(result.error).toBe('Listing ID is required for an update.');
    });

    it('should return error if no fields to update are provided', async () => {
      const result = await updateProduceListing({ listing_id: mockListing.listing_id as string } as UpdateProduceListingInput);
      expect(result.error).toBe('No fields provided to update.');
    });
    
    it('should return Zod validation error for invalid fields', async () => {
        const invalidUpdate: UpdateProduceListingInput = { listing_id: mockListing.listing_id as string, price: -10 };
        const result = await updateProduceListing(invalidUpdate);
        expect(result.error).toBe('Validation failed');
        expect(result.errorFields?.price).toBeDefined();
    });

    it('should return error if Supabase update fails or listing not found/not authorized', async () => {
      const supabaseError = { message: 'Update failed or not found', code: 'DB_UPDATE_ERROR' };
      // This mockSingle_test is for the .select().single() part of the update chain
      mockSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await updateProduceListing(updateInput);
      expect(result.error).toBe(supabaseError.message);
    });
  });

  describe('deleteProduceListing', () => {
    it('should delete a listing successfully', async () => {
      // The chain is .delete().eq().eq()
      // The second .eq() resolves the promise for the delete operation.
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // For .eq('listing_id', ...)
        .mockResolvedValueOnce({ error: null });   // For .eq('seller_user_id', ...) and final promise

      const result = await deleteProduceListing(mockListing.listing_id as string);
      
      expect(mockAuthGetUser_test).toHaveBeenCalledTimes(1);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('produce_listings');
      expect(mockDelete_test).toHaveBeenCalled(); // delete() was called
      expect(mockEq_test).toHaveBeenNthCalledWith(1, 'listing_id', mockListing.listing_id as string);
      expect(mockEq_test).toHaveBeenNthCalledWith(2, 'seller_user_id', mockUser.id);
      
      expect(revalidatePath).toHaveBeenCalledWith('/[locale]/marketplace', 'page');
      expect(revalidatePath).toHaveBeenCalledWith(`/[locale]/marketplace/list-crop`, 'page');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error if user is not authenticated', async () => {
      mockAuthGetUser_test.mockResolvedValueOnce({ data: { user: null }, error: {message: 'Auth error'} });
      const result = await deleteProduceListing(mockListing.listing_id as string);
      expect(result.error).toBe('User not authenticated or error fetching user.');
    });
    
    it('should return error if listingId is not provided', async () => {
        const result = await deleteProduceListing('');
        expect(result.error).toBe('Listing ID is required.');
    });

    it('should return Supabase error message if Supabase delete fails', async () => {
      const supabaseError = { message: 'Delete failed', code: 'DB_DELETE_ERROR' };
      // The second .eq() in the chain resolves with an error.
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // For .eq('listing_id', ...)
        .mockResolvedValueOnce({ error: supabaseError }); // For .eq('seller_user_id', ...) and final promise
      
      const result = await deleteProduceListing(mockListing.listing_id as string);
      expect(result.error).toBe(supabaseError.message); // Ensure this matches the actual error handling in deleteProduceListing
      expect(result.success).toBeUndefined();
    });
  });
});