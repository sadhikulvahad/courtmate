import axios from 'axios';

interface AddressConfig {
    street: string;
    state: string;
    pincode: number | string;
    country: string;
    city: string;
}

interface Position {
    lat: number;
    lng: number;
}

export const getCoordinates = async (address: AddressConfig): Promise<Position | null> => {
    const { street, city, state, pincode, country } = address;
    // Try full address first
    let query = encodeURIComponent(`${street}, ${city}, ${state}, ${pincode}, ${country || 'India'}`);
    let url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'CourtMate/1.0 (courtmate.official@gmail.com)',
            },
        });

        const data = response.data;
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }

        // Fallback to city, state, country
        query = encodeURIComponent(`${city}, ${state}, ${country || 'India'}`); 
        url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        const fallbackResponse = await axios.get(url, {
            headers: {
                'User-Agent': 'CourtMate/1.0 (courtmate.official@gmail.com)',
            },
        });
        const fallbackData = fallbackResponse.data;
        if (fallbackData.length > 0) {
            return { lat: parseFloat(fallbackData[0].lat), lng: parseFloat(fallbackData[0].lon) };
        }

        return null;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
};