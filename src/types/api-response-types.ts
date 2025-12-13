/**
 * iRacing API Response Types (camelCase)
 * Generated from Postman Collection and API documentation
 */

// ===== CAR RESPONSES =====
export interface CarAsset {
  assetUrl: string;
  description?: string;
  [key: string]: any;
}

export interface CarPaintRule {
  patternId: number;
  colorId?: number;
  [key: string]: any;
}

export interface Car {
  carId: number;
  carName: string;
  carClassId?: number;
  carNameAbbreviated?: string;
  retired?: boolean;
  paintRules?: CarPaintRule[];
  [key: string]: any;
}

export interface GetCarsResponse {
  success: boolean;
  cars?: Car[];
  [key: string]: any;
}

export interface GetCarAssetsResponse {
  success: boolean;
  assets?: CarAsset[];
  [key: string]: any;
}

// ===== CAR CLASS RESPONSES =====
export interface CarClass {
  carClassId: number;
  carClassName: string;
  carClassShortName?: string;
  relativeStrength?: number;
  carCount?: number;
  [key: string]: any;
}

export interface GetCarClassesResponse {
  success: boolean;
  carClasses?: CarClass[];
  [key: string]: any;
}

// ===== CONSTANTS RESPONSES =====
export interface Division {
  divisionId: number;
  divisionName: string;
  [key: string]: any;
}

export interface EventType {
  eventTypeId: number;
  eventTypeCode?: string;
  eventTypeDesc: string;
  [key: string]: any;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  [key: string]: any;
}

export interface GetDivisionsResponse {
  success: boolean;
  divisions?: Division[];
  [key: string]: any;
}

export interface GetEventTypesResponse {
  success: boolean;
  eventTypes?: EventType[];
  [key: string]: any;
}

export interface GetCategoriesResponse {
  success: boolean;
  categories?: Category[];
  [key: string]: any;
}

// ===== LEAGUE RESPONSES =====
export interface LeagueCar {
  carId: number;
  carName?: string;
  [key: string]: any;
}

export interface LeagueTrack {
  trackId: number;
  trackName?: string;
  [key: string]: any;
}

export interface LeagueSessionInfo {
  sessionId: number;
  sessionName?: string;
  [key: string]: any;
}

export interface LeagueMember {
  custId: number;
  displayName?: string;
  role?: string;
  [key: string]: any;
}

export interface LeagueLicense {
  categoryId: number;
  licenseLevel?: number;
  [key: string]: any;
}

export interface LeagueData {
  leagueId: number;
  leagueName: string;
  leagueDesc?: string;
  ownerCustId?: number;
  ownerName?: string;
  members?: LeagueMember[];
  cars?: LeagueCar[];
  tracks?: LeagueTrack[];
  licenses?: LeagueLicense[];
  [key: string]: any;
}

export interface GetLeagueResponse {
  success: boolean;
  league?: LeagueData;
  [key: string]: any;
}

export interface LeagueSeason {
  seasonId: number;
  seasonName?: string;
  [key: string]: any;
}

export interface GetLeagueSeasonResponse {
  success: boolean;
  season?: LeagueSeason;
  [key: string]: any;
}

export interface LeagueStandingsEntry {
  custId: number;
  displayName?: string;
  points?: number;
  position?: number;
  [key: string]: any;
}

export interface GetLeagueSeasonStandingsResponse {
  success: boolean;
  standings?: LeagueStandingsEntry[];
  [key: string]: any;
}

export interface PointSystemRule {
  pointValue: number;
  position?: number;
  [key: string]: any;
}

export interface PointSystem {
  pointSystemId: number;
  pointSystemName?: string;
  rules?: PointSystemRule[];
  [key: string]: any;
}

export interface GetLeaguePointsSystemResponse {
  success: boolean;
  pointSystem?: PointSystem;
  [key: string]: any;
}

// ===== LOOKUP RESPONSES =====
export interface Country {
  countryId: number;
  countryCode?: string;
  countryName?: string;
  [key: string]: any;
}

export interface Driver {
  custId: number;
  displayName?: string;
  [key: string]: any;
}

export interface License {
  licenseId: number;
  licenseLevel?: number;
  categoryId?: number;
  [key: string]: any;
}

export interface LookupData {
  countries?: Country[];
  drivers?: Driver[];
  licenses?: License[];
  [key: string]: any;
}

export interface GetLookupResponse {
  success: boolean;
  lookupData?: LookupData;
  [key: string]: any;
}

export interface GetLicensesResponse {
  success: boolean;
  licenses?: License[];
  [key: string]: any;
}

// ===== MEMBER RESPONSES =====
export interface MemberHelmet {
  pattern: number;
  color1?: string;
  color2?: string;
  color3?: string;
  [key: string]: any;
}

export interface MemberSuit {
  pattern: number;
  color1?: string;
  color2?: string;
  color3?: string;
  [key: string]: any;
}

export interface MemberLicense {
  categoryId: number;
  licenseLevel?: number;
  safetyRating?: number;
  irating?: number;
  [key: string]: any;
}

export interface MemberInfo {
  custId: number;
  displayName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  memberSince?: string;
  lastLogin?: string;
  helmet?: MemberHelmet;
  suit?: MemberSuit;
  licenses?: MemberLicense[];
  [key: string]: any;
}

export interface GetMembersResponse {
  success: boolean;
  members?: MemberInfo[];
  [key: string]: any;
}

export interface MemberProfile {
  custId: number;
  displayName: string;
  memberInfo?: MemberInfo;
  imageUrl?: string;
  [key: string]: any;
}

export interface GetMemberInfoResponse {
  success: boolean;
  member?: MemberProfile;
  [key: string]: any;
}

// ===== RESULTS RESPONSES =====
export interface ResultDriver {
  custId: number;
  displayName?: string;
  finishPos?: number;
  lapsLed?: number;
  incidents?: number;
  pointsEarned?: number;
  [key: string]: any;
}

export interface SessionResult {
  subsessionId: number;
  sessionTypeId?: number;
  sessionStartTime?: string;
  drivers?: ResultDriver[];
  [key: string]: any;
}

export interface GetResultsResponse {
  success: boolean;
  result?: SessionResult;
  [key: string]: any;
}

export interface EventLogEntry {
  eventType: number;
  eventTypeDesc?: string;
  custId?: number;
  displayName?: string;
  timestamp?: number;
  [key: string]: any;
}

export interface GetResultsEventLogResponse {
  success: boolean;
  subsessionId?: number;
  events?: EventLogEntry[];
  [key: string]: any;
}

export interface LapChartEntry {
  lapNum: number;
  custId: number;
  displayName?: string;
  lapTime?: number;
  position?: number;
  [key: string]: any;
}

export interface GetResultsLapChartDataResponse {
  success: boolean;
  laps?: LapChartEntry[];
  [key: string]: any;
}

export interface LapDataEntry {
  lapNum: number;
  custId: number;
  displayName?: string;
  lapTime?: number;
  [key: string]: any;
}

export interface GetResultsLapDataResponse {
  success: boolean;
  laps?: LapDataEntry[];
  [key: string]: any;
}

export interface SearchResult {
  subsessionId: number;
  sessionId?: number;
  sessionStartTime?: string;
  [key: string]: any;
}

export interface SearchResponse {
  success: boolean;
  rowCount?: number;
  pageNum?: number;
  pageSize?: number;
  results?: SearchResult[];
  [key: string]: any;
}

// ===== SEASON RESPONSES =====
export interface SeasonInfo {
  seasonId: number;
  seasonName?: string;
  seasonYear?: number;
  seasonQuarter?: number;
  [key: string]: any;
}

export interface RaceGuideEntry {
  raceWeekNum: number;
  eventTypeId?: number;
  eventTypeDesc?: string;
  trackId?: number;
  trackName?: string;
  [key: string]: any;
}

export interface GetSeasonListResponse {
  success: boolean;
  seasons?: SeasonInfo[];
  [key: string]: any;
}

export interface GetSeasonRaceGuideResponse {
  success: boolean;
  raceGuide?: RaceGuideEntry[];
  [key: string]: any;
}

export interface GetSeasonResultsResponse {
  success: boolean;
  results?: SessionResult[];
  [key: string]: any;
}

export interface SubsessionInfo {
  subsessionId: number;
  sessionId?: number;
  startTime?: string;
  [key: string]: any;
}

export interface GetSpectatorSubsessionIdsResponse {
  success: boolean;
  subsessions?: SubsessionInfo[];
  [key: string]: any;
}

// ===== SERIES RESPONSES =====
export interface SeriesAsset {
  assetUrl: string;
  description?: string;
  [key: string]: any;
}

export interface SeriesCar {
  carId: number;
  carName?: string;
  [key: string]: any;
}

export interface SeriesTrack {
  trackId: number;
  trackName?: string;
  [key: string]: any;
}

export interface SeriesInfo {
  seriesId: number;
  seriesName: string;
  licenseGroup?: number;
  cars?: SeriesCar[];
  tracks?: SeriesTrack[];
  [key: string]: any;
}

export interface GetSeriesAssetsResponse {
  success: boolean;
  assets?: SeriesAsset[];
  [key: string]: any;
}

export interface GetSeriesDataResponse {
  success: boolean;
  series?: SeriesInfo[];
  [key: string]: any;
}

export interface GetSeriesPastSeasonsResponse {
  success: boolean;
  seasons?: SeasonInfo[];
  [key: string]: any;
}

export interface GetSeriesSeasonsResponse {
  success: boolean;
  seasons?: SeasonInfo[];
  [key: string]: any;
}

export interface ChartDataPoint {
  when: string;
  value: number;
  [key: string]: any;
}

export interface SeriesChartData {
  chartType: number;
  data?: ChartDataPoint[];
  [key: string]: any;
}

export interface GetSeriesStatsResponse {
  success: boolean;
  chartData?: SeriesChartData[];
  [key: string]: any;
}

// ===== STATS RESPONSES =====
export interface PersonalBest {
  carId: number;
  carName?: string;
  trackId: number;
  trackName?: string;
  lapTime?: number;
  [key: string]: any;
}

export interface GetMemberBestsResponse {
  success: boolean;
  bestLapTimes?: PersonalBest[];
  [key: string]: any;
}

export interface CareerStatistic {
  statName: string;
  value: number;
  [key: string]: any;
}

export interface GetMemberCareerResponse {
  success: boolean;
  careerStats?: CareerStatistic[];
  [key: string]: any;
}

export interface DivisionStatistic {
  division: string;
  wins?: number;
  topFives?: number;
  [key: string]: any;
}

export interface GetMemberDivisionResponse {
  success: boolean;
  divisionStats?: DivisionStatistic[];
  [key: string]: any;
}

export interface RecentRace {
  subsessionId: number;
  startTime?: string;
  finishPos?: number;
  [key: string]: any;
}

export interface GetMemberRecentRacesResponse {
  success: boolean;
  races?: RecentRace[];
  [key: string]: any;
}

export interface MemberSummaryStats {
  totalRaces?: number;
  totalWins?: number;
  totalTopFives?: number;
  [key: string]: any;
}

export interface GetMemberSummaryResponse {
  success: boolean;
  stats?: MemberSummaryStats;
  [key: string]: any;
}

export interface YearlyStatistics {
  year: number;
  wins?: number;
  topFives?: number;
  racesCompleted?: number;
  [key: string]: any;
}

export interface GetMemberYearlyResponse {
  success: boolean;
  yearlyStats?: YearlyStatistics[];
  [key: string]: any;
}

export interface StandingsEntry {
  custId: number;
  displayName?: string;
  position?: number;
  points?: number;
  [key: string]: any;
}

export interface GetSeasonDriverStandingsResponse {
  success: boolean;
  standings?: StandingsEntry[];
  [key: string]: any;
}

export interface GetSeasonQualifyResultsResponse {
  success: boolean;
  results?: SessionResult[];
  [key: string]: any;
}

export interface GetSeasonSupersessionStandingsResponse {
  success: boolean;
  standings?: StandingsEntry[];
  [key: string]: any;
}

export interface GetSeasonTeamStandingsResponse {
  success: boolean;
  standings?: StandingsEntry[];
  [key: string]: any;
}

export interface GetSeasonTimeTrialResultsResponse {
  success: boolean;
  results?: SessionResult[];
  [key: string]: any;
}

export interface GetSeasonTimeTrialStandingsResponse {
  success: boolean;
  standings?: StandingsEntry[];
  [key: string]: any;
}

export interface WorldRecord {
  custId: number;
  displayName?: string;
  carId?: number;
  trackId?: number;
  lapTime?: number;
  [key: string]: any;
}

export interface GetWorldRecordsResponse {
  success: boolean;
  records?: WorldRecord[];
  [key: string]: any;
}

// ===== TRACK RESPONSES =====
export interface TrackAsset {
  assetUrl: string;
  description?: string;
  [key: string]: any;
}

export interface Track {
  trackId: number;
  trackName: string;
  categoryId?: number;
  category?: string;
  country?: string;
  corners?: number;
  length?: number;
  [key: string]: any;
}

export interface GetTrackAssetsResponse {
  success: boolean;
  assets?: TrackAsset[];
  [key: string]: any;
}

export interface GetTracksResponse {
  success: boolean;
  tracks?: Track[];
  [key: string]: any;
}
