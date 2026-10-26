// Track catalogue.
//   uri       Spotify track URI
//   start     snippet start position in ms
//   duration  snippet length in ms
//   tags      used by the include/exclude filters (genres, decades, flags)
const t = (album_id, id, start, duration, artist, title, tags) => ({
  context_uri:  `spotify:album:${album_id}`, uri: `spotify:track:${id}`, start, duration, artist, title, tags,
})

export const TRACKS = [
  t('7yjP7yQ9Q49ATlIt0Nxwi9', '2gi0hPEYwxNuXs07OdTyBG', 2960, 2700, 'Pornhub', 'Pornhub', ['custom', 'funny']),
  t('7Kusf5plZjl76X5ARWJbNO', '303ccTay2FiDTZ9fZ2AdBt', 30000, 4700, 'Stardust', 'Music Sounds Better with You', ['custom', 'house', '90s']),
  t('6ZIeF1ZKEspFec9lyZAdys', '49RnMMretBCApdz6XyufiC', 54000, 5000, 'Christian Steiffen', 'Sexualverkehr', ['custom', 'funny', 'deutsch', 'explicit']),
  t('4V14ntAavm3i5BIB5CNNTu', '44d9pjbVJH3lakrwnMdaAa', 69650, 3550, 'Alexander Marcus', 'Homodance', ['custom', 'funny', 'deutsch']),
  t('7zlMxh1NR0Shklu48L4e7x', '0noVd1VU93X8TEZMmpR3yN', 114400, 7300, 'Eric Prydz', 'Pjanoo', ['custom', 'house']),
  t('7BwQou9wwk795WqY5hncbt', '6M8hZf14Jxta0flMBkI7XP', 43700, 7200, 'Roland Kaiser', 'Ich glaub es geht schon wieder los', ['custom', 'schlager', 'deutsch']),
  t('6ZIeF1ZKEspFec9lyZAdys', '7M55FCP7eIuanc3AULasbB', 43500, 7500, 'Christian Steiffen', 'Champagner und Kaviar', ['custom', 'schlager', 'deutsch', 'funny', 'explicit']),
  t('0I1uCG4t0ehOyQBBC4W44K', '3BEaiI6RmDI0dDshMhC3NN', 43500, 4500, 'Mountain Crew', 'Expresso & Tschianti', ['custom', 'ballermann', 'deutsch']),
  t('1hh1YtzD7HiKAla6K6W0KZ', '0NipOXqC53PNZVUMfthzPt', 43600, 5000, 'Mickie Krause', 'Geh mal Bier holen', ['custom', 'ballermann', 'deutsch', 'explicit']),
  t('7iFiPQEadtY5OmMERDgEJM', '1OGxXjPkblmZPjoi17xN6T', 39800, 6000, 'Roland Kaiser', 'Warum hast du nicht nein gesagt', ['custom', 'schlager', 'deutsch']),
  t('5SjK8QSqZEHMkzlq2LgM8e', '33HJHGsDWZ8XcXaN6POuRI', 90200, 5000, 'Take That', 'Never Forget', ['custom', '90s']),
  t('71O60S5gIJSIAhdnrDIh3N', '4SFknyjLcyTLJFPKD2m96o', 41100, 7600, 'Blackpink', 'How You Like That', ['custom', 'kpop', '20s']),
  t('65NM9j8ZUrRNMNdNnXxdRt', '4XtpXYrujHRGHRtALZzbKO', 8200, 6700, 'Sasha', 'Party Party', ['custom', 'deutsch', '10s']),
  t('2hEyYIrm4e6gVgfaYLY00x', '37m2khXl5lnBzicq1mGoZG', 54800, 6000, 'The Prodigy', 'Out of Space', ['custom', '90s']),
  t('4LAtUD0YzywA2DdzxEAoEU', '07K4GcCDSTiXUF5ssyTRUM', 80100, 7700, 'Gwen Stefani', 'The Sweet Escape', ['custom', '90s']),
  t('1XEImTrlT2BxE1Xdav2kM9', '6FYs5OcCeH8RiQ3jcI9NWI', 9500, 8200, 'The Naked and Famous', 'Young Blood', ['custom', '00s']),
  t('0J43YxxLFPZxIrCd12LRuN', '5Sh9v7RwibuV34tdjscwx5', 77000, 7800, 'Fatboy Slim', 'Right Here, Right Now', ['custom', '90s']),
  t('7gMOCbeBmxH1BD4kqtqehq', '2FjORVPL2w8GtJucvZGCXq', 59800, 8000, 'Spliff', 'Carbonara', ['custom', '80s']),
  t('2hy9sLDt7IVAvJRGVdzZnx', '73ljrkSg4A0q3ByU0Cu7mw', 26490, 7400, 'Vengaboys', 'We Like to Party', ['custom', '90s']),
  t('5dT8wsoBrLfBkfsuBK4bLJ', '3aCQCWw8cKYYOuHHEawiZ2', 21500, 7400, 'David Hasselhoff', 'Looking for Freedom', ['custom', '90s']),
  t('2sxxE9WPxNAtsosY2mqy6z', '3gxTKGaEYqRTKzWGTV85gw', 28600, 8000, 'Roger Whittaker', 'Ein bisschen Aroma', ['custom', 'schlager', 'deutsch']),
  t('2CuI0AW9srCLZLMStZMift', '3mVXDesOrTDitI8Uvog77C', 66450, 7000, 'David Guetta', 'Memories', ['custom', '00s']),
  t('3sL9Myf7JF1k9TbrXE46ou', '6qYkmqFsXbj8CQjAdbYz07', 61800, 4700, 'The Weeknd', 'Blinding Lights', ['custom', '20s', 'demo']),
  t('0z7pVBGOD7HCIB7S8eLkLI', '6I9VzXrHxO9rA9A5euc8Ak', 200, 6500, 'Britney Spears', 'Toxic', ['custom', '90s']),
  t('5ySxm9hxBNss01WCL7GLyQ', '6sbXGUn9V9ZaLwLdOfpKRE', 45500, 8000, 'Backstreet Boys', 'Larger than Life', ['custom', '90s']),
  t('5ehndLBjIEdFTeHBfRXVoy', '030dULvYNT5n8vYpIak51w', 34500, 6000, 'Heinz Rudolf Kunze', 'Du bist mein ganzes Herz', ['custom', '80s', 'deutsch']),
  t('4XbUZbCiZynKWMCWFoNSbY', '5mFQCdbvuzVATC7tP7XsPp', 500, 4500, 'SNAP!', 'Rhythm Is a Dancer', ['custom', '90s']),
  t('25inOM6M1Vg2y0ow2u0alv', '6E7NeGDgIHObFpEnTNYmSk', 49800, 8150, 'DJ Antoine', 'Welcome to St. Tropez', ['custom', '10s']),
  t('2RMIaqcX5WbXpvW9L6trMz', '2XlylGgQ5Cg9bU4JRMDsCg', 8100, 8150, 'The Dan Band', 'Candy Shop', ['custom', '00s']),
  t('7DykKOPzXFb27tOyyxsAMy', '72cfj9t5LxEkicluIvNmQc', 30600, 7500, 'Lützenkirchen', '3 Tage wach', ['custom', '00s', 'deutsch']),
  t('652N05EcNH1a4bIlUixQE2', '4LJhJ6DQS7NwE7UKtvcM52', 23800, 7500, 'blink-182', "What's My Age Again?", ['custom', '90s']),
  t('7HvIrSkKGJCzd8AKyjTJ6Q', '1FTSo4v6BOZH9QxKc3MbVM', 14500, 7500, 'Blur', 'Song 2', ['custom', '90s']),
  t('3T4tUhGYeRNVUGevb0wThu', '7qiZfU4dY1lWllzX7mPBI3', 0, 4690, 'Ed Sheeran', 'Shape of You', ['custom', '10s', 'demo']),
  t('61h3VS8XDROIpvQznjTPTT', '4UCTgh5jvtqoaMX6MAhUNn', 4000, 6000, 'Depeche Mode', 'Personal Jesus', ['custom', '80s']),
  t('4nKEMLnNGR4v2yXFm5LgoX', '2SRVPr2uTN71JVLtSE8GAt', 31500, 9700, 'Bata Illic', 'Ich möcht’ der Knopf an deiner Bluse sein', ['custom', 'deutsch', 'schlager', 'explicit']),
  t('6RfC9T5yg6IMDib7fBlRk1', '4gjuEu6uE1byUXKkl8JvgT', 0, 8000, 'Claude Morgan', 'El Bimbo', ['custom', '90s']),
  t('2WKYqa8tLHkywDwhwOuvlG', '480llvvXfmFcic8dBHT9pP', 14000, 8300, 'Girl on Couch', 'Man in Finance', ['custom', '20s']),
  t('7klotorvXKINRUDLeioBH1', '6S4KL0Hsc54otJOXeC8MTY', 45100, 7100, 'Sigrid & Marina', 'Zweimal nein heißt einmal ja', ['custom', 'schlager', 'deutsch', 'explicit']),
  t('3wd4ials0jGsnSBoba3keA', '07XCrbFD1IXMXFGCC5nSyM', 35600, 10000, 'Jan Hammer', "Crockett's Theme", ['custom', '80s']),
  t('4r1WecJyt5FOhglysp9zhN', '1B75hgRqe7A4fwee3g3Wmu', 300, 4300, 'MC Hammer', "U Can't Touch This", ['custom', 'rnb', '90s']),
  t('1zzkAbY0FKMPjn56qrgxme', '6yeZM8gyykjaf8w0GqRfK4', 20500, 6500, 'Nina Chuba', 'Wildberry Lillet', ['custom', '20s', 'deutsch', 'demo']),
  t('71Y6kburF8k1qyHycovHy8', '0hSs4vOZo1OkRiAOoLafrT', 12100, 4200, 'The Alan Parsons Project', 'Sirius', ['custom', '80s']),
  t('5jNDWA19BJbE24x1UUJGRY', '1TfqLAPs4K3s2rJMoCokcS', 500, 7600, 'Eurythmics', 'Sweet Dreams', ['custom', '80s']),
  t('5EiyGedU9Qh6cA2UI1q1t4', '0OPQRCqdgAfgghajirG91o', 55700, 7000, 'Andreas Gabalier', 'Halli Hallo', ['custom', 'deutsch']),
  t('6FDUs0DdSW9kwVONDhHASq', '0CiImSC9ZCxleVvlJpeZfW', 40300, 9000, 'B-migos', 'In meiner Hose wohnt ein Iltis', ['custom', 'schlager', 'funny']),
  t('4feSHRP0Xugt1nDWZ1v4x9', '06fTDU8DR3pTESMgOFXR4T', 18500, 8500, 'Howard Carpendale', 'Hello Again', ['schlager', 'funny']),
  t('3WNxdumkSMGMJRhEgK80qx', '3MjUtNVVq3C8Fn0MP3zhXa', 0, 8500, 'Britney Spears', '…Baby One More Time', ['90s']),
  t('518HX24MsR0XmfNJjd3M2O', '4XyYbwXxN1Rm1cEhegGR2J', 63400, 5600, 'Jan Böhmermann', 'Faschismus is back', ['20s', 'deutsch']),
  t('2tne1K96u0liOIzEdDXY2Z', '2BZ8hZDDjpvxa8d1ZESzil', 11550, 6200, 'Kraftklub', 'Kippenautomat', ['20s', 'deutsch']),
  t('0S0KGZnfBGSIssfF54WSJh', '2Fxmhks0bxGSBdJ92vM42m', 60400, 6600, 'Billie Eilish', 'bad guy', ['10s']),
  t('3MnOoZGbCDAjLf8jOImSbg', '1zneM1cLjM6w8BFmukl2Lr', 8000, 7400, 'CeeLo Green', 'Fuck You', ['10s', 'explicit']),
  t('6c8j9xTNn8Aay7WhbdqaHg', '4JWRos6zAz0GyBfCRoeC0C', 6400, 6000, 'NightCrawl', 'Lost Highway', ['20s']),
  t('1fxhzVosrHlnYz27SlDy3e', '1GfLWbfdEzFO1lI9D1TsdF', 48000, 8000, 'The Chemical Brothers', 'Go', ['10s', 'trip hop']),
  t('4umed49HvB2X8x3Kkjf1HO', '0xCXcq4y44uHJtJ7zZDF3d', 55150, 8000, 'Bilderbuch', 'Bungalow', ['10s', 'deutsch']),
  t('2j3dLULErYg2IgQeBqEX1w', '7iNLydOMjLLb7BiwkdoPDU', 14600, 7600, 'Kitschkrieg', 'Gut genug', ['20s', 'deutsch']),
  t('0R7lKm7pMZHjdrY1UVcc02', '1DOVkuzAdnyHgDJXbp92Wq', 44300, 10500, 'makko', 'Inundauswendig', ['20s', 'deutsch']),
  t('4fdgcEVMdJe0KVgupMNJAP', '79CUrU5o2KAVDTNm4x3eGU', 24160, 6000, 'The Prodigy', 'Firestarter', ['90s']),
]

export const TRACK_BY_URI = new Map(TRACKS.map((track) => [track.uri, track]))

export const TAGS = [...new Set(TRACKS.flatMap((track) => track.tags))].sort()
