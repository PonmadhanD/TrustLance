// Arbitrator system utilities

export interface ArbitratorProfile {
    user_id: string;
    tokens: number;
    specializations: string[];
    is_eligible: boolean;
    is_verified: boolean;
    completed_arbitrations: number;
    accuracy_score: number;
    total_earnings: number;
}

export interface ArbitrationGig {
    id: string;
    arbitrator_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'BOOKED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    specializations: string[];
    disputes_handled: number;
    earnings: number;
}

export interface Dispute {
    id: string;
    project_id: string;
    raised_by: 'CLIENT' | 'FREELANCER';
    reason: string;
    amount: number;
    domain: string;
    status: 'PENDING' | 'ASSIGNED' | 'RESOLVED' | 'ESCALATED';
    arbitrator_id?: string;
    decision?: 'RELEASE' | 'REFUND' | 'PARTIAL';
    evidence: any[];
}

// Constants
export const TOKENS_PER_PROJECT = 30;
export const TOKENS_REQUIRED_FOR_ARBITRATOR = 3000;
export const CANCELLATION_PENALTY = 10; // ₹10
export const MIN_BOOKING_ADVANCE_HOURS = 1;
export const MAX_SPECIALIZATIONS = 3;

export const SPECIALIZATION_DOMAINS = [
    'Frontend Development',
    'Backend Development',
    'Mobile Development',
    'UI/UX Design',
    'Blockchain',
    'Data Science',
    'DevOps',
    'QA Testing',
    'Content Writing',
    'Digital Marketing'
];

/**
 * Check if user is eligible to become arbitrator
 */
export function isEligibleForArbitrator(tokens: number, isVerified: boolean): boolean {
    return tokens >= TOKENS_REQUIRED_FOR_ARBITRATOR && isVerified;
}

/**
 * Calculate tokens from completed projects
 */
export function calculateTokens(completedProjects: number): number {
    return completedProjects * TOKENS_PER_PROJECT;
}

/**
 * Calculate projects needed for eligibility
 */
export function projectsNeededForEligibility(currentTokens: number): number {
    const tokensNeeded = Math.max(0, TOKENS_REQUIRED_FOR_ARBITRATOR - currentTokens);
    return Math.ceil(tokensNeeded / TOKENS_PER_PROJECT);
}

/**
 * Validate gig booking time (must be at least 1 hour in advance)
 */
export function canBookGig(gigStartTime: Date): boolean {
    const now = new Date();
    const hoursUntilStart = (gigStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilStart >= MIN_BOOKING_ADVANCE_HOURS;
}

/**
 * Calculate cancellation penalty
 */
export function getCancellationPenalty(gigStartTime: Date): number {
    const now = new Date();
    const hoursUntilStart = (gigStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If gig already started or is within 1 hour, full penalty
    if (hoursUntilStart < MIN_BOOKING_ADVANCE_HOURS) {
        return CANCELLATION_PENALTY;
    }

    // Otherwise, standard penalty
    return CANCELLATION_PENALTY;
}

/**
 * Check if arbitrator can handle dispute based on specialization
 */
export function canHandleDispute(
    arbitratorSpecs: string[],
    disputeDomain: string
): boolean {
    return arbitratorSpecs.includes(disputeDomain);
}

/**
 * Calculate arbitration commission
 */
export function calculateArbitrationCommission(
    disputeAmount: number,
    commissionPercentage: number = 2
): number {
    return (disputeAmount * commissionPercentage) / 100;
}

/**
 * Get available gig slots for a date
 */
export function getGigSlotsForDate(date: Date): string[] {
    const slots: string[] = [];
    for (let hour = 9; hour <= 21; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`);
    }
    return slots;
}

/**
 * Format gig time slot
 */
export function formatGigSlot(startHour: number): string {
    return `${startHour.toString().padStart(2, '0')}:00-${(startHour + 1).toString().padStart(2, '0')}:00`;
}
 