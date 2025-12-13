/**
 * iRacing API Request Parameter Types (camelCase)
 * Generated from Postman Collection
 */

// ===== CAR ENDPOINTS =====
export interface GetCarsParams {
  [key: string]: any;
}

export interface GetCarAssetsParams {
  [key: string]: any;
}

// ===== CAR CLASS ENDPOINTS =====
export interface GetCarClassesParams {
  [key: string]: any;
}

// ===== CONSTANTS ENDPOINTS =====
export interface GetDivisionsParams {
  [key: string]: any;
}

export interface GetEventTypesParams {
  [key: string]: any;
}

export interface GetCategoriesParams {
  [key: string]: any;
}

// ===== LEAGUE ENDPOINTS =====
export interface GetLeagueParams {
  leagueId: number;
  includeLicense?: boolean;
  [key: string]: any;
}

export interface GetLeagueSeasonParams {
  leagueId: number;
  seasonId: number;
  [key: string]: any;
}

export interface GetLeagueLicenseGroupParams {
  leagueId: number;
  [key: string]: any;
}

export interface GetLeagueSeasonStandingsParams {
  leagueId: number;
  seasonId: number;
  carClassId?: number;
  [key: string]: any;
}

export interface GetLeaguePointsSystemParams {
  leagueId: number;
  seasonId: number;
  [key: string]: any;
}

export interface GetLeagueMembershipParams {
  leagueId: number;
  [key: string]: any;
}

export interface GetLeagueSessionParams {
  leagueId: number;
  seasonId: number;
  [key: string]: any;
}

// ===== LOOKUP ENDPOINTS =====
export interface GetLookupParams {
  licenselevels?: number;
  [key: string]: any;
}

export interface GetLicensesParams {
  [key: string]: any;
}

// ===== MEMBER ENDPOINTS =====
export interface GetMembersParams {
  custIds: string; // Comma-separated list of customer IDs
  includeLicenses?: boolean;
  [key: string]: any;
}

export interface GetMemberInfoParams {
  custId?: number;
  [key: string]: any;
}

export interface GetMemberProfileParams {
  custId?: number;
  [key: string]: any;
}

export interface GetMemberAwardsParams {
  custId?: number;
  [key: string]: any;
}

// ===== RESULTS ENDPOINTS =====
export interface GetResultsParams {
  subsessionId: number;
  includeLicenses?: boolean;
  [key: string]: any;
}

export interface GetResultsEventLogParams {
  subsessionId: number;
  simsessionNumber: number;
  [key: string]: any;
}

export interface GetResultsLapChartDataParams {
  subsessionId: number;
  simsessionNumber: number;
  [key: string]: any;
}

export interface GetResultsLapDataParams {
  subsessionId: number;
  simsessionNumber: number;
  custId?: number;
  teamId?: number;
  [key: string]: any;
}

export interface SearchHostedParams {
  search: string;
  orderBy?: string;
  maxResults?: number;
  pageNum?: number;
  [key: string]: any;
}

export interface SearchSeriesParams {
  search: string;
  orderBy?: string;
  maxResults?: number;
  pageNum?: number;
  [key: string]: any;
}

// ===== SEASON ENDPOINTS =====
export interface GetSeasonListParams {
  [key: string]: any;
}

export interface GetSeasonRaceGuideParams {
  seasonId: number;
  [key: string]: any;
}

export interface GetSeasonResultsParams {
  seasonId: number;
  [key: string]: any;
}

export interface GetSpectatorSubsessionIdsParams {
  seasonId: number;
  [key: string]: any;
}

// ===== SERIES ENDPOINTS =====
export interface GetSeriesAssetsParams {
  [key: string]: any;
}

export interface GetSeriesDataParams {
  [key: string]: any;
}

export interface GetSeriesPastSeasonsParams {
  seriesId: number;
  [key: string]: any;
}

export interface GetSeriesSeasonsParams {
  includeSeries?: boolean;
  [key: string]: any;
}

export interface GetSeriesStatsParams {
  seriesId: number;
  [key: string]: any;
}

// ===== STATS ENDPOINTS =====
export interface GetMemberBestsParams {
  custId?: number;
  [key: string]: any;
}

export interface GetMemberCareerParams {
  custId?: number;
  [key: string]: any;
}

export interface GetMemberDivisionParams {
  seasonId: number;
  eventType: number;
  [key: string]: any;
}

export interface GetMemberRecentRacesParams {
  custId?: number;
  [key: string]: any;
}

export interface GetMemberSummaryParams {
  custId?: number;
  [key: string]: any;
}

export interface GetMemberYearlyParams {
  custId?: number;
  [key: string]: any;
}

export interface GetSeasonDriverStandingsParams {
  seasonId: number;
  carClassId: number;
  raceWeekNum?: number;
  [key: string]: any;
}

export interface GetSeasonQualifyResultsParams {
  seasonId: number;
  carClassId: number;
  raceWeekNum?: number;
  [key: string]: any;
}

export interface GetSeasonSupersessionStandingsParams {
  seasonId: number;
  carClassId: number;
  raceWeekNum?: number;
  [key: string]: any;
}

export interface GetSeasonTeamStandingsParams {
  seasonId: number;
  carClassId: number;
  raceWeekNum?: number;
  [key: string]: any;
}

export interface GetSeasonTimeTrialResultsParams {
  seasonId: number;
  carClassId: number;
  raceWeekNum?: number;
  [key: string]: any;
}

export interface GetSeasonTimeTrialStandingsParams {
  seasonId: number;
  carClassId: number;
  raceWeekNum?: number;
  [key: string]: any;
}

export interface GetWorldRecordsParams {
  [key: string]: any;
}

// ===== TRACK ENDPOINTS =====
export interface GetTrackAssetsParams {
  [key: string]: any;
}

export interface GetTracksParams {
  [key: string]: any;
}
