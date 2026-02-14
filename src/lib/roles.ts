// Role detection utilities for jobs and projects

export type JobRole = 'CLIENT' | 'VISITOR';
export type ProjectRole = 'CLIENT' | 'FREELANCER' | null;

interface Job {
    created_by: string;
    [key: string]: any;
}

interface Project {
    client_id: string;
    freelancer_id: string;
    [key: string]: any;
}

/**
 * Determines user's role in a job
 * @param job - The job object
 * @param userId - Current user's ID
 * @returns 'CLIENT' if user posted the job, 'VISITOR' otherwise
 */
export function getUserRoleInJob(job: Job, userId: string | undefined): JobRole {
    if (!userId) return 'VISITOR';
    if (job.created_by === userId) return 'CLIENT';
    return 'VISITOR';
}

/**
 * Determines user's role in a project
 * @param project - The project object
 * @param userId - Current user's ID
 * @returns 'CLIENT', 'FREELANCER', or null if no access
 */
export function getUserRoleInProject(project: Project, userId: string | undefined): ProjectRole {
    if (!userId) return null;
    if (project.client_id === userId) return 'CLIENT';
    if (project.freelancer_id === userId) return 'FREELANCER';
    return null;
}

/**
 * Checks if user can view a job
 * @param job - The job object
 * @param userId - Current user's ID
 * @returns true if user can view the job
 */
export function canViewJob(job: Job, userId: string | undefined): boolean {
    // All users can view open jobs
    return true;
}

/**
 * Checks if user can apply to a job
 * @param job - The job object
 * @param userId - Current user's ID
 * @returns true if user can apply
 */
export function canApplyToJob(job: Job, userId: string | undefined): boolean {
    if (!userId) return false;
    // User cannot apply to their own job
    if (job.created_by === userId) return false;
    // Job must be open
    if (job.status !== 'open') return false;
    return true;
}

/**
 * Checks if user can view project
 * @param project - The project object
 * @param userId - Current user's ID
 * @returns true if user is client or freelancer
 */
export function canViewProject(project: Project, userId: string | undefined): boolean {
    const role = getUserRoleInProject(project, userId);
    return role !== null;
}

/**
 * Checks if user can approve milestones
 * @param project - The project object
 * @param userId - Current user's ID
 * @returns true if user is the client
 */
export function canApproveMilestones(project: Project, userId: string | undefined): boolean {
    return getUserRoleInProject(project, userId) === 'CLIENT';
}

/**
 * Checks if user can submit milestone work
 * @param project - The project object
 * @param userId - Current user's ID
 * @returns true if user is the freelancer
 */
export function canSubmitWork(project: Project, userId: string | undefined): boolean {
    return getUserRoleInProject(project, userId) === 'FREELANCER';
}

/**
 * Gets role display name
 * @param role - The role
 * @returns Formatted role name
 */
export function getRoleDisplayName(role: JobRole | ProjectRole): string {
    switch (role) {
        case 'CLIENT':
            return 'Client';
        case 'FREELANCER':
            return 'Freelancer';
        case 'VISITOR':
            return 'Visitor';
        default:
            return 'Unknown';
    }
}
 