export type MirrorFileMeta = {
  name: string;
  type: string;
  mtime: string;
  size: number;
};

export type MirrorDirMeta = Array<MirrorFileMeta>;

export type RyusakShaders = {
  [key: string]: number;
};

export type RyusakEmulatorConfig = {
  path: string,
  name: string,
  isDefault?: boolean,
  selected?: boolean
};

export enum LS_KEYS {
  CONFIG = "v2-emulators-bin",
  TOS = "v2-tos",
  TAB = "v2-tab",
  ESHOP_UPDATE = "ryusak-eshop-update-date-2",
  LOCALE = "ryusak-locale"
}

export type RyusakEmulatorMode = {
  mode: "global" | "portable" | "fitgirl" | "pinejinx" | "pinejinxLdn",
  dataPath: string
};

export type RyusakEmulatorGames = string[];

export type RyusakEmulatorGame = {
  title: string,
  img: string
};

export type RyusakDownload = {
  filename: string,
  progress: number,
  downloadSpeed: number,
};

export type GithubLabel = {
  color: string;
  description: string;
  name: string;
};

export type GithubIssue = {
  items: {
    state: string;
    labels: GithubLabel[];
  }[];
  mode?: "id" | "name";
};

export type GameBananaMod = {
  name: string,
  url: string,
  cover: string,
};

export type Settings = {
  proxy?: string,
};
