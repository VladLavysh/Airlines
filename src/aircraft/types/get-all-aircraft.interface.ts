export interface IGetAllAircraft extends IEntityFields {
  limit: number;
  offset: number;
  order_by: keyof IEntityFields;
  order: 'asc' | 'desc';
  total_seats_from?: number;
  total_seats_to?: number;
}

export interface IEntityFields {
  name?: string;
  registration_number?: string;
  manufacturer?: string;
  year?: number;
  airline_id?: number;
}