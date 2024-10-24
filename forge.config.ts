import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG, MakerDMGConfig } from '@electron-forge/maker-dmg';
import { PublisherGithub, PublisherGitHubConfig } from '@electron-forge/publisher-github'
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const dmgConfig: MakerDMGConfig = {
  appPath: 'dummy',
  icon: './assets/polis_icon.png'
};

const githubConfig: PublisherGitHubConfig = {
  repository: {
    name: "artnet-sender",
    owner: "polis-interactive"
  },
  prerelease: true
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/polis_icon.png',
    name: 'Artnet Sender',
    osxSign: {},
    osxNotarize: {
      appleId: process.env['APPLE_ID'] ?? '',
      appleIdPassword: process.env['APPLE_ID_PASSWORD'] ?? '',
      teamId: process.env['APPLE_TEAM_ID'] ?? '',
    }
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerDMG(dmgConfig), new MakerRpm({}), new MakerDeb({})],
  publishers: [new PublisherGithub(githubConfig)],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/frontend/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
