import { active_tcp_connections, average_cpu_load, core_number, cpu_specs, current_cpu_load, current_memory_info, current_running_tasks, network_usage } from "./modules/metrics.js";


const { total, ...memory_load } = current_memory_info();
const res = {
  cpu: {
    specs: { 
      core_num: core_number() ,
      cores: {
        ...cpu_specs(), 
      },
    },
    load: {
      average: average_cpu_load(),
      current: current_cpu_load()
    },
  },
  ram: {
    specs: {
      total: total
    },
    load: memory_load,
  },
  stats: {
    tasks: current_running_tasks(),
    network: {
      usage: network_usage(),
      active_tcp_connections: active_tcp_connections()
    }
  }
};

console.log(res);