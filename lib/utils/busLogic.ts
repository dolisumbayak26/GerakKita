import { Bus } from '@/lib/types/database.types';

export type BusCapacityStatus = 'low' | 'medium' | 'full';

export interface BusStatusInfo {
    label: string;
    color: string;
    icon: string;
    status: BusCapacityStatus;
}

/**
 * Calculates current bus occupancy status based on available seats.
 */
export const getBusCapacityStatus = (totalSeats: number, availableSeats: number): BusStatusInfo => {
    const occupancyRate = (totalSeats - availableSeats) / totalSeats;

    if (occupancyRate >= 0.9) {
        return { label: 'Penuh', color: '#EF4444', icon: 'people', status: 'full' }; // Red
    } else if (occupancyRate >= 0.5) {
        return { label: 'Setengah Penuh', color: '#F59E0B', icon: 'people-outline', status: 'medium' }; // Amber
    } else {
        return { label: 'Kapasitas Rendah', color: '#10B981', icon: 'person-outline', status: 'low' }; // Green
    }
};

/**
 * Calculates ETA for a bus to the user's current location (or nearest stop).
 * 
 * TODO: Integrate with Google Maps Distance Matrix API.
 * Currently returns a simulated value based on relative simulated positions or random variance.
 * 
 * @param bus The bus object
 * @param userLocation User's current coordinates (optional)
 * @returns Estimated arrival time in minutes (number)
 */
export const calculateBusETA = (bus: Bus, userLocation?: { latitude: number; longitude: number }): number => {
    // Placeholder logic for MVP
    // In a real app, we would:
    // 1. Get bus.current_latitude/longitude
    // 2. Call Google Maps API to get duration to userLocation

    // For now, return a mock value between 5 and 20 minutes
    // We can use the bus ID to make it deterministic but "random-looking"
    const mockHash = bus.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockMinutes = 5 + (mockHash % 15);

    return mockMinutes;
};

export const formatETAText = (minutes: number): string => {
    if (minutes < 1) return 'Tiba sekarang';
    return `Tiba dalam ${minutes} mnt`;
};
