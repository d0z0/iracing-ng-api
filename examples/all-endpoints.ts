/**
 * Comprehensive iRacing Data API Client Example
 * Demonstrates all 52 endpoint methods with proper typing
 */

import { IRacingAPIClient, PasswordLimitedGrantConfig } from 'iracing-ng-api';

// Initialize the client with Password Limited Grant authentication
const config = {
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    username: 'your-email@example.com',
    password: 'your-password-hash',
  } as PasswordLimitedGrantConfig,
};

const client = new IRacingAPIClient(config);

async function demonstrateAllEndpoints() {
  try {
    // ===== CAR ENDPOINTS =====
    console.log('Fetching cars...');
    const cars = await client.getCars();
    console.log(`Found ${cars.cars?.length || 0} cars`);

    const carAssets = await client.getCarAssets();
    console.log(`Found ${carAssets.assets?.length || 0} car assets`);

    // ===== CAR CLASS ENDPOINTS =====
    console.log('Fetching car classes...');
    const carClasses = await client.getCarClasses();
    console.log(`Found ${carClasses.carClasses?.length || 0} car classes`);

    // ===== CONSTANTS ENDPOINTS =====
    console.log('Fetching constants...');
    const divisions = await client.getDivisions();
    const eventTypes = await client.getEventTypes();
    const categories = await client.getCategories();
    console.log(`Found ${divisions.divisions?.length || 0} divisions`);

    // ===== LEAGUE ENDPOINTS =====
    console.log('Fetching league data...');
    const league = await client.getLeague({ leagueId: 69 });
    const leagueSeason = await client.getLeagueSeason({ leagueId: 69, seasonId: 1 });
    const leagueStandings = await client.getLeagueSeasonStandings({
      leagueId: 69,
      seasonId: 1,
    });

    // ===== LOOKUP ENDPOINTS =====
    console.log('Fetching lookup data...');
    const lookup = await client.getLookup({ licenselevels: 2 });
    const licenses = await client.getLicenses();
    console.log(`Found ${licenses.licenses?.length || 0} license levels`);

    // ===== MEMBER ENDPOINTS =====
    console.log('Fetching member data...');
    const members = await client.getMembers({ custIds: '133041,120570' });
    console.log(`Found ${members.members?.length || 0} members`);

    const memberInfo = await client.getMemberInfo();
    const memberProfile = await client.getMemberProfile();
    const memberAwards = await client.getMemberAwards();

    // ===== RESULTS ENDPOINTS =====
    console.log('Fetching results data...');
    const results = await client.getResults({
      subsessionId: 44395136,
      includeLicenses: false,
    });

    const eventLog = await client.getResultsEventLog({
      subsessionId: 44395136,
      simsessionNumber: 0,
    });

    const lapChartData = await client.getResultsLapChartData({
      subsessionId: 44820591,
      simsessionNumber: 0,
    });

    const lapData = await client.getResultsLapData({
      subsessionId: 44820591,
      simsessionNumber: 0,
      custId: 120570,
    });

    const hostedSessions = await client.searchHosted({
      search: '*',
    });

    const seriesSessions = await client.searchSeries({
      search: '*',
    });

    // ===== SEASON ENDPOINTS =====
    console.log('Fetching season data...');
    const seasonList = await client.getSeasonList();
    const raceGuide = await client.getSeasonRaceGuide({ seasonId: 4567 });
    const seasonResults = await client.getSeasonResults({ seasonId: 4567 });
    const spectatorSessions = await client.getSpectatorSubsessionIds({ seasonId: 4567 });

    // ===== SERIES ENDPOINTS =====
    console.log('Fetching series data...');
    const seriesAssets = await client.getSeriesAssets();
    const seriesData = await client.getSeriesData();
    const pastSeasons = await client.getSeriesPastSeasons({ seriesId: 1 });
    const currentSeasons = await client.getSeriesSeasons();
    const seriesStats = await client.getSeriesStats({ seriesId: 1 });

    // ===== STATS ENDPOINTS =====
    console.log('Fetching stats data...');
    const memberBests = await client.getMemberBests();
    const memberCareer = await client.getMemberCareer();
    const memberDivision = await client.getMemberDivision({
      seasonId: 4567,
      eventType: 1,
    });
    const recentRaces = await client.getMemberRecentRaces();
    const memberSummary = await client.getMemberSummary();
    const yearlyStats = await client.getMemberYearly();

    const driverStandings = await client.getSeasonDriverStandings({
      seasonId: 4567,
      carClassId: 1,
    });

    const qualifyResults = await client.getSeasonQualifyResults({
      seasonId: 4567,
      carClassId: 1,
    });

    const supersessionStandings = await client.getSeasonSupersessionStandings({
      seasonId: 4567,
      carClassId: 1,
    });

    const teamStandings = await client.getSeasonTeamStandings({
      seasonId: 4567,
      carClassId: 1,
    });

    const ttResults = await client.getSeasonTimeTrialResults({
      seasonId: 4567,
      carClassId: 1,
    });

    const ttStandings = await client.getSeasonTimeTrialStandings({
      seasonId: 4567,
      carClassId: 1,
    });

    const worldRecords = await client.getWorldRecords();

    // ===== TRACK ENDPOINTS =====
    console.log('Fetching track data...');
    const trackAssets = await client.getTrackAssets();
    const tracks = await client.getTracks();
    console.log(`Found ${tracks.tracks?.length || 0} tracks`);

    console.log('✅ All endpoints executed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demonstration
demonstrateAllEndpoints();
