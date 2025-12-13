import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PasswordLimitedGrantConfig, AuthorizationCodeFlowConfig, IRacingAPIClientConfig } from './types/index.js';
import {
  // Request params
  GetCarsParams,
  GetCarAssetsParams,
  GetCarClassesParams,
  GetDivisionsParams,
  GetEventTypesParams,
  GetCategoriesParams,
  GetLeagueParams,
  GetLeagueSeasonParams,
  GetLeagueLicenseGroupParams,
  GetLeagueSeasonStandingsParams,
  GetLeaguePointsSystemParams,
  GetLeagueMembershipParams,
  GetLeagueSessionParams,
  GetLookupParams,
  GetLicensesParams,
  GetMembersParams,
  GetMemberInfoParams,
  GetMemberProfileParams,
  GetMemberAwardsParams,
  GetResultsParams,
  GetResultsEventLogParams,
  GetResultsLapChartDataParams,
  GetResultsLapDataParams,
  SearchHostedParams,
  SearchSeriesParams,
  GetSeasonListParams,
  GetSeasonRaceGuideParams,
  GetSeasonResultsParams,
  GetSpectatorSubsessionIdsParams,
  GetSeriesAssetsParams,
  GetSeriesDataParams,
  GetSeriesPastSeasonsParams,
  GetSeriesSeasonsParams,
  GetSeriesStatsParams,
  GetMemberBestsParams,
  GetMemberCareerParams,
  GetMemberDivisionParams,
  GetMemberRecentRacesParams,
  GetMemberSummaryParams,
  GetMemberYearlyParams,
  GetSeasonDriverStandingsParams,
  GetSeasonQualifyResultsParams,
  GetSeasonSupersessionStandingsParams,
  GetSeasonTeamStandingsParams,
  GetSeasonTimeTrialResultsParams,
  GetSeasonTimeTrialStandingsParams,
  GetWorldRecordsParams,
  GetTrackAssetsParams,
  GetTracksParams,
  // Response types
  GetCarsResponse,
  GetCarAssetsResponse,
  GetCarClassesResponse,
  GetDivisionsResponse,
  GetEventTypesResponse,
  GetCategoriesResponse,
  GetLeagueResponse,
  GetLeagueSeasonResponse,
  GetLeagueSeasonStandingsResponse,
  GetLeaguePointsSystemResponse,
  GetLookupResponse,
  GetLicensesResponse,
  GetMembersResponse,
  GetMemberInfoResponse,
  GetResultsResponse,
  GetResultsEventLogResponse,
  GetResultsLapChartDataResponse,
  GetResultsLapDataResponse,
  SearchResponse,
  GetSeasonListResponse,
  GetSeasonRaceGuideResponse,
  GetSeasonResultsResponse,
  GetSpectatorSubsessionIdsResponse,
  GetSeriesAssetsResponse,
  GetSeriesDataResponse,
  GetSeriesPastSeasonsResponse,
  GetSeriesSeasonsResponse,
  GetSeriesStatsResponse,
  GetMemberBestsResponse,
  GetMemberCareerResponse,
  GetMemberDivisionResponse,
  GetMemberRecentRacesResponse,
  GetMemberSummaryResponse,
  GetMemberYearlyResponse,
  GetSeasonDriverStandingsResponse,
  GetSeasonQualifyResultsResponse,
  GetSeasonSupersessionStandingsResponse,
  GetSeasonTeamStandingsResponse,
  GetSeasonTimeTrialResultsResponse,
  GetSeasonTimeTrialStandingsResponse,
  GetWorldRecordsResponse,
  GetTrackAssetsResponse,
  GetTracksResponse,
} from './types/index.js';
import { TokenManager } from './auth/token-manager.js';
import { PasswordLimitedGrantAuth } from './auth/password-limited-grant.js';
import { AuthorizationCodeFlowAuth } from './auth/authorization-code-flow.js';

const DATA_API_BASE_URL = 'https://members-ng.iracing.com';

/**
 * Convert camelCase object keys to snake_case
 */
function camelToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnakeCase(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = camelToSnakeCase(obj[key]);
    }
  }
  return result;
}

/**
 * Convert snake_case object keys to camelCase
 */
function snakeToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelCase(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      result[camelKey] = snakeToCamelCase(obj[key]);
    }
  }
  return result;
}
export class IRacingAPIClient {
  private httpClient: AxiosInstance;
  private authHttpClient: AxiosInstance;
  private tokenManager: TokenManager;
  private passwordGrantAuth?: PasswordLimitedGrantAuth;
  private authCodeFlowAuth?: AuthorizationCodeFlowAuth;
  private authType: 'password_limited' | 'authorization_code';

  constructor(config: IRacingAPIClientConfig) {
    const baseURL = config.baseUrl || DATA_API_BASE_URL;
    this.httpClient = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'iracing-ng-api/1.0.0',
      },
    });

    // Separate HTTP client for auth requests (without interceptors to avoid infinite loops)
    this.authHttpClient = axios.create({
      timeout: config.timeout || 30000,
    });

    this.tokenManager = new TokenManager();

    // Determine which auth flow to use
    const authConfig = config.auth;
    if ('username' in authConfig && 'password' in authConfig) {
      // Password Limited Grant
      this.authType = 'password_limited';
      this.passwordGrantAuth = new PasswordLimitedGrantAuth(
        authConfig as PasswordLimitedGrantConfig,
        this.tokenManager,
        this.authHttpClient
      );
    } else {
      // Authorization Code Flow
      this.authType = 'authorization_code';
      this.authCodeFlowAuth = new AuthorizationCodeFlowAuth(
        authConfig as AuthorizationCodeFlowConfig,
        this.tokenManager,
        this.authHttpClient
      );
    }

    // Add request interceptor to inject authentication token
    this.httpClient.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get access token based on auth type
   */
  private async getAccessToken(): Promise<string | null> {
    if (this.authType === 'password_limited' && this.passwordGrantAuth) {
      return await this.passwordGrantAuth.getAccessToken();
    } else if (this.authType === 'authorization_code' && this.authCodeFlowAuth) {
      return await this.authCodeFlowAuth.getAccessToken();
    }
    return null;
  }

  /**
   * For Authorization Code Flow: Generate authorization URL
   */
  generateAuthorizationUrl(): { authorizationUrl: string; state: string; codeVerifier?: string } {
    if (!this.authCodeFlowAuth) {
      throw new Error('Authorization Code Flow not configured');
    }
    return this.authCodeFlowAuth.generateAuthorizationUrl();
  }

  /**
   * For Authorization Code Flow: Handle OAuth callback
   */
  async handleAuthorizationCallback(code: string, state: string): Promise<string> {
    if (!this.authCodeFlowAuth) {
      throw new Error('Authorization Code Flow not configured');
    }
    return await this.authCodeFlowAuth.handleCallback(code, state);
  }

  // ===== CAR ENDPOINTS =====

  /**
   * Get all cars
   */
  async getCars(params?: GetCarsParams): Promise<GetCarsResponse> {
    return this.get('/data/car/get', { params });
  }

  /**
   * Get car assets
   */
  async getCarAssets(params?: GetCarAssetsParams): Promise<GetCarAssetsResponse> {
    return this.get('/data/car/assets', { params });
  }

  // ===== CAR CLASS ENDPOINTS =====

  /**
   * Get all car classes
   */
  async getCarClasses(params?: GetCarClassesParams): Promise<GetCarClassesResponse> {
    return this.get('/data/carclass/get', { params });
  }

  // ===== CONSTANTS ENDPOINTS =====

  /**
   * Get divisions
   */
  async getDivisions(params?: GetDivisionsParams): Promise<GetDivisionsResponse> {
    return this.get('/data/constants/divisions', { params });
  }

  /**
   * Get event types
   */
  async getEventTypes(params?: GetEventTypesParams): Promise<GetEventTypesResponse> {
    return this.get('/data/constants/event_types', { params });
  }

  /**
   * Get categories
   */
  async getCategories(params?: GetCategoriesParams): Promise<GetCategoriesResponse> {
    return this.get('/data/constants/categories', { params });
  }

  // ===== LEAGUE ENDPOINTS =====

  /**
   * Get league information
   */
  async getLeague(params: GetLeagueParams): Promise<GetLeagueResponse> {
    return this.get('/data/league/get', { params });
  }

  /**
   * Get league season
   */
  async getLeagueSeason(params: GetLeagueSeasonParams): Promise<GetLeagueSeasonResponse> {
    return this.get('/data/league/season', { params });
  }

  /**
   * Get league license group
   */
  async getLeagueLicenseGroup(params: GetLeagueLicenseGroupParams): Promise<GetLeagueResponse> {
    return this.get('/data/league/license_group', { params });
  }

  /**
   * Get league season standings
   */
  async getLeagueSeasonStandings(params: GetLeagueSeasonStandingsParams): Promise<GetLeagueSeasonStandingsResponse> {
    return this.get('/data/league/season_standings', { params });
  }

  /**
   * Get league points system
   */
  async getLeaguePointsSystem(params: GetLeaguePointsSystemParams): Promise<GetLeaguePointsSystemResponse> {
    return this.get('/data/league/points_system', { params });
  }

  /**
   * Get league membership
   */
  async getLeagueMembership(params: GetLeagueMembershipParams): Promise<GetLeagueResponse> {
    return this.get('/data/league/membership', { params });
  }

  /**
   * Get league session
   */
  async getLeagueSession(params: GetLeagueSessionParams): Promise<GetLeagueSeasonResponse> {
    return this.get('/data/league/session', { params });
  }

  // ===== LOOKUP ENDPOINTS =====

  /**
   * Get lookup data
   */
  async getLookup(params?: GetLookupParams): Promise<GetLookupResponse> {
    return this.get('/data/lookup/get', { params });
  }

  /**
   * Get licenses
   */
  async getLicenses(params?: GetLicensesParams): Promise<GetLicensesResponse> {
    return this.get('/data/lookup/licenses', { params });
  }

  // ===== MEMBER ENDPOINTS =====

  /**
   * Get member(s) information
   */
  async getMembers(params: GetMembersParams): Promise<GetMembersResponse> {
    return this.get('/data/member/get', { params });
  }

  /**
   * Get member info
   */
  async getMemberInfo(params?: GetMemberInfoParams): Promise<GetMemberInfoResponse> {
    return this.get('/data/member/info', { params });
  }

  /**
   * Get member profile
   */
  async getMemberProfile(params?: GetMemberProfileParams): Promise<GetMemberInfoResponse> {
    return this.get('/data/member/profile', { params });
  }

  /**
   * Get member awards
   */
  async getMemberAwards(params?: GetMemberAwardsParams): Promise<GetMemberInfoResponse> {
    return this.get('/data/member/awards', { params });
  }

  // ===== RESULTS ENDPOINTS =====

  /**
   * Get session results
   */
  async getResults(params: GetResultsParams): Promise<GetResultsResponse> {
    return this.get('/data/results/get', { params });
  }

  /**
   * Get results event log
   */
  async getResultsEventLog(params: GetResultsEventLogParams): Promise<GetResultsEventLogResponse> {
    return this.get('/data/results/event_log', { params });
  }

  /**
   * Get results lap chart data
   */
  async getResultsLapChartData(params: GetResultsLapChartDataParams): Promise<GetResultsLapChartDataResponse> {
    return this.get('/data/results/lap_chart_data', { params });
  }

  /**
   * Get results lap data
   */
  async getResultsLapData(params: GetResultsLapDataParams): Promise<GetResultsLapDataResponse> {
    return this.get('/data/results/lap_data', { params });
  }

  /**
   * Search hosted sessions
   */
  async searchHosted(params: SearchHostedParams): Promise<SearchResponse> {
    return this.get('/data/results/search_hosted', { params });
  }

  /**
   * Search series
   */
  async searchSeries(params: SearchSeriesParams): Promise<SearchResponse> {
    return this.get('/data/results/search_series', { params });
  }

  // ===== SEASON ENDPOINTS =====

  /**
   * Get season list
   */
  async getSeasonList(params?: GetSeasonListParams): Promise<GetSeasonListResponse> {
    return this.get('/data/season/list', { params });
  }

  /**
   * Get season race guide
   */
  async getSeasonRaceGuide(params: GetSeasonRaceGuideParams): Promise<GetSeasonRaceGuideResponse> {
    return this.get('/data/season/race_guide', { params });
  }

  /**
   * Get season results
   */
  async getSeasonResults(params: GetSeasonResultsParams): Promise<GetSeasonResultsResponse> {
    return this.get('/data/season/results', { params });
  }

  /**
   * Get spectator subsession IDs
   */
  async getSpectatorSubsessionIds(params: GetSpectatorSubsessionIdsParams): Promise<GetSpectatorSubsessionIdsResponse> {
    return this.get('/data/season/spectator_subsessions', { params });
  }

  // ===== SERIES ENDPOINTS =====

  /**
   * Get series assets
   */
  async getSeriesAssets(params?: GetSeriesAssetsParams): Promise<GetSeriesAssetsResponse> {
    return this.get('/data/series/assets', { params });
  }

  /**
   * Get series data
   */
  async getSeriesData(params?: GetSeriesDataParams): Promise<GetSeriesDataResponse> {
    return this.get('/data/series/get', { params });
  }

  /**
   * Get series past seasons
   */
  async getSeriesPastSeasons(params: GetSeriesPastSeasonsParams): Promise<GetSeriesPastSeasonsResponse> {
    return this.get('/data/series/past_seasons', { params });
  }

  /**
   * Get series seasons
   */
  async getSeriesSeasons(params?: GetSeriesSeasonsParams): Promise<GetSeriesSeasonsResponse> {
    return this.get('/data/series/seasons', { params });
  }

  /**
   * Get series stats
   */
  async getSeriesStats(params: GetSeriesStatsParams): Promise<GetSeriesStatsResponse> {
    return this.get('/data/series/stats', { params });
  }

  // ===== STATS ENDPOINTS =====

  /**
   * Get member best lap times
   */
  async getMemberBests(params?: GetMemberBestsParams): Promise<GetMemberBestsResponse> {
    return this.get('/data/stats/member_bests', { params });
  }

  /**
   * Get member career stats
   */
  async getMemberCareer(params?: GetMemberCareerParams): Promise<GetMemberCareerResponse> {
    return this.get('/data/stats/member_career', { params });
  }

  /**
   * Get member division stats
   */
  async getMemberDivision(params: GetMemberDivisionParams): Promise<GetMemberDivisionResponse> {
    return this.get('/data/stats/member_division', { params });
  }

  /**
   * Get member recent races
   */
  async getMemberRecentRaces(params?: GetMemberRecentRacesParams): Promise<GetMemberRecentRacesResponse> {
    return this.get('/data/stats/member_recent_races', { params });
  }

  /**
   * Get member summary stats
   */
  async getMemberSummary(params?: GetMemberSummaryParams): Promise<GetMemberSummaryResponse> {
    return this.get('/data/stats/member_summary', { params });
  }

  /**
   * Get member yearly stats
   */
  async getMemberYearly(params?: GetMemberYearlyParams): Promise<GetMemberYearlyResponse> {
    return this.get('/data/stats/member_yearly', { params });
  }

  /**
   * Get season driver standings
   */
  async getSeasonDriverStandings(params: GetSeasonDriverStandingsParams): Promise<GetSeasonDriverStandingsResponse> {
    return this.get('/data/stats/season_driver_standings', { params });
  }

  /**
   * Get season qualify results
   */
  async getSeasonQualifyResults(params: GetSeasonQualifyResultsParams): Promise<GetSeasonQualifyResultsResponse> {
    return this.get('/data/stats/season_qualify_results', { params });
  }

  /**
   * Get season supersession standings
   */
  async getSeasonSupersessionStandings(params: GetSeasonSupersessionStandingsParams): Promise<GetSeasonSupersessionStandingsResponse> {
    return this.get('/data/stats/season_supersession_standings', { params });
  }

  /**
   * Get season team standings
   */
  async getSeasonTeamStandings(params: GetSeasonTeamStandingsParams): Promise<GetSeasonTeamStandingsResponse> {
    return this.get('/data/stats/season_team_standings', { params });
  }

  /**
   * Get season time trial results
   */
  async getSeasonTimeTrialResults(params: GetSeasonTimeTrialResultsParams): Promise<GetSeasonTimeTrialResultsResponse> {
    return this.get('/data/stats/season_tt_results', { params });
  }

  /**
   * Get season time trial standings
   */
  async getSeasonTimeTrialStandings(params: GetSeasonTimeTrialStandingsParams): Promise<GetSeasonTimeTrialStandingsResponse> {
    return this.get('/data/stats/season_tt_standings', { params });
  }

  /**
   * Get world records
   */
  async getWorldRecords(params?: GetWorldRecordsParams): Promise<GetWorldRecordsResponse> {
    return this.get('/data/stats/world_records', { params });
  }

  // ===== TRACK ENDPOINTS =====

  /**
   * Get track assets
   */
  async getTrackAssets(params?: GetTrackAssetsParams): Promise<GetTrackAssetsResponse> {
    return this.get('/data/track/assets', { params });
  }

  /**
   * Get all tracks
   */
  async getTracks(params?: GetTracksParams): Promise<GetTracksResponse> {
    return this.get('/data/track/get', { params });
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Convert camelCase parameters to snake_case for the API
    const modifiedConfig = { ...config };
    if (modifiedConfig.params) {
      modifiedConfig.params = camelToSnakeCase(modifiedConfig.params);
    }

    const response = await this.httpClient.get<any>(url, modifiedConfig);

    // Check if response has the iRacing S3 link format
    if (response.data?.link) {
      const s3Url = response.data.link;
      // Fetch the actual data from the S3 link (without auth, it's a signed URL)
      const s3Response = await axios.get<T>(s3Url);
      // Convert snake_case response to camelCase
      return snakeToCamelCase(s3Response.data);
    }

    // Convert snake_case response to camelCase
    return snakeToCamelCase(response.data);
  }

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.httpClient.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    this.tokenManager.clear();
  }

  /**
   * Get token manager for custom token handling
   */
  getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  /**
   * Get password limited grant auth (if using that flow)
   */
  getPasswordGrantAuth(): PasswordLimitedGrantAuth | undefined {
    return this.passwordGrantAuth;
  }

  /**
   * Get authorization code flow auth (if using that flow)
   */
  getAuthCodeFlowAuth(): AuthorizationCodeFlowAuth | undefined {
    return this.authCodeFlowAuth;
  }
}

export * from './types/index.js';
export * from './auth/index.js';
