import { match_groups } from './regexp.js';
import { spawnSync } from 'child_process';
import { loggerInfo } from '../server.js';

// ----------
// VARIABLES

// CPU number
// const CORE_NUMBER_CMD = "lscpu | egrep ^CPU | tail -2 | head -1";
const CORE_NUMBER_CMDS = [{ cmd: 'lscpu', params: [] }, { cmd: 'egrep', params: ['^CPU'] }, { cmd: 'tail', params: ['-2'] }, { cmd: 'head', params: [-1] }]
const CORE_NUMBER_REGEXP = /:\s* (\d+)/gm;

// cpus specs
// const CPU_SPECS_CMD = "cat /proc/cpuinfo | egrep 'vendor_id|cpu MHz|cache size'";
const CPU_SPECS_CMDS = [{ cmd: 'cat', params: ['/proc/cpuinfo'] }, { cmd: 'egrep', params: ['vendor_id|cpu MHz|cache size'] }];
const CPU_SPECS_REGEXPS = [/vendor_id[\s:]*(\w+)/gm, /cpu\sMHz[\s:]*(\d+\.\d+)/gm, /cache\ssize[\s:]*(\d+\s+)KB/gm];
// vendir_id, cpu MHz, cache size in KB

// average cpus % load
// const AVG_CPU_LOAD_CMD = 'sar -P ALL 0';
const AVG_CPU_LOAD_CMDS = [{ cmd: 'sar', params: ['-P', 'ALL', '0'] }];
const AVG_CPU_LOAD_REGEXP = /(\d+|all)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+/gm;
// CPU, user, nice, system, iowait, steal, idle

// average cpus % load
// const CURR_CPU_LOAD_CMD = 'top -bcn1 -1 -w512 | grep '^%Cpu'';
const CURR_CPU_LOAD_CMDS = [{ cmd: 'top', params: ['-bcn1', '-1', '-w512'] }, { cmd: 'grep', params: ['^%Cpu'] }];
const CURR_CPU_LOAD_REGEXP = /(\d+\.\d+)\s*us,\s*(\d+\.\d+)\ssy,\s*(\d+\.\d+)\sni,\s*(\d+\.\d+)\sid,\s*(\d+\.\d+)\s*wa,\s*(\d+\.\d+)\s*hi,\s*(\d+\.\d+)\ssi,\s*(\d+\.\d+)\sst\s*/gm;

// current memory usage
// const CURR_MEMORY_INFO_CMD = 'top -bcn1 -w512 | head -4 | tail -1';
const CURR_MEMORY_INFO_CMDS = [{ cmd: 'top', params: ['-bcn1', '-w512'] }, { cmd: 'head', params: ['-4'] }, { cmd: 'tail', params: ['-1'] }];
const CURR_MEMORY_INFO_REGEXP = /MiB\sMem\s:\s+(\d+\.\d+)\stotal,\s+(\d+\.\d+)\sfree,\s+(\d+\.\d+)\sused,\s+(\d+\.\d+)\sbuff\/cache/gm;
// total, free, used, buff/cache

// current running tasks
// const CURR_RUNNING_TASKS_CMD = 'top -bcn1 -w512 | head -2 | tail -1';
const CURR_RUNNING_TASKS_CMDS = [{ cmd: 'top', params: ['-bcn1', '-w512'] }, { cmd: 'head', params: ['-2'] }, { cmd: 'tail', params: ['-1'] }];
const CURR_RUNNING_TASKS_REGEXP = /Tasks:\s+(\d+)\s+total,\s+(\d+)\s+running,\s+(\d+)\s+sleeping,\s+(\d+)\s+stopped,\s+(\d+)\s+zombie/gm;
// total, running, sleeping, stopped, zombie

// network usage
// const NET_USAGE_CMD = 'sar -n DEV 0 | head -5 | tail -1';
const NET_USAGE_CMDS= [{ cmd: 'sar', params: ['-n', 'DEV', '0'] }, { cmd: 'head', params: ['-5'] }, { cmd: 'tail', params: ['-1'] }];
const NET_USAGE_REGEXP = /eth0\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)/gm

// current TCP active connections
// const TCP_ACTIVE_CMD = 'netstat -ant | grep ESTABLISHED | grep 67.205.153.72:443';
const TCP_ACTIVE_CMDS = [{ cmd: 'netstat', params: ['-ant'] }, { cmd: 'grep', params: ['ESTABLISHED'] }, { cmd: 'grep', params: ['67.205.153.72:443'] }];
const TCP_ACTIVE_REGEXP = /tcp\s+\d+\s+\d+\s+67\.205\.153\.72:443\s+(\d+\.\d+\.\d+\.\d+)/gm

// single command structure: { cmd: '', params: [] }
const exec_command_pipe  = (commands = []) => {
  let out = null;
  commands.forEach(command => {
    out = spawnSync(command.cmd, command.params, { input: out ? out.stdout : undefined, encoding: 'utf-8' });
  });
  return out ? out.stdout : null;
}

// ----------
// FUNCTIONS

/**
 * take the number of the core
 * @returns 
 */
export const core_number = () => {
  return new Promise((resolve) => {
    // run the command
    const output = exec_command_pipe(CORE_NUMBER_CMDS);
    // const output = spawnSync(CORE_NUMBER_CMD, { encoding: 'utf-8' });
    if (!output) resolve(0);
    // match groups
    const groups = match_groups(output, CORE_NUMBER_REGEXP);
    // return data
    resolve(Number(groups[0]));
  });
}

/**
 * CPUs SPECS
 * @returns 
 */
export const cpu_specs = () => {
  return new Promise((resolve) => {
    // run the command
    // const output = spawnSync(CPU_SPECS_CMD, { encoding: 'utf-8' });
    const output = exec_command_pipe(CPU_SPECS_CMDS);
    if (!output) resolve([]);
    loggerInfo.info({ "CPU SPECS OUTPUT": output });
    // match groups ( expected example: [[GenuineIntel, GenuineIntel], [2494.140, 2494.140], [4096, 4096]] )
    const groups = [];
    CPU_SPECS_REGEXPS.forEach(regexp => groups.push(match_groups(output, regexp)));
    // return data
    const result = [];
    for ( let i = 0; i < core_number(); i++ ) {
      result.push({ vendor_id: groups[0][i], frequency: `${groups[1][i]} MHz`, cache_size: `${groups[2][i]} KB` });
    }
    resolve(result);
  })
}

/**
 * AVERAGE CPU LOAD
 * @returns 
 */
export const average_cpu_load = () => {
  return new Promise((resolve) => {
    // run the command
    // const output = spawnSync(AVG_CPU_LOAD_CMD, { encoding: 'utf-8' });
    const output = exec_command_pipe(AVG_CPU_LOAD_CMDS);
    if (!output) resolve({});
    // match groups
    const groups = match_groups(output, AVG_CPU_LOAD_REGEXP);
    loggerInfo.info({ groups: groups });
    // return data
    const result = {};
    for ( let i = 0; i < core_number() + 1; i++ ) {
      const core_number = groups[0 + (i*7)];
      result[core_number] = { user: groups[1 + (i*7)], nice: groups[2 + (i*7)], system: groups[3 + (i*7)], iowait: groups[4 + (i*7)], steal: groups[5 + (i*7)], idle: groups[6 + (i*7)] };
    }
    resolve(result);
  })
}

/**
 * CURRENT CPU LOAD
 * @returns 
 */
 export const current_cpu_load = () => {
  return new Promise((resolve) => {
    // run the command
    const output = exec_command_pipe(CURR_CPU_LOAD_CMDS);
    if (!output) resolve([]);
    loggerInfo.info({ ADD_LOG: output });
    // match groups
    const groups = match_groups(output, CURR_CPU_LOAD_REGEXP);
    loggerInfo.info({ asd_groups: groups });
    // return data
    const result = {};
    for ( let i = 0; i < core_number(); i++ ) {
      const core_number = i;
      result[core_number] = { user: groups[0 + (i*8)], system: groups[1 + (i*8)], nice: groups[2 + (i*8)], idle: groups[3 + (i*8)], iowait: groups[4 + (i*8)], hw_interrupts: groups[5 + (i*8)], sw_interrupts: groups[6 + (i*8)], stolen: groups[7 + (i*8)] };
    }
    resolve(result);
  })
}

/**
 * CURRENT MEMORY INFO
 * @returns
 */
export const current_memory_info = () => {
  return new Promise((resolve) => {
    // run the command
    // const output = spawnSync(CURR_MEMORY_INFO_CMD, { encoding: 'utf-8' });
    const output = exec_command_pipe(CURR_MEMORY_INFO_CMDS);
    if (!output) resolve({});
    // match groups
    const groups = match_groups(output, CURR_MEMORY_INFO_REGEXP);
    // return data
    resolve({ total: groups[0], free: groups[1], used: groups[2], buff_or_cache: groups[3] });
  })
}

/**
 * CURRENT RUNNING TASKS
 * @returns 
 */
export const current_running_tasks = () => {
  return new Promise((resolve) => {
    // run the command
    // const output = spawnSync(CURR_RUNNING_TASKS_CMD, { encoding: 'utf-8' });
    const output = exec_command_pipe(CURR_RUNNING_TASKS_CMDS);
    if (!output) resolve({});
    // match groups
    const groups = match_groups(output, CURR_RUNNING_TASKS_REGEXP);
    // return data
    resolve({ total: groups[0], running: groups[1], sleeping: groups[2], stopped: groups[3], zombie: groups[4] });
  })
}

/**
 * NETWORK USAGE
 * @returns 
 * 
 * rxpck/s    - packets received per second
 * txpck/s    - packets transmitted per second
 * rxkB/s     - kb received per second  
 * txkB/s     - kb transmitted per second
 * rxcmp/s    - packets compressed received per second  
 * txcmp/s    - packets compressed transmitted per second
 * rxmcst/s   - multicast packaets received per second
 * %ifutil    - utilization percentage of the network interface
 */
export const network_usage = () => {
  return new Promise((resolve) => {
    // run the command
    // const output = spawnSync(NET_USAGE_CMD, { encoding: 'utf-8' });
    const output = exec_command_pipe(NET_USAGE_CMDS);
    if (!output) resolve({});
    // match groups
    const groups = match_groups(output, NET_USAGE_REGEXP);
    // return data
    resolve({
      pack_rec_per_second: groups[0],
      pack_sent_per_second: groups[1],
      cpack_rec_per_second: groups[4],
      cpack_sent_per_second: groups[5],
      multicast_pack_rec_per_second: groups[6],
      kb_rec_per_second: groups[2],
      kb_sent_per_second: groups[3],
      utilization_perc: groups[7],
    })
  });
}

/**
 * ACTIVE TCP CONNECTIONS
 * @returns 
 */
export const active_tcp_connections = () => {
  return new Promise((resolve) => {
    // run the command
    // const output = spawnSync(TCP_ACTIVE_CMD, { encoding: 'utf-8' });
    const output = exec_command_pipe(TCP_ACTIVE_CMDS);
    if (!output) resolve([]);
    // match groups
    const groups = match_groups(output, TCP_ACTIVE_REGEXP);
    // return data
    resolve(groups);
  });
}
