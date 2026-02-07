import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRejectionThresholds() {
  // Get all proposals without rejection threshold
  const proposals = await prisma.editProposal.findMany({
    where: {
      rejectionThreshold: null
    }
  })

  console.log(`Found ${proposals.length} proposals without rejection threshold`)

  for (const proposal of proposals) {
    // Calculate rejection threshold based on proposer tier
    let rejectionThreshold = -5 // Default for tier 1
    
    if (proposal.proposerTier === 2) {
      rejectionThreshold = -3
    } else if (proposal.proposerTier >= 3) {
      rejectionThreshold = 0 // No rejection needed for tier 3+
    }

    await prisma.editProposal.update({
      where: { id: proposal.id },
      data: { rejectionThreshold }
    })

    console.log(`Updated proposal #${proposal.id} (tier ${proposal.proposerTier}) with threshold ${rejectionThreshold}`)
  }

  console.log('Done!')
}

fixRejectionThresholds()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
