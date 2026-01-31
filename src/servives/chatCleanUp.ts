import { prisma } from '../lib/prisma';

/**
 * Delete messages older than 24 hours
 * The AI analysis results in ComplaintResult are preserved
 */
export async function cleanupOldMessages() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const deleted = await prisma.message.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo
        }
      }
    });

    console.log(`[Message Cleanup] Deleted ${deleted.count} messages older than 24 hours`);
    return deleted.count;
  } catch (error) {
    console.error('[Message Cleanup] Error:', error);
    throw error;
  }
}

/**
 * Auto-resolve complaints older than 24 hours that are still OPEN or IN_PROGRESS
 * Creates ComplaintResult before resolving
 */
export async function autoResolveOldComplaints() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    // Find complaints older than 24 hours that aren't resolved
    const oldComplaints = await prisma.complaint.findMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo
        },
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      },
      include: {
        messages: {
          select: {
            content: true,
            senderRole: true,
            createdAt: true
          }
        },
        result: true // Check if result already exists
      }
    });

    let resolvedCount = 0;

    for (const complaint of oldComplaints) {
      // Create ComplaintResult if it doesn't exist
      if (!complaint.result) {
        const aiAnalysis = {
          classification: 'Auto-Resolved (24h timeout)',
          summary: `Complaint auto-resolved after 24 hours. Total messages: ${complaint.messages.length}`,
          sentiment: complaint.messages.length > 0 ? 'NEUTRAL' : 'NEGATIVE',
          suggestedResponse: null
        };

        await prisma.complaintResult.create({
          data: {
            complaintId: complaint.id,
            classification: aiAnalysis.classification,
            summary: aiAnalysis.summary,
            sentiment: aiAnalysis.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
            suggestedResponse: aiAnalysis.suggestedResponse
          }
        });
      }

      // Update complaint to RESOLVED with resolvedAt (not resolvedByUserAt)
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),  // Auto-resolved
          resolvedByUserAt: null   // Not resolved by user
        }
      });

      resolvedCount++;
    }

    console.log(`[Auto-Resolve] Auto-resolved ${resolvedCount} complaints older than 24 hours`);
    return resolvedCount;
  } catch (error) {
    console.error('[Auto-Resolve] Error:', error);
    throw error;
  }
}

/**
 * Run both cleanup tasks
 */
export async function runCleanupTasks() {
  console.log('[Cleanup] Starting cleanup tasks...');
  
  // First auto-resolve old complaints (creates ComplaintResults)
  await autoResolveOldComplaints();
  
  // Then delete old messages
  await cleanupOldMessages();
  
  console.log('[Cleanup] Cleanup tasks completed');
}

/**
 * Start the cleanup job that runs every hour
 */
export function startCleanupJob() {
  // Run immediately on startup
  runCleanupTasks().catch(console.error);

  // Then run every hour
  const oneHour = 60 * 60 * 1000;
  setInterval(() => {
    runCleanupTasks().catch(console.error);
  }, oneHour);

  console.log('[Cleanup] Cleanup job started - running every hour');
}