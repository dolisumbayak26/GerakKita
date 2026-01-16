import { supabase } from '../../supabase';
import { updateUserProfile } from '../auth';

// Mock supabase client
jest.mock('../../supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('updateUserProfile', () => {
    const mockUserId = 'user-123';
    const mockUpdates = { phone_number: '081234567890' };
    const mockResponse = { data: { id: mockUserId, ...mockUpdates }, error: null };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update user profile successfully', async () => {
        // Setup mock chain
        const mockSelect = jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockResponse),
        });
        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: mockSelect,
            }),
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: mockUpdate,
        });

        const result = await updateUserProfile(mockUserId, mockUpdates);

        expect(supabase.from).toHaveBeenCalledWith('users');
        expect(mockUpdate).toHaveBeenCalledWith(mockUpdates);
        // Verify eq was called with correct ID
        // Note: checking nested mocks can be verbose, main thing is the flow executes
        expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when update fails', async () => {
        const mockError = { message: 'Update failed' };

        const mockSelect = jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        });
        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                select: mockSelect,
            }),
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: mockUpdate,
        });

        await expect(updateUserProfile(mockUserId, mockUpdates)).rejects.toEqual(mockError);
    });

    it('should verify correct chaining of supabase methods', async () => {
        // Detailed spy to verify: supabase.from('users').update(...).eq('id', ...).select().single()
        const singleMock = jest.fn().mockResolvedValue(mockResponse);
        const selectMock = jest.fn().mockReturnValue({ single: singleMock });
        const eqMock = jest.fn().mockReturnValue({ select: selectMock });
        const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
        const fromMock = jest.fn().mockReturnValue({ update: updateMock });

        (supabase.from as jest.Mock).mockImplementation(fromMock);

        await updateUserProfile(mockUserId, mockUpdates);

        expect(fromMock).toHaveBeenCalledWith('users');
        expect(updateMock).toHaveBeenCalledWith(mockUpdates);
        expect(eqMock).toHaveBeenCalledWith('id', mockUserId);
        expect(selectMock).toHaveBeenCalled();
        expect(singleMock).toHaveBeenCalled();
    });
});
