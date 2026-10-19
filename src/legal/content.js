// Impressum (§ 5 DDG) and Datenschutzerklärung (Art. 13 DSGVO).
// German is the legally binding version; English is a convenience translation.
//
// Blocks: { h }, { p }, { lines: [] } (address), { ul: [] }.
// URLs and email addresses in text become links; [[…]] marks a missing
// operator detail (see ./operator.js) and is rendered highlighted.
//
// Keep this in sync with what the app actually does: hosting, browser
// storage, Spotify scopes (src/lib/spotify.js). Update LEGAL_UPDATED when
// you change it.

const GITHUB_PRIVACY = 'https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement'
const SPOTIFY_PRIVACY = 'https://www.spotify.com/legal/privacy-policy/'
const SPOTIFY_APPS = 'https://www.spotify.com/account/apps/'

const or = (value, placeholder) => (value && String(value).trim()) || `[[${placeholder}]]`

function formatDate(iso, locale) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(new Date(iso))
}

export function legalContent(lang, op, updated) {
  return lang === 'de' ? german(op, updated) : english(op, updated)
}

function german(op, updated) {
  const name = or(op.name, 'Vor- und Nachname')
  const address = [or(op.street, 'Straße und Hausnummer'), `${or(op.postalCode, 'PLZ')} ${or(op.city, 'Ort')}`, 'Deutschland']
  const email = or(op.email, 'E-Mail-Adresse')
  const phone = or(op.phone, 'Telefonnummer')

  return {
    imprint: [
      { h: 'Angaben gemäß § 5 DDG' },
      { lines: [name, ...address] },
      { h: 'Kontakt' },
      { lines: [`E-Mail: ${email}`, `Telefon: ${phone}`] },
      { h: 'Hinweis' },
      {
        p: 'Music Memory ist ein privates, nicht kommerzielles Projekt. Es steht in keiner Verbindung zu Spotify AB und wird von Spotify weder unterstützt noch gesponsert. „Spotify“ ist eine Marke der Spotify AB.',
      },
      {
        p: 'Die Musik wird ausschließlich über das eigene Spotify-Konto der Nutzerinnen und Nutzer abgespielt. Auf dieser Website werden keine Musikdateien gespeichert oder verbreitet.',
      },
    ],
    privacy: [
      { h: '1. Verantwortlicher' },
      { p: 'Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:' },
      { lines: [name, ...address, `E-Mail: ${email}`] },

      { h: '2. Überblick' },
      {
        p: 'Diese Website verwendet keine Cookies, keine Analyse- oder Tracking-Werkzeuge und keine Werbung. Schriftarten und Icons werden von dieser Website selbst ausgeliefert; es werden keine Inhalte von Drittanbietern wie Google Fonts nachgeladen. Der Betreiber erhält keine Daten aus Ihrem Spiel oder Ihrem Spotify-Konto.',
      },

      { h: '3. Hosting über GitHub Pages' },
      {
        p: 'Diese Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der Website verarbeitet GitHub technisch notwendige Daten, insbesondere Ihre IP-Adresse, die nach Angaben von GitHub zu Sicherheitszwecken protokolliert und gespeichert wird, sowie Datum und Uhrzeit des Abrufs, die abgerufene Datei und Angaben zu Ihrem Browser (Server-Logfiles).',
      },
      {
        p: 'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in der sicheren und zuverlässigen Bereitstellung der Website. GitHub kann Daten in den USA verarbeiten. GitHub nimmt am EU-U.S. Data Privacy Framework teil; die Übermittlung stützt sich auf den Angemessenheitsbeschluss der Europäischen Kommission (Art. 45 DSGVO).',
      },
      { p: `Weitere Informationen: ${GITHUB_PRIVACY}` },

      { h: '4. Speicherung in Ihrem Browser' },
      {
        p: 'Damit das Spiel funktioniert, speichert die Website folgende Daten lokal in Ihrem Browser (localStorage und sessionStorage):',
      },
      {
        ul: [
          'Spielstand sowie Einstellungen wie Spielernamen, Filter, Spielfeldgröße, Sprache und Debug-Modus',
          'die von Ihnen eingegebene Spotify Client ID und das ausgewählte Wiedergabegerät',
          'die Zugangstoken Ihrer Spotify-Anmeldung und während der Anmeldung einen einmaligen Prüfwert',
        ],
      },
      {
        p: 'Diese Daten werden nicht an den Betreiber übertragen; die Zugangstoken werden nur an Spotify gesendet. Die Speicherung ist unbedingt erforderlich, um den von Ihnen ausdrücklich gewünschten Dienst bereitzustellen (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können die Daten jederzeit löschen, indem Sie die Website-Daten in Ihrem Browser löschen; über „Abmelden“ in den Einstellungen werden die Spotify-Zugangstoken entfernt.',
      },

      { h: '5. Verbindung mit Spotify' },
      {
        p: 'Für die Musikwiedergabe verbindet sich die Website mit Spotify (Spotify AB, Regeringsgatan 19, 111 53 Stockholm, Schweden). Dazu legen Sie eine eigene Spotify-App an und melden sich direkt bei Spotify an (OAuth 2.0 mit PKCE). Ihr Browser kommuniziert dabei unmittelbar mit Spotify; der Betreiber erhält keine Daten.',
      },
      { p: 'Mit Ihrer Zustimmung im Anmeldedialog von Spotify greift die Website auf Folgendes zu:' },
      {
        ul: [
          'Profildaten: Anzeigename, Nutzer-ID, E-Mail-Adresse, Profilbild, Land und Abo-Typ',
          'Ihre verfügbaren Wiedergabegeräte und den aktuellen Wiedergabestatus',
          'die Steuerung der Wiedergabe auf dem ausgewählten Gerät (Abspielen und Pausieren der Ausschnitte)',
        ],
      },
      {
        p: 'Diese Daten werden nur in Ihrem Browser angezeigt bzw. verwendet. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch die Anmeldung erteilen. Sie können die Verbindung jederzeit über „Abmelden“ in den Einstellungen trennen und den Zugriff der App in Ihrem Spotify-Konto widerrufen: ' +
          SPOTIFY_APPS,
      },
      { p: `Spotify verarbeitet Daten in eigener Verantwortung. Es gilt die Datenschutzerklärung von Spotify: ${SPOTIFY_PRIVACY}` },

      { h: '6. Ihre Rechte' },
      {
        p: 'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO).',
      },
      {
        p: `Da der Betreiber selbst keine personenbezogenen Daten über Sie speichert, betreffen diese Rechte vor allem die Verarbeitung durch GitHub und Spotify; Sie können sie auch direkt dort geltend machen. Für Anfragen an den Betreiber: ${email}`,
      },
      {
        p: 'Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts (Art. 77 DSGVO).',
      },
      { p: 'Die Bereitstellung Ihrer Daten ist weder gesetzlich noch vertraglich vorgeschrieben. Ohne Spotify-Anmeldung kann das Spiel jedoch keine Musik abspielen.' },

      { h: '7. Stand' },
      { p: formatDate(updated, 'de') },
    ],
  }
}

function english(op, updated) {
  const name = or(op.name, 'First and last name')
  const address = [or(op.street, 'Street and number'), `${or(op.postalCode, 'Postcode')} ${or(op.city, 'City')}`, 'Germany']
  const email = or(op.email, 'Email address')
  const phone = or(op.phone, 'Phone number')

  return {
    imprint: [
      { h: 'Information pursuant to § 5 DDG (German Digital Services Act)' },
      { lines: [name, ...address] },
      { h: 'Contact' },
      { lines: [`Email: ${email}`, `Phone: ${phone}`] },
      { h: 'Note' },
      {
        p: 'Music Memory is a private, non-commercial project. It is not affiliated with, endorsed or sponsored by Spotify AB. “Spotify” is a trademark of Spotify AB.',
      },
      {
        p: 'Music is played exclusively through the user’s own Spotify account. No music files are stored or distributed on this website.',
      },
    ],
    privacy: [
      { h: '1. Controller' },
      { p: 'The controller responsible for data processing on this website within the meaning of the General Data Protection Regulation (GDPR) is:' },
      { lines: [name, ...address, `Email: ${email}`] },

      { h: '2. Overview' },
      {
        p: 'This website uses no cookies, no analytics or tracking tools and no advertising. Fonts and icons are served by this website itself; no content is loaded from third parties such as Google Fonts. The operator receives no data from your game or your Spotify account.',
      },

      { h: '3. Hosting on GitHub Pages' },
      {
        p: 'This website is served via GitHub Pages, a service of GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. When you open the website, GitHub processes technically necessary data, in particular your IP address, which according to GitHub is logged and stored for security purposes, as well as the date and time of access, the file requested and information about your browser (server log files).',
      },
      {
        p: 'The legal basis is Art. 6(1)(f) GDPR; the legitimate interest is providing the website securely and reliably. GitHub may process data in the USA. GitHub participates in the EU-U.S. Data Privacy Framework; transfers are based on the European Commission’s adequacy decision (Art. 45 GDPR).',
      },
      { p: `More information: ${GITHUB_PRIVACY}` },

      { h: '4. Storage in your browser' },
      { p: 'For the game to work, the website stores the following data locally in your browser (localStorage and sessionStorage):' },
      {
        ul: [
          'the game state and settings such as player names, filters, board size, language and debug mode',
          'the Spotify Client ID you entered and the selected playback device',
          'the access tokens of your Spotify login and, during login, a one-time verification value',
        ],
      },
      {
        p: 'This data is not transmitted to the operator; the access tokens are only sent to Spotify. Storing it is strictly necessary to provide the service you explicitly requested (§ 25(2) No. 2 TDDDG, German Telecommunications Digital Services Data Protection Act). You can delete the data at any time by clearing this website’s data in your browser; “Log out” in the settings removes the Spotify access tokens.',
      },

      { h: '5. Connection to Spotify' },
      {
        p: 'To play music, the website connects to Spotify (Spotify AB, Regeringsgatan 19, 111 53 Stockholm, Sweden). You create your own Spotify app and log in directly with Spotify (OAuth 2.0 with PKCE). Your browser communicates directly with Spotify; the operator receives no data.',
      },
      { p: 'With your consent in Spotify’s login dialog, the website accesses:' },
      {
        ul: [
          'profile data: display name, user ID, email address, profile picture, country and subscription type',
          'your available playback devices and the current playback state',
          'playback control on the selected device (playing and pausing the snippets)',
        ],
      },
      {
        p: 'This data is only displayed or used in your browser. The legal basis is your consent (Art. 6(1)(a) GDPR), given by logging in. You can disconnect at any time via “Log out” in the settings and revoke the app’s access in your Spotify account: ' +
          SPOTIFY_APPS,
      },
      { p: `Spotify processes data under its own responsibility; Spotify’s privacy policy applies: ${SPOTIFY_PRIVACY}` },

      { h: '6. Your rights' },
      {
        p: 'You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and to object to processing (Art. 21 GDPR). You can withdraw consent at any time with effect for the future (Art. 7(3) GDPR).',
      },
      {
        p: `As the operator does not store any personal data about you, these rights mainly concern processing by GitHub and Spotify; you can also exercise them directly there. Requests to the operator: ${email}`,
      },
      {
        p: 'You also have the right to lodge a complaint with a data protection supervisory authority, in particular in the Member State of your habitual residence (Art. 77 GDPR).',
      },
      { p: 'Providing your data is neither legally nor contractually required. Without a Spotify login, however, the game cannot play music.' },

      { h: '7. Last updated' },
      { p: formatDate(updated, 'en') },
    ],
  }
}
