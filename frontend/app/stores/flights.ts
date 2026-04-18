import { defineStore } from 'pinia';

export const useFlightsStore = defineStore('flights', () => {
  const flights = ref<any[]>([]);
  const loading = ref(false);
  const hasMore = ref(true);

  function setFlights(newFlights: any[]) {
    flights.value = newFlights;
  }

  function addFlights(newFlights: any[]) {
    flights.value = [...flights.value, ...newFlights];
  }

  function clearFlights() {
    flights.value = [];
    hasMore.value = true;
  }

  return {
    flights,
    loading,
    hasMore,
    setFlights,
    addFlights,
    clearFlights,
  };
});
