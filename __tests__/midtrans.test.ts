import { getSnapToken } from '../lib/utils/midtrans';

// Mock global fetch
global.fetch = jest.fn();

describe('Midtrans Integration', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('getSnapToken calls Midtrans API with correct parameters', async () => {
        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                token: 'mock-snap-token',
                redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-token'
            })
        });

        const params = {
            order_id: 'ORDER-123',
            gross_amount: 10000,
            customer_details: {
                first_name: 'John Doe',
                email: 'john@example.com'
            }
        };

        const result = await getSnapToken(params);

        // Verify result
        expect(result).toEqual({
            token: 'mock-snap-token',
            redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-token'
        });

        // Verify fetch arguments
        expect(global.fetch).toHaveBeenCalledWith(
            'https://app.sandbox.midtrans.com/snap/v1/transactions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // We check if Authorization header is present, but checking precise Base64 might be brittle 
                    // if env var changes, so just checking presence is good for now.
                    'Authorization': expect.stringMatching(/^Basic /)
                }),
                body: expect.stringContaining('"order_id":"ORDER-123"')
            })
        );
    });

    it('getSnapToken throws error when API response is not ok', async () => {
        // Mock error response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                error_messages: ['Access denied']
            })
        });

        await expect(getSnapToken({
            order_id: 'ORDER-ERR',
            gross_amount: 5000
        })).rejects.toThrow('Access denied');
    });
});
