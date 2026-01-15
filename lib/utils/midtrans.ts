import { Buffer } from 'buffer';

const MIDTRANS_SERVER_KEY = process.env.EXPO_PUBLIC_MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY_HERE';
const MIDTRANS_API_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export interface SnapTransactionParams {
    order_id: string;
    gross_amount: number;
    customer_details?: {
        first_name: string;
        email: string;
        phone?: string;
    };
    parameter?: {
        enabled_payments?: string[]; // qris, gopay, shopeepay, etc.
    }
}

export const getSnapToken = async (params: SnapTransactionParams) => {
    try {
        const serverKey = MIDTRANS_SERVER_KEY;
        console.log('Using Midtrans Server Key:', serverKey ? `${serverKey.substring(0, 5)}...` : 'UNDEFINED');

        const authString = Buffer.from(serverKey + ':').toString('base64');

        const body = {
            transaction_details: {
                order_id: params.order_id,
                gross_amount: params.gross_amount,
            },
            customer_details: params.customer_details,
            enabled_payments: params.parameter?.enabled_payments || ['gopay', 'shopeepay', 'qris', 'bank_transfer', 'echannel'],
            credit_card: {
                secure: true
            }
        };

        console.log('Requesting Snap Token with:', JSON.stringify(body, null, 2));

        const response = await fetch(MIDTRANS_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`,
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Midtrans Error:', data);
            throw new Error(data.error_messages?.[0] || 'Failed to get Snap Token');
        }

        return data; // contains token and redirect_url
    } catch (error) {
        console.error('Midtrans Service Error:', error);
        throw error;
    }
};
