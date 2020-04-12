"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CONFIG = void 0;
var CONFIG = {
  local_server_path: "/home/suso/ihw/tableAnnotator/Server",
  port: 6541,
  port_ui: 7531,
  host: "sephirhome.ddns.net",
  // localhost if testing?.
  db: {
    user: 'postgres',
    host: 'localhost',
    database: 'ihw_annotator',
    password: 'melacome86',
    port: 5432
  }
};
exports.CONFIG = CONFIG;