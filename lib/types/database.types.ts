// Database types generated from Supabase schema

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string | null;
                    phone_number: string | null;
                    full_name: string;
                    profile_image_url: string | null;
                    encrypted_pin: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    phone_number?: string | null;
                    full_name: string;
                    profile_image_url?: string | null;
                    encrypted_pin?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    phone_number?: string | null;
                    full_name?: string;
                    profile_image_url?: string | null;
                    encrypted_pin?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            bus_stops: {
                Row: {
                    id: string;
                    name: string;
                    latitude: number;
                    longitude: number;
                    address: string;
                    city: string;
                    created_at: string;
                };
            };
            routes: {
                Row: {
                    id: string;
                    route_number: string;
                    route_name: string;
                    description: string | null;
                    estimated_duration: string | null;
                    status: 'active' | 'inactive' | 'maintenance';
                    created_at: string;
                    updated_at: string;
                };
            };
            buses: {
                Row: {
                    id: string;
                    bus_number: string;
                    route_id: string | null;
                    total_seats: number;
                    available_seats: number;
                    status: 'available' | 'full' | 'maintenance' | 'out_of_service';
                    current_latitude: number | null;
                    current_longitude: number | null;
                    last_location_update: string | null;
                    created_at: string;
                    updated_at: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    transaction_code: string;
                    route_id: string;
                    origin_stop_id: string;
                    destination_stop_id: string;
                    amount: number;
                    quantity: number;
                    payment_method: string;
                    payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'expired';
                    midtrans_transaction_id: string | null;
                    midtrans_order_id: string | null;
                    purchase_date: string;
                    created_at: string;
                    updated_at: string;
                };
            };
            tickets: {
                Row: {
                    id: string;
                    transaction_id: string;
                    ticket_code: string;
                    qr_code_data: string;
                    status: 'active' | 'used' | 'expired' | 'cancelled';
                    valid_until: string;
                    used_at: string | null;
                    created_at: string;
                };
            };
        };
    };
}

// User type
export type User = Database['public']['Tables']['users']['Row'];

// Bus Stop type
export type BusStop = Database['public']['Tables']['bus_stops']['Row'];

// Route type
export type Route = Database['public']['Tables']['routes']['Row'];

// Bus type
export type Bus = Database['public']['Tables']['buses']['Row'];

// Transaction type
export type Transaction = Database['public']['Tables']['transactions']['Row'];

// Ticket type
export type Ticket = Database['public']['Tables']['tickets']['Row'];

// Auth types
export interface AuthSession {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
}
