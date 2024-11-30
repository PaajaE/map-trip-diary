import { gpx } from '@tmcw/togeojson';

export async function gpxToGeoJSON(gpxString: string) {
  try {
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxString, 'text/xml');
    
    // Check for parsing errors
    if (gpxDoc.documentElement.nodeName === "parsererror") {
      throw new Error("Error parsing GPX XML");
    }
    
    const geoJSON = gpx(gpxDoc);
    console.log('Converted GPX to GeoJSON:', geoJSON);
    return geoJSON;
  } catch (error) {
    console.error('Error converting GPX to GeoJSON:', error);
    throw error;
  }
}