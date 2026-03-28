export interface PlantationParams {
    district?: string;
    block?: string;
    districts?: string[];
    blocks?: string[];
    type?: string;
    department?: string;
    land_ownership?: string;
    from_date?: string;
    to_date?: string;
    status?: string | boolean;
    species?: string;
}

export interface SummaryStats {
    total_sites: number;
    total_plants: number;
    total_species: number;
    by_type: Record<string, number>;
    by_dept: Record<string, number>;
    verified_count: number;
}
