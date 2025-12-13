/**
 * Quick Reference Guide - iRacing Data API Client
 *
 * All endpoint methods available on IRacingAPIClient instance
 */

// ============================================================================
// BASIC USAGE
// ============================================================================

import { IRacingAPIClient } from 'iracing-ng-api';

const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    username: 'your-email@example.com',
    password: 'your-password-hash',
  },
});

// All methods are async and return typed Promises
// Parameters are optional (?) or required based on the API endpoint

// ============================================================================
// EXAMPLE USAGE PATTERNS
// ============================================================================

// 1. Method with no parameters
const cars = await client.getCars();

// 2. Method with optional parameters
const divisions = await client.getDivisions(); // Works without params
const licenses = await client.getLicenses({}); // Can also pass empty object

// 3. Method with required parameters
const results = await client.getResults({
  subsessionId: 44395136,
  includeLicenses: false, // Optional parameter
});

// 4. Method with multiple required parameters
const standings = await client.getSeasonDriverStandings({
  seasonId: 4567,
  carClassId: 1,
  raceWeekNum: 0, // Optional parameter
});

// ============================================================================
// PARAMETER NAMING CONVENTION
// ============================================================================
//
// All API parameters use camelCase (not snake_case):
//
// API Parameter    →    TypeScript Parameter
// league_id        →    leagueId
// include_license  →    includeLicense
// cust_ids         →    custIds
// subsession_id    →    subsessionId
// simsession_number →   simsessionNumber
// car_class_id     →    carClassId
// race_week_num    →    raceWeekNum
// season_id        →    seasonId
// event_type       →    eventType
//
// ============================================================================
// RESPONSE TYPES
// ============================================================================
//
// Each method returns a specific response type:
//
// Method                      →    Response Type
// getCars()                   →    GetCarsResponse
// getResults()                →    GetResultsResponse
// getLeague()                 →    GetLeagueResponse
// getSeasonDriverStandings()  →    GetSeasonDriverStandingsResponse
//
// All response types include:
// - success: boolean
// - Specific response data (cars, results, league, etc.)
// - [key: string]: any (for flexibility)
//

// ============================================================================
// COMPLETE METHOD REFERENCE
// ============================================================================

/*
CAR ENDPOINTS:
  getCars()                          → GetCarsResponse
  getCarAssets()                     → GetCarAssetsResponse

CAR CLASS ENDPOINTS:
  getCarClasses()                    → GetCarClassesResponse

CONSTANTS ENDPOINTS:
  getDivisions()                     → GetDivisionsResponse
  getEventTypes()                    → GetEventTypesResponse
  getCategories()                    → GetCategoriesResponse

LEAGUE ENDPOINTS:
  getLeague(leagueId)                → GetLeagueResponse
  getLeagueSeason(leagueId, seasonId) → GetLeagueSeasonResponse
  getLeagueLicenseGroup(leagueId)    → GetLeagueResponse
  getLeagueSeasonStandings(leagueId, seasonId, carClassId?) → GetLeagueSeasonStandingsResponse
  getLeaguePointsSystem(leagueId, seasonId) → GetLeaguePointsSystemResponse
  getLeagueMembership(leagueId)      → GetLeagueResponse
  getLeagueSession(leagueId, seasonId) → GetLeagueSeasonResponse

LOOKUP ENDPOINTS:
  getLookup(licenselevels?)          → GetLookupResponse
  getLicenses()                      → GetLicensesResponse

MEMBER ENDPOINTS:
  getMembers(custIds)                → GetMembersResponse
  getMemberInfo()                    → GetMemberInfoResponse
  getMemberProfile()                 → GetMemberInfoResponse
  getMemberAwards()                  → GetMemberInfoResponse

RESULTS ENDPOINTS:
  getResults(subsessionId, includeLicenses?) → GetResultsResponse
  getResultsEventLog(subsessionId, simsessionNumber) → GetResultsEventLogResponse
  getResultsLapChartData(subsessionId, simsessionNumber) → GetResultsLapChartDataResponse
  getResultsLapData(subsessionId, simsessionNumber, custId?, teamId?) → GetResultsLapDataResponse
  searchHosted(search, orderBy?, maxResults?, pageNum?) → SearchResponse
  searchSeries(search, orderBy?, maxResults?, pageNum?) → SearchResponse

SEASON ENDPOINTS:
  getSeasonList()                    → GetSeasonListResponse
  getSeasonRaceGuide(seasonId)       → GetSeasonRaceGuideResponse
  getSeasonResults(seasonId)         → GetSeasonResultsResponse
  getSpectatorSubsessionIds(seasonId) → GetSpectatorSubsessionIdsResponse

SERIES ENDPOINTS:
  getSeriesAssets()                  → GetSeriesAssetsResponse
  getSeriesData()                    → GetSeriesDataResponse
  getSeriesPastSeasons(seriesId)     → GetSeriesPastSeasonsResponse
  getSeriesSeasons(includeSeries?)   → GetSeriesSeasonsResponse
  getSeriesStats(seriesId)           → GetSeriesStatsResponse

STATS ENDPOINTS:
  getMemberBests(custId?)            → GetMemberBestsResponse
  getMemberCareer(custId?)           → GetMemberCareerResponse
  getMemberDivision(seasonId, eventType, ...) → GetMemberDivisionResponse
  getMemberRecentRaces(custId?)      → GetMemberRecentRacesResponse
  getMemberSummary(custId?)          → GetMemberSummaryResponse
  getMemberYearly(custId?)           → GetMemberYearlyResponse
  getSeasonDriverStandings(seasonId, carClassId, raceWeekNum?) → GetSeasonDriverStandingsResponse
  getSeasonQualifyResults(seasonId, carClassId, raceWeekNum?) → GetSeasonQualifyResultsResponse
  getSeasonSupersessionStandings(seasonId, carClassId, raceWeekNum?) → GetSeasonSupersessionStandingsResponse
  getSeasonTeamStandings(seasonId, carClassId, raceWeekNum?) → GetSeasonTeamStandingsResponse
  getSeasonTimeTrialResults(seasonId, carClassId, raceWeekNum?) → GetSeasonTimeTrialResultsResponse
  getSeasonTimeTrialStandings(seasonId, carClassId, raceWeekNum?) → GetSeasonTimeTrialStandingsResponse
  getWorldRecords()                  → GetWorldRecordsResponse

TRACK ENDPOINTS:
  getTrackAssets()                   → GetTrackAssetsResponse
  getTracks()                        → GetTracksResponse
*/

// ============================================================================
// IMPORTING TYPES DIRECTLY
// ============================================================================

import {
  GetCarsParams,
  GetCarsResponse,
  GetLeagueParams,
  GetLeagueResponse,
  GetResultsParams,
  GetResultsResponse,
  // ... and all other types from 'iracing-ng-api'
} from 'iracing-ng-api';

// Use types in your own functions
async function fetchCarData(): Promise<GetCarsResponse> {
  return await client.getCars();
}

async function fetchLeagueData(leagueId: number): Promise<GetLeagueResponse> {
  return await client.getLeague({ leagueId });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

try {
  const results = await client.getResults({
    subsessionId: 12345,
  });
  console.log('Results:', results);
} catch (error) {
  console.error('Failed to fetch results:', error);
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

// Password Limited Grant Flow (username/password)
const pwClient = new IRacingAPIClient({
  auth: {
    clientId: 'id',
    clientSecret: 'secret',
    username: 'email@example.com',
    password: 'hash',
  },
});

// Authorization Code Flow
const codeClient = new IRacingAPIClient({
  auth: {
    clientId: 'id',
    clientSecret: 'secret',
    redirectUri: 'http://localhost:3000/callback',
  },
});

// Token Management
const tokenManager = client.getTokenManager();
client.clearTokens(); // Clear cached tokens if needed
