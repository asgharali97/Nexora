import { prisma } from './prisma';

export async function calculateOrgStats(orgId: string) {
  const [totalEvents, uniqueVisitorsData, activeSessionsData] = await prisma.$transaction([
    prisma.event.count({ where: { orgId } }),
    
    prisma.event.groupBy({
      by: ['visitorsId'],
      where: { 
        orgId,
        visitorsId: { not: null }
      },
    }),
    
    prisma.event.groupBy({
      by: ['sessionId'],
      where: {
        orgId,
        sessionId: { not: null },
        receivedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000)
        }
      },
    }),
  ]);

  return {
    totalEvents,
    uniqueVisitors: uniqueVisitorsData.length,
    activeSessions: activeSessionsData.length,
  };
}