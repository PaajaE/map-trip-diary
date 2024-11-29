import config from '../../config';

export interface MapyCzTile {
  url: string;
  minZoom: number;
  maxZoom: number;
}

export class MapyCZService {
  private apiKey = config.mapyCZ.apiKey;
  private baseUrl = 'https://api.mapy.cz/v1';

  getTileUrl(layer: 'base' | 'turist' | 'aerial'): MapyCzTile {
    const layers = {
      base: {
        url: 'https://mapserver.mapy.cz/base-m/{z}-{x}-{y}',
        minZoom: 1,
        maxZoom: 19,
      },
      turist: {
        url: 'https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}',
        minZoom: 1,
        maxZoom: 19,
      },
      aerial: {
        url: 'https://mapserver.mapy.cz/ophoto-m/{z}-{x}-{y}',
        minZoom: 1,
        maxZoom: 19,
      },
    };

    return layers[layer];
  }

  async geocode(query: string) {
    const url = new URL(`${this.baseUrl}/geocode`);
    url.searchParams.append('query', query);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Api-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    return response.json();
  }

  async reverseGeocode(lat: number, lon: number) {
    const url = new URL(`${this.baseUrl}/rgeocode`);
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('lon', lon.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Api-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    return response.json();
  }
}

export const mapyCZService = new MapyCZService();