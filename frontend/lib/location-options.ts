export const STATE_CITY_OPTIONS = [
  { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'] },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Solapur', 'Nashik'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Vellore'] },
  { state: 'Delhi NCR', cities: ['NCR', 'Noida', 'Delhi', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Meerut'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Durgapur', 'Asansol', 'Siliguri'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Baroda', 'Surat', 'Vadodara'] },
  { state: 'Rajasthan', cities: ['Jaipur'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Agra', 'Varanasi'] },
  { state: 'Kerala', cities: ['Cochin', 'Calicut', 'Thiruvalla'] },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar'] },
  { state: 'Madhya Pradesh', cities: ['Indore', 'Bhopal', 'Jabalpur'] },
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada'] },
  { state: 'Chandigarh', cities: ['Chandigarh'] },
  { state: 'Goa', cities: ['Goa'] },
  { state: 'Odisha', cities: ['Bhubaneswar'] },
  { state: 'Assam', cities: ['Guwahati'] },
  { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur'] },
  { state: 'Uttarakhand', cities: ['Dehradun'] },
  { state: 'Puducherry', cities: ['Pondicherry'] },
  { state: 'Chhattisgarh', cities: ['Raipur'] },
  { state: 'Malaysia', cities: ['Kuala Lumpur'] },
  { state: 'Other', cities: ['Unknown', 'Default'] },
] as const;

export const ALL_CITIES = Array.from(
  new Set(STATE_CITY_OPTIONS.flatMap((entry) => entry.cities)),
).sort((a, b) => a.localeCompare(b));

export function getCitiesForState(state: string) {
  return STATE_CITY_OPTIONS.find((entry) => entry.state === state)?.cities ?? ALL_CITIES;
}
