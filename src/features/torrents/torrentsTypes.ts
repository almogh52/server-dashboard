export enum TorrentState {
  Error,
  Completed,
  Paused,
  Queued,
  Seeding,
  Stalled,
  Checking,
  Downloading,
  FetchingMetadata,
  Allocating,
  Moving,
  Unknown,
  MissingFiles,
}

export interface Torrent {
  hash: string;
  addDate: Date;
  completionDate: Date;
  bytesDownloaded: number;
  bytesDownloadedSession: number;
  downloadLimit: number;
  uploadLimit: number;
  eta: number;
  forceStart: boolean;
  magnetUri: string;
  name: string;
  priority: number;
  progress: number;
  savePath: string;
  size: number;
  state: TorrentState;
  downloadSpeed: number;
  downloadSpeedAvg: number;
  uploadSpeed: number;
  uploadSpeedAvg: number;
  bytesUploaded: number;
  bytesUploadedSession: number;
  timeActive: number;
  creationDate: Date;
  creatorComment: string;
  createdBy: string;
  connections: number;
  connectionsLimit: number;
  peers: number;
  totalPeers: number;
  seeds: number;
  totalSeeds: number;
  piecesDownloaded: number;
  totalPieces: number;
  pieceSize: number;
}

export enum TorrentFilePriority {
  SkipDownload = 0,
  Normal = 1,
  Mixed = 3,
  High = 6,
  Maximum = 7,
}

export interface TorrentFile {
  name: string;
  priority: TorrentFilePriority;
  progress: number;
  size: number;
  availability: number;
}

export interface Preferences {
  locale: string;
  createSubfolderEnabled: boolean;
  startPausedEnabled: boolean;
  autoDeleteMode: number;
  preallocateAll: boolean;
  incompleteFilesExt: boolean;
  autoTmmEnabled: boolean;
  torrentChangedTmmEnabled: boolean;
  savePathChangedTmmEnabled: boolean;
  categoryChangedTmmEnabled: boolean;
  savePath: string;
  tempPathEnabled: boolean;
  tempPath: string;
  scanDirs: Record<string, unknown>;
  exportDir: string;
  exportDirFin: string;
  mailNotificationEnabled: boolean;
  mailNotificationSender: string;
  mailNotificationEmail: string;
  mailNotificationSmtp: string;
  mailNotificationSslEnabled: boolean;
  mailNotificationAuthEnabled: boolean;
  mailNotificationUsername: string;
  mailNotificationPassword: string;
  autorunEnabled: boolean;
  autorunProgram: string;
  queueingEnabled: boolean;
  maxActiveDownloads: number;
  maxActiveTorrents: number;
  maxActiveUploads: number;
  dontCountSlowTorrents: boolean;
  slowTorrentDownloadRateThreshold: number;
  slowTorrentUploadRateThreshold: number;
  slowTorrentInactiveTimer: number;
  maxRatioEnabled: boolean;
  maxRatio: number;
  maxRatioAct: boolean;
  listenPort: number;
  upnp: boolean;
  randomPort: boolean;
  downloadLimit: number;
  uploadLimit: number;
  maxConnections: number;
  maxConnectionsPerTorrent: number;
  maxUploads: number;
  maxUploadsPerTorrent: number;
  stopTrackerTimeout: number;
  pieceExtentAffinity: boolean;
  enableUtp: boolean;
  limitUtpRate: boolean;
  limitTcpOverhead: boolean;
  limitLanPeers: boolean;
  altDownloadLimit: number;
  altUploadLimit: number;
  schedulerEnabled: boolean;
  scheduleFromHour: number;
  scheduleFromMin: number;
  scheduleToHour: number;
  scheduleToMin: number;
  schedulerDays: number;
  dht: boolean;
  dhtSameAsBt: boolean;
  dhtPort: number;
  pex: boolean;
  lsd: boolean;
  encryption: number;
  anonymousMode: boolean;
  proxyType: number;
  proxyIp: string;
  proxyPort: number;
  proxyPeerConnections: boolean;
  forceProxy: boolean;
  proxyAuthEnabled: boolean;
  proxyUsername: string;
  proxyPassword: string;
  ipFilterEnabled: boolean;
  ipFilterPath: string;
  ipFilterTrackers: boolean;
  webUiDomainList: string;
  webUiAddress: string;
  webUiPort: number;
  webUiUpnp: boolean;
  webUiUsername: string;
  webUiPassword?: string;
  webUiCsrfProtectionEnabled: boolean;
  webUiClickjackingProtectionEnabled: boolean;
  webUiSecureCookieEnabled: boolean;
  webUiMaxAuthFailCount: number;
  webUiBanDuration: number;
  bypassLocalAuth: boolean;
  bypassAuthSubnetWhitelistEnabled: boolean;
  bypassAuthSubnetWhitelist: string;
  alternativeWebuiEnabled: boolean;
  alternativeWebuiPath: string;
  useHttps: boolean;
  sslKey: string;
  sslCert: string;
  dyndnsEnabled: boolean;
  dyndnsService: number;
  dyndnsUsername: string;
  dyndnsPassword: string;
  dyndnsDomain: string;
  rssRefreshInterval: number;
  rssMaxArticlesPerFeed: number;
  rssProcessingEnabled: boolean;
  rssAutoDownloadingEnabled: boolean;
}
