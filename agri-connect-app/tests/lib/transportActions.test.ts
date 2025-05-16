import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Mocking @/services/supabase/client
// The factory function will define and return the mocks.
// We will then import these mocks using jest.requireMock.

jest.mock('@/services/supabase/client', () => {
  const localMockSupabaseFrom = jest.fn();
  const localMockSelect = jest.fn();
  const localMockInsert = jest.fn();
  const localMockUpdate = jest.fn();
  const localMockDelete = jest.fn();
  const localMockEq = jest.fn();
  const localMockOrder = jest.fn();
  const localMockSingle = jest.fn();

  const localBuilderInstance = {
    select: localMockSelect,
    insert: localMockInsert,
    update: localMockUpdate,
    'delete': localMockDelete,
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
  // localMockSingle is terminal, specific tests will set its resolved value.

  return {
    __esModule: true, // If supabase/client.ts is an ES module
    supabase: {
      from: localMockSupabaseFrom,
    },
    // Export mocks for test usage
    mockSupabaseFrom_test: localMockSupabaseFrom,
    mockSelect_test: localMockSelect,
    mockInsert_test: localMockInsert,
    mockUpdate_test: localMockUpdate,
    mockDelete_test: localMockDelete,
    mockEq_test: localMockEq,
    mockOrder_test: localMockOrder,
    mockSingle_test: localMockSingle,
    mockBuilderInstance_test: localBuilderInstance, // Export the builder for resetting in beforeEach
  };
});

// Other necessary mocks
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

// Import the module to be tested AFTER ALL mocks are set up
// Import the module to be tested AFTER ALL mocks are set up
import {
  createTransportRequest,
  getTransportRequestsByFarmer,
  getAllTransportRequests,
  getTransporters,
  updateTransportRequestStatus,
  deleteTransportRequest,
  type TransportRequest,
  type Transporter
} from '@/lib/transportActions';


const mockUser = { id: 'test-farmer-id', email: 'farmer@example.com' };
const mockTransportRequest: TransportRequest = {
  request_id: 'test-request-id',
  farmer_user_id: mockUser.id,
  produce_type: 'Wheat',
  quantity: '500 kg',
  pickup_location: 'Farm A, Village XYZ',
  destination_location: 'City Market',
  date_needed: '2025-06-01',
  status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockTransporter: Transporter = {
  transporter_id: 'test-transporter-id',
  name: 'Singh Logistics',
  contact_info: 'Phone: +91 9876543210, Email: contact@singhlogistics.com',
  service_areas: 'Delhi, Haryana, Punjab',
  capacity: 'Medium trucks: 1-5 tons capacity',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('Transport Actions', () => {
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
    mockBuilderInstance_test,
  } = jest.requireMock('@/services/supabase/client');

  beforeEach(() => {
    mockSupabaseFrom_test.mockClear();
    mockSelect_test.mockClear();
    mockInsert_test.mockClear();
    mockUpdate_test.mockClear();
    mockDelete_test.mockClear();
    mockEq_test.mockClear();
    mockOrder_test.mockClear();
    mockSingle_test.mockClear();
    
    (cookies as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();

    // Re-configure default return values for chainable mocks using the exported builder
    mockSupabaseFrom_test.mockReturnValue(mockBuilderInstance_test);
    mockSelect_test.mockReturnValue(mockBuilderInstance_test);
    mockInsert_test.mockReturnValue(mockBuilderInstance_test);
    mockUpdate_test.mockReturnValue(mockBuilderInstance_test);
    mockDelete_test.mockReturnValue(mockBuilderInstance_test);
    mockEq_test.mockReturnValue(mockBuilderInstance_test);
    mockOrder_test.mockReturnValue(mockBuilderInstance_test);
    // mockSingle_test is terminal, its resolution is set per test.

    (cookies as jest.Mock).mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn(),
      }
    );
  });

  describe('createTransportRequest', () => {
    const validInput: Omit<TransportRequest, 'request_id' | 'created_at' | 'updated_at' | 'status'> = {
      farmer_user_id: mockUser.id,
      produce_type: 'Rice',
      quantity: '200 kg',
      pickup_location: 'Farm B, Village ABC',
      destination_location: 'Regional Market',
      date_needed: '2025-06-15',
    };

    it('should create a transport request successfully', async () => {
      const expectedCreatedRequest = { ...mockTransportRequest, ...validInput, request_id: 'new-req-id', status: 'pending' };
      mockSingle_test.mockResolvedValueOnce({ data: expectedCreatedRequest, error: null });
      
      const result = await createTransportRequest(validInput);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('transport_requests');
      expect(mockInsert_test).toHaveBeenCalledWith([validInput]);
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockSingle_test).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/[locale]/request-transportation');
      expect(result.data).toEqual(expectedCreatedRequest);
      expect(result.error).toBeNull();
    });

    it('should return error if required fields are missing (e.g., produce_type)', async () => {
      const invalidInput = { ...validInput, produce_type: '' };
      const result = await createTransportRequest(invalidInput);
      expect(result.error).toBe('Produce type is required');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });

    it('should return "Error creating transport request" if Supabase insert fails', async () => {
      const supabaseError = { message: 'Insert failed', code: 'DB_INSERT_ERROR' };
      mockSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await createTransportRequest(validInput);
      expect(result.error).toBe('Error creating transport request'); 
      expect(result.data).toBeNull();
    });
  });

  describe('getTransportRequestsByFarmer', () => {
    it('should fetch transport requests for a farmer successfully', async () => {
      const farmerRequests = [mockTransportRequest];
      mockOrder_test.mockResolvedValueOnce({ data: farmerRequests, error: null });
      
      const result = await getTransportRequestsByFarmer(mockUser.id);
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('transport_requests');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockEq_test).toHaveBeenCalledWith('farmer_user_id', mockUser.id);
      expect(mockOrder_test).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(farmerRequests);
      expect(result.error).toBeNull();
    });

    it('should return error if farmer ID is not provided', async () => {
      const result = await getTransportRequestsByFarmer('');
      expect(result.error).toBe('Farmer user ID is required');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });

    it('should return "Error fetching transport requests" if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch failed', code: 'DB_FETCH_ERROR' };
      mockOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getTransportRequestsByFarmer(mockUser.id);
      expect(result.error).toBe('Error fetching transport requests');
      expect(result.data).toBeNull();
    });
  });

  describe('getAllTransportRequests', () => {
    it('should fetch all transport requests successfully', async () => {
      const allRequests = [mockTransportRequest];
      mockOrder_test.mockResolvedValueOnce({ data: allRequests, error: null });
      
      const result = await getAllTransportRequests();
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('transport_requests');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockOrder_test).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.data).toEqual(allRequests);
      expect(result.error).toBeNull();
    });

    it('should filter requests by status if provided', async () => {
      const pendingRequests = [{...mockTransportRequest, status: 'pending'}];
      mockOrder_test.mockResolvedValueOnce({ data: pendingRequests, error: null });
      
      const result = await getAllTransportRequests('pending');
      expect(mockEq_test).toHaveBeenCalledWith('status', 'pending');
      expect(result.data).toEqual(pendingRequests);
    });

    it('should return "Error fetching transport requests" if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch all failed', code: 'DB_FETCH_ALL_ERROR' };
      mockOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getAllTransportRequests();
      expect(result.error).toBe('Error fetching transport requests');
      expect(result.data).toBeNull();
    });
  });

  describe('getTransporters', () => {
    it('should fetch all transporters successfully', async () => {
      const transporters = [mockTransporter];
      mockOrder_test.mockResolvedValueOnce({ data: transporters, error: null });
      
      const result = await getTransporters();
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('transporters');
      expect(mockSelect_test).toHaveBeenCalledWith('*');
      expect(mockOrder_test).toHaveBeenCalledWith('name');
      expect(result.data).toEqual(transporters);
      expect(result.error).toBeNull();
    });

    it('should return "Error fetching transporters" if Supabase fetch fails', async () => {
      const supabaseError = { message: 'Fetch transporters failed', code: 'DB_FETCH_TRANSPORTERS_ERROR' };
      mockOrder_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await getTransporters();
      expect(result.error).toBe('Error fetching transporters');
      expect(result.data).toBeNull();
    });
  });

  describe('updateTransportRequestStatus', () => {
    const requestId = mockTransportRequest.request_id as string;
    const newStatus = 'confirmed';

    it('should update a transport request status successfully', async () => {
      const updatedRequest = { ...mockTransportRequest, status: newStatus, farmer_user_id: mockUser.id };
      // For ownership check: select().eq().eq().single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test); // farmer_user_id
      mockSingle_test.mockResolvedValueOnce({ data: { ...mockTransportRequest, farmer_user_id: mockUser.id }, error: null });
      
      // For the update operation: update().eq().select().single()
      mockSingle_test.mockResolvedValueOnce({ data: updatedRequest, error: null }); // This mockSingle is for the select().single() after update.
                                                                            // The mockUpdate_test and mockEq_test for the update path will use their default returnValues.
      
      const result = await updateTransportRequestStatus(requestId, newStatus, mockUser.id);
      
      expect(mockSupabaseFrom_test).toHaveBeenNthCalledWith(1, 'transport_requests');
      expect(mockSelect_test).toHaveBeenNthCalledWith(1, '*');
      expect(mockEq_test).toHaveBeenNthCalledWith(1, 'request_id', requestId);
      expect(mockEq_test).toHaveBeenNthCalledWith(2, 'farmer_user_id', mockUser.id);
      expect(mockSingle_test).toHaveBeenNthCalledWith(1);

      expect(mockSupabaseFrom_test).toHaveBeenNthCalledWith(2, 'transport_requests');
      expect(mockUpdate_test).toHaveBeenCalledWith({ status: newStatus });
      expect(mockEq_test).toHaveBeenNthCalledWith(3, 'request_id', requestId);
      expect(mockSelect_test).toHaveBeenNthCalledWith(2, '*');
      expect(mockSingle_test).toHaveBeenNthCalledWith(2);

      expect(revalidatePath).toHaveBeenCalledWith('/[locale]/request-transportation');
      expect(result.data).toEqual(updatedRequest);
      expect(result.error).toBeNull();
    });

    it('should return error if request ID, status, or userId is not provided', async () => {
      let result = await updateTransportRequestStatus('', newStatus, mockUser.id);
      expect(result.error).toBe('Request ID, status, and user ID are required');
      result = await updateTransportRequestStatus(requestId, '', mockUser.id);
      expect(result.error).toBe('Request ID, status, and user ID are required');
      result = await updateTransportRequestStatus(requestId, newStatus, '');
      expect(result.error).toBe('Request ID, status, and user ID are required');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });
    
    it('should return "Error verifying transport request ownership" if ownership check fails with DB error', async () => {
      const fetchError = { message: "Verification failed", code: "FETCH_ERR" };
      // For ownership check select().eq().eq().single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test); // farmer_user_id
      mockSingle_test.mockResolvedValueOnce({ data: null, error: fetchError });
      const result = await updateTransportRequestStatus(requestId, newStatus, mockUser.id);
      expect(result.error).toBe('Error verifying transport request ownership');
    });

    it('should return "Transport request not found or not owned by user" if request not found for user', async () => {
      // For ownership check select().eq().eq().single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test); // farmer_user_id
      mockSingle_test.mockResolvedValueOnce({ data: null, error: null });
      const result = await updateTransportRequestStatus(requestId, newStatus, mockUser.id);
      expect(result.error).toBe('Transport request not found or not owned by user');
    });

    it('should return "Error updating transport request status" if Supabase update fails', async () => {
      // For ownership check select().eq().eq().single() - success
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test); // farmer_user_id
      mockSingle_test.mockResolvedValueOnce({ data: { ...mockTransportRequest, farmer_user_id: mockUser.id }, error: null });
      
      // For the update operation update().eq().select().single() - failure
      const supabaseError = { message: 'Update failed', code: 'DB_UPDATE_ERROR' };
      mockSingle_test.mockResolvedValueOnce({ data: null, error: supabaseError });
      
      const result = await updateTransportRequestStatus(requestId, newStatus, mockUser.id);
      expect(result.error).toBe('Error updating transport request status');
      expect(result.data).toBeNull();
    });
  });

  describe('deleteTransportRequest', () => {
    const requestId = mockTransportRequest.request_id as string;

    it('should delete a transport request successfully if pending', async () => {
      const pendingRequest = { ...mockTransportRequest, status: 'pending', farmer_user_id: mockUser.id };
      // For pre-check: select().eq(request_id).eq(farmer_user_id).eq(status).single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test) // farmer_user_id
        .mockReturnValueOnce(mockBuilderInstance_test); // status
      mockSingle_test.mockResolvedValueOnce({ data: pendingRequest, error: null });
      
      // For delete operation: delete().eq(request_id)
      // mockDelete_test returns builder by default.
      // The .eq() for the delete operation should resolve the promise.
      mockEq_test.mockResolvedValueOnce({ error: null }); // This is for the .eq on the delete chain
      
      const result = await deleteTransportRequest(requestId, mockUser.id);
      
      // Assertions for pre-check
      expect(mockSupabaseFrom_test).toHaveBeenCalledWith('transport_requests'); // Called for pre-check and delete
      expect(mockSelect_test).toHaveBeenCalledWith('*'); // For pre-check
      expect(mockEq_test).toHaveBeenCalledWith('request_id', requestId); // Multiple calls, check specific ones if needed
      expect(mockEq_test).toHaveBeenCalledWith('farmer_user_id', mockUser.id);
      expect(mockEq_test).toHaveBeenCalledWith('status', 'pending');
      expect(mockSingle_test).toHaveBeenCalledTimes(1); // For pre-check

      // Assertions for delete operation
      expect(mockDelete_test).toHaveBeenCalled();
      // The last call to mockEq_test (for the delete operation)
      expect(mockEq_test).toHaveBeenLastCalledWith('request_id', requestId);


      expect(revalidatePath).toHaveBeenCalledWith('/[locale]/request-transportation');
      expect(result.data).toEqual(pendingRequest);
      expect(result.error).toBeNull();
    });
    
    it('should return error if request is not in pending state', async () => {
      const confirmedRequest = { ...mockTransportRequest, status: 'confirmed', farmer_user_id: mockUser.id };
      // For pre-check: select().eq(request_id).eq(farmer_user_id).eq(status).single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test) // farmer_user_id
        .mockReturnValueOnce(mockBuilderInstance_test); // status
      mockSingle_test.mockResolvedValueOnce({ data: confirmedRequest, error: null });
      const result = await deleteTransportRequest(requestId, mockUser.id);
      expect(result.error).toBe('Transport request not found, not owned by user, or not in a deletable state');
      expect(mockDelete_test).not.toHaveBeenCalled();
    });

    it('should return error if request ID or userId is not provided', async () => {
      let result = await deleteTransportRequest('', mockUser.id);
      expect(result.error).toBe('Request ID and user ID are required');
      result = await deleteTransportRequest(requestId, '');
      expect(result.error).toBe('Request ID and user ID are required');
      expect(mockSupabaseFrom_test).not.toHaveBeenCalled();
    });

    it('should return "Transport request not found..." if ownership/status check fails with DB error', async () => {
      const fetchError = { message: "Verification failed", code: "FETCH_ERR" };
      // For pre-check: select().eq(request_id).eq(farmer_user_id).eq(status).single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test) // farmer_user_id
        .mockReturnValueOnce(mockBuilderInstance_test); // status
      mockSingle_test.mockResolvedValueOnce({ data: null, error: fetchError });
      const result = await deleteTransportRequest(requestId, mockUser.id);
      expect(result.error).toBe('Transport request not found, not owned by user, or not in a deletable state');
    });
    
    it('should return "Transport request not found..." if request not found for user/status', async () => {
      // For pre-check: select().eq(request_id).eq(farmer_user_id).eq(status).single()
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test) // farmer_user_id
        .mockReturnValueOnce(mockBuilderInstance_test); // status
      mockSingle_test.mockResolvedValueOnce({ data: null, error: null });
      const result = await deleteTransportRequest(requestId, mockUser.id);
      expect(result.error).toBe('Transport request not found, not owned by user, or not in a deletable state');
    });

    it('should return "Error deleting transport request" if Supabase delete fails', async () => {
      const pendingRequest = { ...mockTransportRequest, status: 'pending', farmer_user_id: mockUser.id };
      // For pre-check: select().eq(request_id).eq(farmer_user_id).eq(status).single() - success
      mockEq_test
        .mockReturnValueOnce(mockBuilderInstance_test) // request_id
        .mockReturnValueOnce(mockBuilderInstance_test) // farmer_user_id
        .mockReturnValueOnce(mockBuilderInstance_test); // status
      mockSingle_test.mockResolvedValueOnce({ data: pendingRequest, error: null });
      
      // For delete operation: delete().eq(request_id) - failure
      const supabaseError = { message: 'Delete failed', code: 'DB_DELETE_ERROR' };
      mockEq_test.mockResolvedValueOnce({ error: supabaseError }); // This is for the .eq on the delete chain
      
      const result = await deleteTransportRequest(requestId, mockUser.id);
      expect(result.error).toBe('Error deleting transport request');
      expect(result.data).toBeNull();
    });
  });
});