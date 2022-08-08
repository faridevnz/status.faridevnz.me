export const parseMetrics = (metrics: any) => {
  // map txp connections
  const tcp_conn = metrics.stats.network.active_tcp_connections.reduce((acc: any, ip: string) => {
    if (acc[`${ip}`] !== undefined) acc[`${ip}`]++;
    else acc[`${ip}`] = 1;
    return acc;
  }, {});
  return { 
    ...metrics, 
    stats: { 
      ...metrics.stats, 
      network: { 
        ...metrics.stats.network, 
        active_tcp_connections: tcp_conn
      } 
    } 
  }
}