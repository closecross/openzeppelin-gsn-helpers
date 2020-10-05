const process = require('process');
const envPaths = require('env-paths');
const { createWriteStream, chmodSync, readFileSync, unlinkSync } = require('fs');
const { pathExists, ensureDir } = require('fs-extra');
const { dirname } = require('path');
const axios = require('axios');
const { sha3 } = require('web3-utils');

const REPOSITORY = 'OpenZeppelin/openzeppelin-gsn-helpers';
const VERSION = 'v0.2.1';
const BINARY = 'gsn-relay';
const BINARY_PATH = `${envPaths('gsn').cache}/${BINARY}-${VERSION}`;

async function ensureRelayer(path = BINARY_PATH) {
  console.log("BINARY_PATH", BINARY_PATH)
  if (await hasRelayer(path)) return path;
  await downloadRelayer(path);
  return path;
}

async function hasRelayer(path = BINARY_PATH) {
  return (await pathExists(path));
}

async function downloadRelayer(path = BINARY_PATH) {
  await ensureDir(dirname(path));

  const url = getUrl();
  console.error(`Downloading relayer from ${url}`);
  await downloadFile(url, path);

  console.error(`Relayer downloaded to ${path}`);
  chmodSync(path, '775');
}

function getUrl() {
  const baseUrl = `https://github.com/closecross/gsn-v1-fork/releases/download/v1.0.0-fork/RelayHttpServer`;
  return baseUrl + (getPlatform() === 'windows' ? '.exe' : '');
}

function getPlatform() {
  switch (process.platform) {
    case 'win32':
      return 'windows';
    default:
      return process.platform;
  }
}

function getArch() {
  switch (process.arch) {
    case 'x64':
      return 'amd64';
    case 'x32':
      return '386';
    case 'ia32':
      return '386';
    default:
      return process.arch;
  }
}

function getPath() {
  return PATH;
}

async function downloadFile(url, path) {
  const writer = createWriteStream(path);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

module.exports = {
  ensureRelayer,
  downloadRelayer,
  hasRelayer,
  getUrl,
  getPath,
};
