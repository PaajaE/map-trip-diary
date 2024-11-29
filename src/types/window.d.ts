interface Window {
  MapyCz: {
    load: () => Promise<void>;
    map: (container: HTMLElement, options: any) => any;
    marker: (options: any) => any;
    coords: (lat: number, lng: number) => any;
    card: (options: any) => any;
  };
  navigateToTrip: (tripId: string) => void;
}