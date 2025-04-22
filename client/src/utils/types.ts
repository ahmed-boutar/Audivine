export enum AuthActionType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT'
}

export enum MessageType {
  GENERATE_ARTWORK = 'generateArtwork', // This is used for regular listeners
  GENERATE_MARKETING = 'generateMarketing', // This is used for marketing listeners
  FETCH_LYRICS = 'fetchLyrics',
  PROCESS_AUDIO = 'processAudio',
  TEST_CONNECTION = 'testConnection',
  SPOTIFY_AUTH = 'spotifyCallback',

  // responses types
  SPOTIFY_AUTH_RESPONSE = 'SPOTIFY_AUTH_RESPONSE',
  // ...other operations
}

