import { active_tcp_connections, average_cpu_load, core_number, cpu_specs, current_cpu_load, current_memory_info, current_running_tasks, network_usage } from "./modules/metrics.js";


const [memory_info, core_num, core_cpu_specs, average, current, tasks, usage, tcp_connections] = await Promise.all([current_memory_info(), core_number(), cpu_specs(), average_cpu_load(), current_cpu_load(), current_running_tasks(), network_usage(), active_tcp_connections()]);
const { total, ...memory_load } = memory_info;
console.log({
  cpu: {
    specs: { 
      core_num,
      cores: {
        ...core_cpu_specs, 
      },
    },
    load: {
      average,
      current
    },
  },
  ram: {
    specs: {
      total: total
    },
    load: memory_load,
  },
  stats: {
    tasks,
    network: {
      usage,
      active_tcp_connections: tcp_connections,
    }
  }
});
