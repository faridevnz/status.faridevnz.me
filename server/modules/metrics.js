import { match_groups } from './regexp.js';
import { execSync } from 'child_process';
import { loggerInfo } from '../server.js';

// ----------
// VARIABLES

// CPU number
const CORE_NUMBER_CMD = "lscpu | egrep ^CPU | tail -2 | head -1";
const CORE_NUMBER_REGEXP = /CPU\(s\):\s* (\d+)/gm;

// cpus specs
const CPU_SPECS_CMD = "cat /proc/cpuinfo | egrep 'vendor_id|cpu MHz|cache size'";
const CPU_SPECS_REGEXPS = [/vendor_id[\s:]*(\w+)/gm, /cpu\sMHz[\s:]*(\d+\.\d+)/gm, /cache\ssize[\s:]*(\d+\s+)KB/gm];
// vendir_id, cpu MHz, cache size in KB

// current cpus % load
const CURR_CPU_LOAD_CMD = 'sar -P ALL 0';
const CURR_CPU_LOAD_REGEXP = /(\d+|all)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+/gm;
// CPU, user, nice, system, iowait, steal, idle

// current memory usage
const CURR_MEMORY_INFO_CMD = 'top -bcn1 -w512 | head -4 | tail -1';
const CURR_MEMORY_INFO_REGEXP = /MiB\sMem\s:\s+(\d+\.\d+)\stotal,\s+(\d+\.\d+)\sfree,\s+(\d+\.\d+)\sused,\s+(\d+\.\d+)\sbuff\/cache/gm;
// total, free, used, buff/cache

// current running tasks
const CURR_RUNNING_TASKS_CMD = 'top -bcn1 -w512 | head -2 | tail -1';
const CURR_RUNNING_TASKS_REGEXP = /Tasks:\s+(\d+)\s+total,\s+(\d+)\s+running,\s+(\d+)\s+sleeping,\s+(\d+)\s+stopped,\s+(\d+)\s+zombie/gm;
// total, running, sleeping, stopped, zombie


// ----------
// FUNCTIONS

/**
 * take the number of the core
 * @returns 
 */
export const core_number = () => {
  // run the command
  const output = execSync(CORE_NUMBER_CMD, { encoding: 'utf-8' });
  loggerInfo.info(output);
  // match groups
  const groups = match_groups(output, CORE_NUMBER_REGEXP);
  // return data
  return Number(groups[0]);
}

/**
 * CPUs SPECS
 * @returns 
 */
export const cpu_specs = () => {
  // run the command
  const output = execSync(CPU_SPECS_CMD, { encoding: 'utf-8' });
  // match groups ( expected example: [[GenuineIntel, GenuineIntel], [2494.140, 2494.140], [4096, 4096]] )
  const groups = [];
  CPU_SPECS_REGEXPS.forEach(regexp => groups.push(match_groups(output, regexp)));
  // return data
  const result = [];
  for ( let i = 0; i < core_number(); i++ ) {
    result.push({ vendor_id: groups[0][i], frequency: `${groups[1][i]} MHz`, cache_size: `${groups[2][i]} KB` });
  }
  return result;
}

/**
 * CPU LOAD ( average and per core )
 * @returns 
 */
export const cpu_load = () => {
  // run the command
  const output = execSync(CURR_CPU_LOAD_CMD, { encoding: 'utf-8' });
  // match groups
  const groups = match_groups(output, CURR_CPU_LOAD_REGEXP);
  // return data
  const result = {};
  for ( let i = 0; i < core_number() + 1; i++ ) {
    const core_number = groups[i][0];
    result[core_number] = { user: groups[i][1], nice: groups[i][2], system: groups[i][3], iowait: groups[i][4], steal: groups[i][5], idle: groups[i][6] };
  }
  return result;
}

/**
 * CURRENT MEMORY INFO
 * @returns
 */
export const current_memory_info = () => {
  // run the command
  const output = execSync(CURR_MEMORY_INFO_CMD, { encoding: 'utf-8' });
  // match groups
  const groups = match_groups(output, CURR_MEMORY_INFO_REGEXP);
  // return data
  return { total: groups[0], free: groups[1], used: groups[2], buff_or_cache: groups[3] };
}

/**
 * CURRENT RUNNING TASKS
 * @returns 
 */
export const current_running_tasks = () => {
  // run the command
  const output = execSync(CURR_RUNNING_TASKS_CMD, { encoding: 'utf-8' });
  // match groups
  const groups = match_groups(output, CURR_RUNNING_TASKS_REGEXP);
  // return data
  return { total: groups[0], running: groups[1], sleeping: groups[2], stopped: groups[3], zombie: groups[4] };
}